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
    initGkGalleries();
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
  }

  // ==================== gk 卡片多图轮播 ====================
  /* 主题的 gk 卡片在条目有多张图片时输出 .gk-img > .gallery（默认纵向堆叠），
     这里把它原地升级为 Swiper 轮播，保留原有 DOM 属性与 data-src 懒加载。 */

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

  /* 条目开关：.gk-img[data-gk-carousel="on|off"]（主题 gk 标签按 item 的 carousel 字段输出），
     没有标记时跟随全局默认 window.__GK_CAROUSEL_DEFAULT__ */
  function gkCarouselEnabled(box) {
    var holder = box.closest('[data-gk-carousel]');
    var flag = holder ? String(holder.getAttribute('data-gk-carousel')).toLowerCase() : '';
    if (flag === 'on' || flag === 'true' || flag === '1') return true;
    if (flag === 'off' || flag === 'false' || flag === '0') return false;
    return window.__GK_CAROUSEL_DEFAULT__ !== false;
  }

  function initGkGalleries() {
    // 资源没加载成功时保持主题原有的纵向堆叠
    if (typeof Swiper === 'undefined') return;
    var galleries = document.querySelectorAll('.gk-img .gallery');
    galleries.forEach(function(box) {
      // 已处理过：on = 已轮播，off = 按开关保持纵向堆叠
      if (box.getAttribute('data-gk-swiper')) return;
      var imgs = Array.prototype.slice.call(box.querySelectorAll('img'));
      if (imgs.length < 2) return;
      if (!gkCarouselEnabled(box)) {
        box.setAttribute('data-gk-swiper', 'off');
        return;
      }
      box.setAttribute('data-gk-swiper', 'on');

      var wrapper = document.createElement('div');
      wrapper.className = 'swiper-wrapper';
      imgs.forEach(function(img) {
        var slide = document.createElement('div');
        slide.className = 'swiper-slide';
        /* gk 数据里的 style: zoom:xx% 是为纵向堆叠准备的缩放，轮播里统一还原，
           否则图片会明显小于同页的单图卡片；需要保留可在自定义 CSS 里覆盖。 */
        if (img.style && img.style.zoom) img.style.zoom = '';
        slide.appendChild(img);
        wrapper.appendChild(slide);
      });

      var prev = document.createElement('div');
      prev.className = 'swiper-button-prev gk-nav gk-nav--prev';
      var next = document.createElement('div');
      next.className = 'swiper-button-next gk-nav gk-nav--next';
      var dots = document.createElement('div');
      dots.className = 'swiper-pagination gk-dots';

      box.classList.add('swiper', 'gk-swiper');
      box.appendChild(wrapper);
      box.appendChild(prev);
      box.appendChild(next);
      box.appendChild(dots);

      var inst = new Swiper(box, {
        effect: 'slide',
        loop: imgs.length > 2,
        autoHeight: true,
        grabCursor: true,
        navigation: { nextEl: next, prevEl: prev },
        pagination: { el: dots, clickable: true },
        on: {
          init: function() { loadGkImages(this); },
          slideChange: function() { loadGkImages(this); }
        }
      });
      window.__articleSwipers__.push(inst);
      loadGkImages(inst);
    });
  }

  // 首次加载初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initArticleSwipers();
      initGkGalleries();
    });
  } else {
    initArticleSwipers();
    initGkGalleries();
  }
})();
