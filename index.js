'use strict'
// 全局声明插件名称、版本
const name = 'shoka_swiper'
const version = require('./package.json').version
const cdn = 'https://cdn.jsdelivr.net/npm/hexo-shoka-swiper@'+version
// 全局声明依赖
const path = require('path')
const nunjucks = require('nunjucks')
const fs = require('hexo-fs')
const urlFor = require('hexo-util').url_for.bind(hexo)
const util = require('hexo-util')

const nunjucksDate = require('nunjucks-date');
const moment = require('moment');
// Nunjucks添加date过滤器
let env = new nunjucks.Environment();
nunjucksDate.setDefaultFormat('YYYY-MM-DD');
nunjucksDate.install(env);

hexo.extend.filter.register('after_generate', () => {
    // 获取所有文章
    let posts_list = hexo.locals.get('posts').data;
    let swiper_list = [];
    // 若文章的front_matter内设置了index和描述，则将其放到swiper_list内
    for (let item of posts_list) {
      if (item.swiper_index) {
        item.date = moment(item.date);
        item.updated = moment(item.updated);
        swiper_list.push(item);
      }
    }
    // 对swiper_list进行处理，使其按照index大小进行排序
    function sortNumber(a, b) {
      return a.swiper_index - b.swiper_index
    }
    swiper_list = swiper_list.sort(sortNumber);
    // 排序反转，使得数字越大越靠前
    swiper_list = swiper_list.reverse();

    // 首先获取整体的配置项名称
    const config = hexo.config.swiper || hexo.theme.config.swiper;
    // 如果配置开启
    if (!(config && config.enable)) return;
    // 集体声明配置项
    const data = {
      enable_page: config.enable_page ? config.enable_page : 'all',
      exclude: config.exclude,
      timemode: config.timemode ? config.timemode : 'date',
      layout_type: config.layout.type,
      layout_name: config.layout.name,
      layout_index: config.layout.index ? config.layout.index : 0,
      error_img: config.error_img ? urlFor(config.error_img) : cdn + '/images/loading.gif',
      insertposition: config.insertposition ? config.insertposition : 'afterbegin',
      swiper_title: config.swiper_title ? config.swiper_title : '推广链接',
      swiper_list: swiper_list,
      default_descr: config.default_descr ? config.default_descr : '再怎么看我也不知道怎么描述它的啦！',
      swiper_css: config.swiper_css ? urlFor(config.swiper_css) : cdn + '/lib/swiper.min.css',
      swiper_js: config.swiper_js ? urlFor(config.swiper_js) : cdn + '/lib/swiper.min.js',
      custom_css: config.custom_css ? urlFor(config.custom_css) : cdn + '/lib/swiperstyle.css',
      custom_js: config.custom_js ? urlFor(config.custom_js) : cdn + '/lib/swiper_init.js',
    }
    // 渲染页面
    const temple_html_text = config.temple_html ? config.temple_html : env.renderString(fs.readFileSync(path.join(__dirname, './lib/slider.njk')).toString(), data);

    // cdn资源声明
    // 样式资源
    const css_text = `<link rel="stylesheet" href="${data.swiper_css}"><link rel="stylesheet" href="${data.custom_css}">`;
    // 脚本资源 — swiper_init.js 不设 data-pjax，Pjax 下由挂载脚本接管
    const js_text = `<script src="${data.swiper_js}"></script><script src="${data.custom_js}"></script>`;

    // 注入容器声明
    let get_layout;
    if (data.layout_type === 'class') {// 若指定为class类型的容器
      // 则根据class类名及序列获取容器
      get_layout = `document.getElementsByClassName('${data.layout_name}')[${data.layout_index}]`;
    } else if (data.layout_type === 'id') {// 若指定为id类型的容器
      // 直接根据id获取容器
      get_layout = `document.getElementById('${data.layout_name}')`;
    } else {// 若未指定容器类型，默认使用id查询
      get_layout = `document.getElementById('${data.layout_name}')`;
    }

    // 挂载容器脚本（data-pjax 确保 Pjax 导航时重执行，内嵌 Swiper 生命周期管理）
    let user_info_js = `<script data-pjax>
(function() {
  var epage = '${data.enable_page}';
  var cpage = location.pathname;
  var exclude = '${data.exclude}'.split(',');
  if (exclude.some(function(e) { return cpage.indexOf(e) !== -1; })) return;
  if (epage !== 'all' && epage !== cpage) return;

  var parent = ${get_layout};
  if (!parent) return;
  if (parent.querySelector('.blog-slider')) return;
  console.log("已挂载${name}");
  parent.insertAdjacentHTML("${data.insertposition}", '${temple_html_text.replace(/  |\r|\n/g, "")}');

  /* Pjax 兼容：挂载脚本统一接管 Swiper 生命周期。首次加载时 window.Swiper 尚未定义（swiper.min.js 为 defer），跳过；Pjax 导航时 window.Swiper 已可用，在此处销毁旧实例并重建。 */
  if (window.Swiper) {
    if (window.swiper && window.swiper.destroy) {
      window.swiper.destroy(true, true);
      window.swiper = null;
    }
    var el = document.querySelector('.blog-slider');
    if (el) {
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
      if (container) {
        container.onmouseenter = function() {
          window.swiper.autoplay.stop();
        };
        container.onmouseleave = function() {
          window.swiper.autoplay.start();
        };
      }
    }
  }
})();
</script>`;
    // 注入用户脚本
    // 此处利用挂载容器实现了二级注入
    hexo.extend.injector.register('body_end', user_info_js.replace(/  |\r|\n/g, ''), "default");
    // 注入样式资源
    hexo.extend.injector.register('body_end', js_text, "default");
    // 注入脚本资源
    hexo.extend.injector.register('head_end', css_text, "default");
  },
  hexo.extend.helper.register('priority', () => {
    // 过滤器优先级，priority 值越低，过滤器会越早执行，默认priority是10
    const pre_priority = hexo.config.swiper.priority || hexo.theme.config.swiper.priority
    const priority = pre_priority ? pre_priority : 10
    return priority
  })
)
