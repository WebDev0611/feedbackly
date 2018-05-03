const gulp = require('gulp');
const exec = require('gulp-exec');

function deploy() {
  return () => gulp.src('./package.json')
    .pipe(exec(`git push heroku react-client:master`))
    .pipe(exec.reporter({
      err: true,
  	  stderr: true,
  	  stdout: true
    }));
}

module.exports = deploy;
