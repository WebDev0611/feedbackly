const gulp = require('gulp');
const imagemin = require('gulp-imagemin');

const minifyAssets = () => {
  return gulp.src('./dist/images/**/*.png')
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/images/'));
}

module.exports = minifyAssets;
