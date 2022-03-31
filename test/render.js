'use strict'

const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')
const nunjucksDate = require('nunjucks-date');
const moment = require('moment');

let env = new nunjucks.Environment();
nunjucksDate.setDefaultFormat('YYYY-MM-DD');
nunjucksDate.install(env);
// env.addFilter("date", nunjucksDate);
// console.log(env.filters);

let posts_list = [
  {
    'title': 'Butterfly主题美化日记',
    'path': 'posts/7c16c4bb/',
    'cover': 'https://npm.elemecdn.com/akilar-candyassets/image/cover1.webp',
    'date': '2022-01-19',
    'description': '对本站的Hexo优化路线做了个归纳，理论上可以根据本帖教程复现本站效果。',
  },
  {
    'title': 'Butterfly主题美化日记',
    'path': 'posts/f99b208/',
    'cover': 'https://npm.elemecdn.com/akilar-candyassets/image/cover6.webp',
    'updated': '2022-03-04',
    'description': '',
  },
];
let swiper_list = [];
for (let item of posts_list) {
  item.date = moment(item.date);
  item.updated = moment(item.updated);
  swiper_list.push(item);
}
// console.log(swiper_list);

const data = {
  timemode: 'date',
  error_img: 'https://cdn.jsdelivr.net/npm/hexo-shoka-swiper/images/loading.gif',
  swiper_list: swiper_list,
  default_descr: '再怎么看我也不知道怎么描述它的啦！',
};
const tmpl = path.join(__dirname, '../lib/html.njk')
if (fs.existsSync(tmpl)) {
  const temple_html_text = env.renderString(fs.readFileSync(tmpl).toString(), data).replace(/  |\r|\n/g, '');
  console.log(temple_html_text);
}
