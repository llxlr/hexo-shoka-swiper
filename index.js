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

const nunjucksDate = require('nunjucks-date');
const moment = require('moment');
// Nunjucks添加date过滤器
let env = new nunjucks.Environment();
nunjucksDate.setDefaultFormat('YYYY-MM-DD');
nunjucksDate.install(env);

hexo.extend.filter.register('after_generate', () => {
    // 获取所有文章
    let posts_list = hexo.locals.get('posts').data.slice();
    // hexo-hide-posts 0.4.x 会把隐藏文章从 posts 中移出，单独放入 hidden_posts，
    // 这里将其合并回来，使得设置过 swiper_index 的隐藏文章也能进入轮播。
    const hidden_posts = hexo.locals.get('hidden_posts');
    if (hidden_posts && hidden_posts.data && hidden_posts.data.length) {
      const postIds = new Set(posts_list.map(item => item._id));
      posts_list = posts_list.concat(hidden_posts.data.filter(item => !postIds.has(item._id)));
    }
    let swiper_list = [];
    const image_server = hexo.config.image_server || hexo.theme.config.image_server || '';
    // 若文章的front_matter内设置了index和描述，则将其放到swiper_list内
    for (let item of posts_list) {
      if (item.swiper_index) {
        item.date = moment(item.date);
        item.updated = moment(item.updated);
        item.cover = item.cover ? urlFor(item.cover) : image_server + '?' + Math.floor(Math.random() * 999999) || cdn + '/images/loading.gif';
        // 视频卡片：解析封面图路径
        item.swiper_video_poster = item.swiper_video_poster ? urlFor(item.swiper_video_poster) : '';
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
    // 脚本资源 — swiper_init.js 通过 PJAX 事件统一接管所有 PJAX 流程
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

    // ── 生成为独立 js 文件（避免内联脚本影响 SEO）──
    // PJAX 下的 HTML 注入 + Swiper 生命周期统一由 swiper_init.js 通过事件驱动。
    const swiper_html_escaped = temple_html_text.replace(/  |\r|\n/g, '');
    const swiper_js_content = `
(function () {
  'use strict';

  /* 暴露配置到全局，供 swiper_init.js 的 PJAX 事件回调使用 */
  window.__SWIPER_CONFIG__ = {
    epage: '${data.enable_page}',
    exclude: '${data.exclude}'.split(','),
    get_layout: function () {
      return ${get_layout};
    },
    insertposition: '${data.insertposition}',
    html: '${swiper_html_escaped}',
    name: '${name}'
  };

  /* 首次加载：路径匹配 → 注入 HTML（Swiper 初始化由 swiper_init.js 负责） */
  var cfg = window.__SWIPER_CONFIG__;
  var cpage = location.pathname;

  if (cfg.exclude.some(function (e) { return cpage.indexOf(e) !== -1; })) return;
  if (cfg.epage !== 'all' && cfg.epage !== cpage) return;

  var parent = cfg.get_layout();
  if (!parent) return;
  if (parent.querySelector('.blog-slider')) return;

  parent.insertAdjacentHTML(cfg.insertposition, cfg.html);
})();
`;

    hexo.route.set('js/swiper.js', swiper_js_content);

    // 注入外部脚本引用（替代原来的内联 user_info_js）
    hexo.extend.injector.register('body_end', `<script src="${urlFor('/js/swiper.js')}"></script>`, "default");
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

// ==================== 文章内 Swiper Tag 插件 ====================
let articleSwiperAssetsInjected = false;
let articleSwiperCount = 0;
const swiperNjkSrc = fs.readFileSync(path.join(__dirname, './lib/swiper.njk')).toString();

function injectArticleSwiperAssets() {
  if (articleSwiperAssetsInjected) return;
  articleSwiperAssetsInjected = true;
  const config = hexo.config.swiper || (hexo.theme.config && hexo.theme.config.swiper) || {};
  const swiperCss = config.swiper_css ? urlFor(config.swiper_css) : cdn + '/lib/swiper.min.css';
  const swiperJs = config.swiper_js ? urlFor(config.swiper_js) : cdn + '/lib/swiper.min.js';
  const customCss = config.custom_css ? urlFor(config.custom_css) : cdn + '/lib/swiperstyle.css';
  const customJs = config.custom_js ? urlFor(config.custom_js) : cdn + '/lib/swiper_init.js';
  hexo.extend.injector.register('head_end',
    `<link rel="stylesheet" href="${swiperCss}"><link rel="stylesheet" href="${customCss}">`, 'default');
  hexo.extend.injector.register('body_end',
    `<script src="${swiperJs}"></script><script src="${customJs}"></script>`, 'default');
}

// ==================== gk 卡片多图轮播（构建期转换） ====================
// Shoka 主题的 gk 卡片会把多张图片堆叠在 .gk-img > .gallery 中；
// 这里在文章/页面渲染完成后把多图区域转换成 Swiper 结构，运行时由 swiper_init.js 初始化。
hexo.extend.filter.register('after_post_render', function(data) {
  if (!data || typeof data.content !== 'string') return data;
  if (data.content.indexOf('class="gk-img"') === -1) return data;
  const converted = transformGkGalleries(data.content, gkAutoplayDelay());
  if (converted !== data.content) {
    data.content = converted;
    injectArticleSwiperAssets();
  }
  return data;
});

/**
 * 解析 tag 参数。支持两种格式：
 *   key:value       → { key: 'value' }
 *   key: value      → { key: 'value' }（值在下一个 token）
 * 仅取第一个冒号分隔，后续冒号归值（如 ratio:16:9 → { ratio: '16:9' }）
 */
function parseTagArgs(args) {
  const result = {};
  let pendingKey = null;
  args.forEach(arg => {
    let val;
    if (pendingKey) {
      val = arg.replace(/,$/, '');
      result[pendingKey] = val;
      pendingKey = null;
      return;
    }
    const idx = arg.indexOf(':');
    if (idx === -1) return;
    const key = arg.substring(0, idx);
    val = arg.substring(idx + 1).replace(/,$/, '');
    if (val.length > 0) {
      result[key] = val;
    } else {
      pendingKey = key;
    }
  });
  return result;
}

/** 生成唯一 swiper ID */
function uid() { return 'as_' + (++articleSwiperCount) + '_' + Math.random().toString(36).slice(2, 8); }

/** 判断渲染结果中是否包含 Shoka 主题的 gk 卡片 */
function isGkCardHtml(html) {
  return typeof html === 'string' && html.indexOf('class="gk-item"') !== -1;
}

/**
 * 按 <div> 配对深度查找指定 class 的 div 块，返回 { start, end, html } 列表。
 * 用于在不引入 HTML 解析依赖的前提下定位主题 gk 标签渲染出的结构。
 */
function findDivBlocks(html, className) {
  const blocks = [];
  if (typeof html !== 'string') return blocks;
  const openTag = `<div class="${className}">`;
  let cursor = html.indexOf(openTag);
  while (cursor !== -1) {
    const re = /<div\b|<\/div>/g;
    re.lastIndex = cursor;
    let depth = 0;
    let end = -1;
    let match;
    while ((match = re.exec(html)) !== null) {
      if (match[0] === '</div>') {
        depth -= 1;
        if (depth === 0) { end = re.lastIndex; break; }
      } else {
        depth += 1;
      }
    }
    if (end === -1) break;
    blocks.push({ start: cursor, end: end, html: html.slice(cursor, end) });
    cursor = html.indexOf(openTag, end);
  }
  return blocks;
}

/**
 * 拆分 Shoka 主题 gk 卡片（`{% gk %}` / `{% gkfile %}` 的渲染结果）。
 * 返回每张卡片的完整 HTML 片段。
 */
function splitGkCards(html) {
  return findDivBlocks(html, 'gk-item').map(block => block.html);
}

/** gk 卡片多图轮播的自动播放间隔（配置 swiper.gk_autoplay，毫秒，默认 0 关闭） */
function gkAutoplayDelay() {
  const config = hexo.config.swiper || (hexo.theme.config && hexo.theme.config.swiper) || {};
  const value = config.gk_autoplay === undefined ? 0 : config.gk_autoplay;
  if (value === false || value === 'false') return 0;
  const delay = parseInt(value, 10);
  return isNaN(delay) || delay < 0 ? 0 : delay;
}

/**
 * 把 gk 卡片的多图区域（.gk-img > .gallery）转换为 Swiper 轮播结构，
 * 单图卡片保持主题原有渲染。运行时的初始化见 lib/swiper_init.js。
 */
function transformGkGalleries(html, autoplay) {
  if (typeof html !== 'string' || html.indexOf('class="gk-img"') === -1) return html;
  const blocks = findDivBlocks(html, 'gk-img');
  // 从后往前替换，避免前面的替换影响后面的索引
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    const gallery = findDivBlocks(block.html, 'gallery')[0];
    if (!gallery) continue;
    const imgs = gallery.html.match(/<img\b[^>]*>/g);
    if (!imgs || imgs.length < 2) continue;
    const slides = imgs.map(img => `<div class="swiper-slide">${img}</div>`).join('');
    const swiperHtml = `<div class="gk-swiper swiper" data-gk-swiper data-autoplay="${autoplay}">`
      + `<div class="swiper-wrapper">${slides}</div>`
      + '<div class="swiper-button-prev gk-nav"></div>'
      + '<div class="swiper-button-next gk-nav"></div>'
      + '<div class="swiper-pagination gk-dots"></div>'
      + '</div>';
    const newBlock = block.html.slice(0, gallery.start) + swiperHtml + block.html.slice(gallery.end);
    html = html.slice(0, block.start) + newBlock + html.slice(block.end);
  }
  return html;
}

/** 把一张 gk 卡片包装成文章内轮播的 slide */
function gkCardSlide(card) {
  return `<div class="swiper-slide as-slide as-slide--gk">
    <div class="as-slide__gk">${card}</div>
  </div>`;
}

/**
 * {% slide %} — 轮播子项（内层标签，先于 swiper 执行）
 * 参数：cover, link, video, poster, embed, type（自动检测可不填）
 * 内容：描述文本（支持 Markdown）；若内容为 Shoka 主题 gk 卡片（{% gk %} / {% gkfile %}），
 *       则卡片本体作为 slide 内容，每张卡片对应一张 slide。
 * 注册为 async：这样才可以嵌套主题里的异步标签（如 {% gkfile %}）。
 */
hexo.extend.tag.register('slide', async function(args, content) {
  const opts = parseTagArgs(args);
  // 自动检测类型
  if (!opts.type) {
    opts.type = (opts.video || opts.embed) ? 'video' : 'image';
  }

  // 兼容 Shoka 主题 gk 卡片：slide 内容为 {% gk %} / {% gkfile %} 的渲染结果时，
  // 卡片本体即 slide 主体（多张卡片则各自成为一张 slide），不再生成封面图与描述浮层。
  if (opts.type === 'gk' || isGkCardHtml(content)) {
    const gkCards = splitGkCards(content);
    return (gkCards.length > 0 ? gkCards : [String(content).trim()]).map(gkCardSlide).join('');
  }

  // 渲染描述（Markdown）
  let caption = '';
  if (content && content.trim()) {
    caption = hexo.render.renderSync({ text: content.trim(), engine: 'markdown' }).trim();
  }

  const linkUrl = opts.link || '';
  const linkOpen = linkUrl ? `<a class="as-slide__link" href="${linkUrl}" rel="external nofollow noreferrer">` : '';
  const linkClose = linkUrl ? '</a>' : '';

  if (opts.type === 'video') {
    // 视频 slide：复用 .blog-slider__video 结构 + 描述
    let mediaHtml;
    if (opts.embed) {
      mediaHtml = `<div class="blog-slider__video-embed">${opts.embed}</div>`;
    } else if (opts.video) {
      const poster = opts.poster ? ` poster="${opts.poster}"` : '';
      mediaHtml = `<video src="${opts.video}"${poster} muted loop playsinline controls></video>`;
    } else {
      mediaHtml = '';
    }
    return `<div class="swiper-slide as-slide blog-slider__item blog-slider__item--video">
      <div class="as-slide__media blog-slider__video">${linkOpen}${mediaHtml}${linkClose}</div>
      ${caption ? `<div class="as-slide__content blog-slider__content"><div class="as-slide__text blog-slider__text">${caption}</div></div>` : ''}
    </div>`;
  }

  // 图片 slide：复用 .blog-slider__img 结构 + 描述
  return `<div class="swiper-slide as-slide blog-slider__item">
    <div class="as-slide__media blog-slider__img">${linkOpen}<img src="${opts.cover || cdn + '/images/loading.gif'}" alt="" loading="lazy"/>${linkClose}</div>
    ${caption ? `<div class="as-slide__content blog-slider__content"><div class="as-slide__text blog-slider__text">${caption}</div></div>` : ''}
  </div>`;
}, { ends: true, async: true });

/**
 * {% swiper %} — 文章内轮播容器（外层标签）
 * 参数：style（gallery/card/gk，默认 gallery，内容为 gk 卡片时自动用 gk）、
 *      ratio（16:9/4:3/1:1，默认 16:9）
 * 注册为 async：这样才可以嵌套主题里的异步标签（如 {% gkfile %}）。
 */
hexo.extend.tag.register('swiper', async function(args, content) {
  injectArticleSwiperAssets();
  const opts = parseTagArgs(args);
  const ratio = opts.ratio || '16:9';
  const id = uid();
  // 计算 aspect-ratio
  const ratioMap = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%' };
  const paddingBottom = ratioMap[ratio] || '56.25%';
  // 兼容 Shoka 主题 gk 卡片：{% gk %} / {% gkfile %} 的输出自动按卡片拆分成多张 slide
  const body = typeof content === 'string' ? content : '';
  const gkCards = body.indexOf('swiper-slide') === -1 ? splitGkCards(body) : [];
  const style = opts.style ? opts.style : (isGkCardHtml(body) ? 'gk' : 'gallery');
  const swiperItemData = gkCards.length > 0 ? gkCards.map(gkCardSlide).join('') : body;

  const data = {
    swiperId: id,
    style: style,
    effect: style === 'card' ? 'fade' : 'slide',
    paddingBottom: paddingBottom,
    autoplay: opts.autoplay !== undefined ? opts.autoplay : '3000',
    mousewheel: opts.mousewheel !== 'false',
    swiperItemData: swiperItemData,
  };
  return env.renderString(swiperNjkSrc, data);
}, { ends: true, async: true });

// ==================== gk 卡片多图轮播 ====================
/**
 * Shoka 主题的 `{% gk %}` / `{% gkfile %}` 在条目有多张图片时会输出
 * <div class="gk-img"><div class="gallery"><img><img>…</div></div>，
 * 默认是纵向堆叠。这里在页面渲染后按需注入 Swiper 资源，
 * 由 swiper_init.js 在浏览器端把 .gallery 原地升级为轮播。
 */
hexo.extend.filter.register('after_render:html', function (html) {
  // 只处理完整文档（文章正文渲染结果里没有 </head>，直接跳过）
  if (typeof html !== 'string' || html.indexOf('</head>') === -1) return html;
  if (!/class="gk-img"[\s\S]*?class="gallery"/.test(html)) return html;

  const theme_config = hexo.theme.config || {};
  const config = hexo.config.swiper || theme_config.swiper || {};
  const css_list = [
    config.swiper_css ? urlFor(config.swiper_css) : cdn + '/lib/swiper.min.css',
    config.custom_css ? urlFor(config.custom_css) : cdn + '/lib/swiperstyle.css',
  ];
  const js_list = [
    config.swiper_js ? urlFor(config.swiper_js) : cdn + '/lib/swiper.min.js',
    config.custom_js ? urlFor(config.custom_js) : cdn + '/lib/swiper_init.js',
  ];
  // 首页轮播或文章内轮播可能已经注入过同样的资源，避免重复加载
  const loaded = url => {
    const name = String(url).split('?')[0].split('/').pop();
    return name.length > 0 && html.includes(name);
  };

  const css_text = css_list.filter(url => !loaded(url)).map(url => `<link rel="stylesheet" href="${url}">`).join('');
  const js_text = js_list.filter(url => !loaded(url)).map(url => `<script src="${url}"></script>`).join('');
  if (!css_text && !js_text) return html;

  return html.replace('</head>', css_text + '</head>').replace('</body>', js_text + '</body>');
});
