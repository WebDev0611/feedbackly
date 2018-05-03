var gulp = require('gulp');
var gutil = require('gulp-util');
var templateCache = require('gulp-angular-templatecache');

var bundleConfig = require('./config/bundle-config');

function templates(targetBundle) {
  return () => {
    var bundle = bundleConfig.scripts[targetBundle];

    if(!bundle.templateCache) return;

    return gulp.src(bundle.templateCache.src)
      .pipe(templateCache({
        filename: 'templates.module.js',
        module: 'tapinApp.templates',
        standalone: true,
        root: bundle.templateCache.root
      }))
      .pipe(gulp.dest(bundle.templateCache.target));
  }
};

module.exports = templates;
