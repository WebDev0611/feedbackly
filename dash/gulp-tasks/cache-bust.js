var htmlreplace = require('gulp-html-replace');
var gulp = require('gulp');

function cacheBustTask() {
  var timestamp = (new Date()).getTime();

  var fileTimestamps = gulp.src('./views/index.ejs')
    .pipe(htmlreplace({
      js: { src: '/dist/dash.min.js', tpl: `<script src="%s?v=${timestamp}"></script>` },
      css: { src: '/dist/dash.min.css', tpl: `<link rel="stylesheet" type="text/css" href="%s?v=${timestamp}"/>` }
    }, {
      keepBlockTags: true
    }))
    .pipe(gulp.dest('./views'));
}

module.exports = cacheBustTask;
