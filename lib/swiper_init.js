// Pjax 兼容：销毁旧实例，避免累积僵尸 Swiper
if (window.swiper && window.swiper.destroy) {
  window.swiper.destroy(true, true);
  window.swiper = null;
}

// 仅当轮播容器存在时才初始化（非首页跳过，避免空实例）
var el = document.querySelector('.blog-slider');
if (!el) return;

var swiper = window.swiper = new Swiper('.blog-slider', {
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
    swiper.autoplay.stop();
  };
  container.onmouseleave = function() {
    swiper.autoplay.start();
  };
}
