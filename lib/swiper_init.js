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
      passiveListeners: true,
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
          try { iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch(e) {}
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
      } catch(e) { cfg = {}; }
      var isCard = cfg.style === 'card';

      var swiperOpts = {
        autoHeight: true,
        effect: cfg.effect || 'slide',
        loop: isCard,
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
                try { ifr.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch(e) {}
              }
            });
          }
        }
      };

      el.swiper = new Swiper(el, swiperOpts);
      window.__articleSwipers__.push(el.swiper);
    });
  }

  function destroyArticleSwipers() {
    var list = window.__articleSwipers__;
    while (list.length) {
      var s = list.pop();
      if (s && s.destroy) { try { s.destroy(true, true); } catch(e) {} }
    }
    // 清理 DOM 引用
    var containers = document.querySelectorAll('.article-swiper');
    containers.forEach(function(el) { el.swiper = null; });
  }

  // 首次加载初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticleSwipers);
  } else {
    initArticleSwipers();
  }
})();
