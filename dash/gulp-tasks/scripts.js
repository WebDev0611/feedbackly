var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var filter = require('gulp-filter');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var remember = require('gulp-remember');
var cached = require('gulp-cached');
var uglify = require('gulp-uglify');

var bundleConfig = require('./config/bundle-config');

function scriptsTask(targetBundle, devBuild) {
  return () => {
  var bundle = bundleConfig.scripts[targetBundle];
  var scriptFilter = filter(file => (/public\/app/.test(file.path) || /public\/sign\-up\-app/.test(file.path) || /public\/kauppatori/.test(file.path)) && !/templates.module.js/.test(file.path), { restore: true });
  var obj = gulp.src(bundle.src)
    .pipe(sourcemaps.init())
    .pipe(scriptFilter)
    .pipe(cached('babel'+targetBundle))
    .pipe(babel())
    .pipe(ngAnnotate())
    .pipe(remember('babel'+targetBundle))
    .pipe(scriptFilter.restore)
    .pipe(concat(bundle.min))

    if(devBuild) obj = obj.pipe(sourcemaps.write());
    if(!devBuild) obj = obj.pipe(uglify({ mangle: false }))

    return obj.pipe(gulp.dest(bundleConfig.dist));
  }
}

module.exports = scriptsTask;
