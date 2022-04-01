const nunjucks = require('nunjucks');
const moment = require('moment');

let dateStringTest = '1995-12-25';
let currentDate = nunjucks.renderString(`Present: {{ date(present, 'YYYY-MM-DD') }} & Past: {{ past }}`, {
  present: moment(),
  past: moment(dateStringTest).fromNow(),
});

console.log('currentDate', currentDate);
