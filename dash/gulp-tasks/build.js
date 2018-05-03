var gulp = require('gulp');
var uglify = require('gulp-uglify');

function buildTask() {
  return gulp.src('./public/dist/*.min.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/dist'));
}

module.exports = buildTask;
