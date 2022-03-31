const nunjucks = require('nunjucks');

const nunjucksDate = require('nunjucks-date');
const moment = require('moment');

// nunjucksDate.setDefaultFormat('MMMM Do YYYY, h:mm:ss a');
nunjucksDate.setDefaultFormat('YYYY-MM-DD');

let env = new nunjucks.Environment();
nunjucksDate.install(env);
// nunjucksDate.install(env, 'mySpecialDateFilter');
// env.addFilter("date", require("nunjucks-date"));

// console.log('Now your filter should be listed here: ', env.filters);

let dateStringTest = '1995-12-25';
let currentDate = env.renderString(`Present: {{ present | date }} & Past: {{ past }}`, {
  present: moment(),
  past: moment(dateStringTest).fromNow(),
});

console.log('currentDate', currentDate);
