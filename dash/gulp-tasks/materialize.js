var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var gutil = require('gulp-util');

var materializePath = './public/materialize';

function materializeTask() {
  return gulp.src(`${materializePath}/sass/materialize.scss`)
    .pipe(sass())
    .pipe(minifyCss())
    .pipe(concat('materialize.css'))
    .pipe(gulp.dest(`${materializePath}/css`));
}

module.exports = materializeTask;
