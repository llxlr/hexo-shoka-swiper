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
  });

  // Inject HTML + init after content replacement (Shoka 触发 pjax:success)
  document.addEventListener('pjax:success', pjaxMount);
})();
