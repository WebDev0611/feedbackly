var gulp = require('gulp')
var livereload = require('gulp-livereload');
var bundleConfig = require('./gulp-tasks/config/bundle-config');
var shell = require('gulp-shell');
const scriptTask = require('./gulp-tasks/scripts');
const styleTask = require('./gulp-tasks/sass');
const templateTask = require('./gulp-tasks/templates');
const path = require('path');
//process.env.JS_BUNDLE = gutil.env['js-bundle'] || 'dash';
//process.env.CSS_BUNDLE = gutil.env['css-bundle'] || 'dash';

//var targetJsBundle = process.env.JS_BUNDLE;

/* Dash tasks */
gulp.task('build.dash.react', shell.task('npm run build', { verbose: true, cwd: path.resolve(__dirname, 'react-survey-editor')}));
gulp.task('watch.dash.react', shell.task('npm run build:dev', { verbose: true, cwd: path.resolve(__dirname, 'react-survey-editor')}));

gulp.task('build.dash.styles', ['build.dash.react'], styleTask('dash'));
gulp.task('build.dash.styles.angular', styleTask('dash'));
gulp.task('watch.dash.styles', () => gulp.watch(['./public/app/**/*.scss', './public/dist/survey-editor.min.css'], ['build.dash.styles']));
gulp.task('watch.dash.styles.angular', () => gulp.watch(['./public/app/**/*.scss'], ['build.dash.styles.angular']));
gulp.task('build.dash.template',templateTask('dash'));
gulp.task('watch.dash.template', () => gulp.watch('./public/app/**/*.html', ['build.dash.template']));

gulp.task('build.dash.js',['build.dash.template', 'build.dash.react'],scriptTask('dash', false));
gulp.task('build.dash.js.dev', scriptTask('dash', true));
gulp.task('watch.dash.js', () =>  gulp.watch(bundleConfig.scripts.dash.watch, ['build.dash.js.dev']));

gulp.task('build.dash', ['build.dash.js','build.dash.styles', 'build.dash.template'], () => {});
gulp.task('watch.dash', ['watch.dash.js','watch.dash.template','watch.dash.styles','watch.dash.react']);
gulp.task('watch.dash.angular', ['watch.dash.js','watch.dash.template','watch.dash.styles.angular']);

/* SignUp tasks */
gulp.task('build.signUp.js', scriptTask('signUp'));
gulp.task('build.signUp.styles', styleTask('signUp'));
gulp.task('build.signUp.templates', templateTask('signUp'));
gulp.task('build.signUp', ['build.signUp.js','build.signUp.styles','build.signUp.templates']);

gulp.task('watch.signUp', () => {
  gulp.watch('./public/sign-up-app/**/*.html', ['build.signUp.templates']);
  gulp.watch(bundleConfig.scripts['signUp'].watch, ['build.signUp.js']);
  gulp.watch('./public/sass/sign-up-app/**/*.scss', ['build.signUp.styles']);
})

/* SignUpNew tasks */
gulp.task('build.signUpNew', styleTask('signUpNew'));
gulp.task('watch.signUpNew', () => {
  gulp.watch('./public/sass/sign-up-new/**/*.scss', ['build.signUpNew']);
})

/* Print tasks */
gulp.task('build.print-results', styleTask('printResults'));
gulp.task('build.print-feedback-list', styleTask('printFeedbackList'));
gulp.task('build.print', ['build.print-results', 'build.print-feedback-list']);
gulp.task('watch.print', () => {
  gulp.watch('./public/sass/print-results/**/*.scss', ['build.print-results'])
  gulp.watch('./public/sass/print-feedback-list/**/*.scss', ['build.print-feedback-list'])
})


/* Common tasks */
gulp.task('build', ['build.dash', 'build.print', 'build.signUp', 'build.signUpNew']);
gulp.task('watch', ['watch.dash', 'watch.print', 'watch.signUp', 'watch.signUpNew']);

gulp.task('materialize', require('./gulp-tasks/materialize'));
gulp.task('cache-bust', require('./gulp-tasks/cache-bust'));
