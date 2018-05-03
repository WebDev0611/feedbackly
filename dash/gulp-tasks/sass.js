var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');

var bundleConfig = require('./config/bundle-config');

function sassTask(targetBundle) {
  return () => {
  var bundle = bundleConfig.styles[targetBundle];

  return gulp.src(bundle.src)
    .pipe(sass())
    .pipe(concat(bundle.min))
    .pipe(minifyCss())
    .pipe(gulp.dest(bundleConfig.dist));
  }
}

module.exports = sassTask;
