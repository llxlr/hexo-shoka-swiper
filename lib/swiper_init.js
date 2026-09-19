(function() {
  'use strict';

  function initSwiper() {
    // Destroy any stale instance first
    if (window.swiper && window.swiper.destroy) {
      window.swiper.destroy(true, true);
      window.swiper = null;
    }

    // Only proceed if the carousel container exists
    var el = document.querySelector('.blog-slider');
    if (!el) return;

    window.swiper = new Swiper('.blog-slider', {
      spaceBetween: 30,
      effect: 'fade',
      loop: true,
      autoplay: {
        disableOnInteraction: true,
        delay: 3000
      },
      mousewheel: true,
      pagination: {
        el: '.blog-slider__pagination',
        clickable: true,
      }
    });

    var container = document.getElementById('swiper_container');
    if (container !== null) {
      container.onmouseenter = function() {
        window.swiper.autoplay.stop();
      };
      container.onmouseleave = function() {
        window.swiper.autoplay.start();
      };
    }

    /* 视频播放管理：切换 slide 时暂停所有视频，播放当前 active slide 的视频 */
    function pauseAllVideos() {
      var allSlides = document.querySelectorAll('.blog-slider__item');
      allSlides.forEach(function(slide) {
        var video = slide.querySelector('video');
        if (video && !video.paused) {
          video.pause();
        }
        var iframe = slide.querySelector('.blog-slider__video-embed iframe');
        if (iframe && iframe.contentWindow) {
          try { iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch(_) {}
        }
      });
    }

    function playActiveVideo() {
      var activeSlide = document.querySelector('.blog-slider__item.swiper-slide-active');
      if (!activeSlide) return;
      var video = activeSlide.querySelector('video');
      if (video && video.paused) {
        video.play().catch(function() {});
      }
    }

    window.swiper.on('slideChange', function() {
      pauseAllVideos();
      setTimeout(playActiveVideo, 400); /* 等待 fade 过渡完成 */
    });
  }

  /* 在 PJAX 事件中注入 HTML（如需要）+ 初始化 Swiper */
  function pjaxMount() {
    var cfg = window.__SWIPER_CONFIG__;
    if (!cfg) return;

    /* 路径匹配 */
    var cpage = location.pathname;
    if (cfg.exclude && cfg.exclude.some(function(e) { return cpage.indexOf(e) !== -1; })) return;
    if (cfg.epage !== 'all' && cfg.epage !== cpage) return;

    /* 注入 HTML（PJAX 回航时 DOM 已被替换，需要重新注入） */
    var parent = cfg.get_layout();
    if (!parent) return;
    if (!parent.querySelector('.blog-slider')) {
      parent.insertAdjacentHTML(cfg.insertposition, cfg.html);
    }

    /* 初始化 Swiper */
    initSwiper();
  }

  // ---- First load ----
  initSwiper();

  // ---- PJAX lifecycle (Shoka / compatible themes) ----
  // Clean up before navigation
  document.addEventListener('pjax:send', function() {
    if (window.swiper && window.swiper.destroy) {
      window.swiper.destroy(true, true);
      window.swiper = null;
    }
    // 销毁所有文章内 swiper 实例
    destroyArticleSwipers();
  });

  // Inject HTML + init after content replacement (Shoka 触发 pjax:success)
  document.addEventListener('pjax:success', function() {
    pjaxMount();
    initArticleSwipers();
    initGkSwipers();
  });

  // ==================== 文章内 Swiper 管理 ====================
  window.__articleSwipers__ = window.__articleSwipers__ || [];

  function initArticleSwipers() {
    var containers = document.querySelectorAll('.article-swiper');
    containers.forEach(function(el) {
      // 跳过已初始化的
      if (el.swiper) return;
      var cfg;
      try {
        cfg = JSON.parse(el.getAttribute('data-swiper-config') || '{}');
      } catch(_) { cfg = {}; }
      var isCard = cfg.style === 'card';
      var isGk = cfg.style === 'gk';

      // autoplay: false → disabled; number → delay in ms; default 3000
      var autoplayDelay = cfg.autoplay !== 'false' ? parseInt(cfg.autoplay, 10) || 3000 : 0;
      var mousewheel = cfg.mousewheel !== false; // default true

      var swiperOpts = {
        autoHeight: !isCard,
        effect: cfg.effect || 'slide',
        loop: true,
        autoplay: autoplayDelay > 0 ? {
          delay: autoplayDelay,
          disableOnInteraction: true,
        } : false,
        mousewheel: mousewheel ? {
          releaseOnEdges: false,
        } : false,
        navigation: !isCard ? {
          nextEl: el.querySelector('.swiper-button-next'),
          prevEl: el.querySelector('.swiper-button-prev'),
        } : false,
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true,
        },
        on: {
          slideChange: function() {
            // 切换时暂停视频
            var slides = el.querySelectorAll('.swiper-slide');
            slides.forEach(function(s) {
              var v = s.querySelector('video');
              if (v && !v.paused) v.pause();
              var ifr = s.querySelector('iframe');
              if (ifr && ifr.contentWindow) {
                try { ifr.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch(_) {}
              }
            });
          }
        }
      };

      el.swiper = new Swiper(el, swiperOpts);
      window.__articleSwipers__.push(el.swiper);

      // Shoka 主题 gk 卡片等使用 data-src 懒加载，而轮播的 slide 可能位于视口之外，
      // 初始化时补全 src，避免切换过去之后图片才开始加载。
      el.querySelectorAll('img[data-src]').forEach(function(img) {
        if (!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src'));
      });

      // 卡片 / gk 模式：鼠标悬停暂停/恢复自动播放（与首页行为一致）
      if (isCard || isGk) {
        el.onmouseenter = function() {
          if (el.swiper && el.swiper.autoplay) el.swiper.autoplay.stop();
        };
        el.onmouseleave = function() {
          if (el.swiper && el.swiper.autoplay) el.swiper.autoplay.start();
        };
      }
    });
  }

  function destroyArticleSwipers() {
    var list = window.__articleSwipers__;
    while (list.length) {
      var s = list.pop();
      if (s && s.destroy) { try { s.destroy(true, true); } catch(_) {} }
    }
    // 清理 DOM 引用
    var containers = document.querySelectorAll('.article-swiper');
    containers.forEach(function(el) { el.swiper = null; });
    var gkContainers = document.querySelectorAll('.gk-swiper');
    gkContainers.forEach(function(el) { el.gkSwiper = null; });
  }

  // ==================== gk 卡片多图轮播 ====================
  /* 多图条目在构建期（index.js 的 after_post_render）就被转换成 .gk-swiper 结构，
     总开关与条目开关也已在构建期决定，这里只负责初始化实例。 */

  /* 图片使用 data-src 懒加载，非当前 slide 在视口外不会触发加载，切换时主动补 src */
  function loadGkImages(inst) {
    if (!inst || !inst.slides || !inst.slides.length) return;
    [inst.activeIndex, inst.activeIndex + 1].forEach(function(i) {
      var slide = inst.slides[i % inst.slides.length];
      if (!slide) return;
      slide.querySelectorAll('img[data-src]').forEach(function(img) {
        if (!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src'));
      });
    });
  }

  function initGkSwipers() {
    // 资源没加载成功时保持构建期输出的静态结构
    if (typeof Swiper === 'undefined') return;
    var containers = document.querySelectorAll('.gk-swiper');
    containers.forEach(function(el) {
      if (el.gkSwiper) return;
      var delay = parseInt(el.getAttribute('data-autoplay'), 10);
      if (isNaN(delay) || delay < 0) delay = 0;
      var slideCount = el.querySelectorAll('.swiper-slide').length;

      var inst = new Swiper(el, {
        effect: 'slide',
        loop: slideCount > 2,
        autoHeight: true,
        grabCursor: true,
        autoplay: delay > 0 ? { delay: delay, disableOnInteraction: true } : false,
        navigation: {
          nextEl: el.querySelector('.swiper-button-next'),
          prevEl: el.querySelector('.swiper-button-prev')
        },
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true
        },
        on: {
          init: function() { loadGkImages(this); },
          slideChange: function() { loadGkImages(this); }
        }
      });
      el.gkSwiper = inst;
      window.__articleSwipers__.push(inst);
      loadGkImages(inst);
    });
  }

  // 首次加载初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initArticleSwipers();
      initGkSwipers();
    });
  } else {
    initArticleSwipers();
    initGkSwipers();
  }
})();
