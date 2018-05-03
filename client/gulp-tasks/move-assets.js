const gulp = require('gulp');
const imagemin = require('gulp-imagemin');

const moveAssets = () => {
  return gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist'));
}

module.exports = moveAssets;
