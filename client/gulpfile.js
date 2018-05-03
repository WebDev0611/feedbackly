require('app-module-path').addPath(__dirname);

const yargs = require('yargs');
const gulp = require('gulp');
const bump = require('gulp-bump');
const path = require('path');
const webpack = require('webpack');
const reactClientWebpackConfig = require('./react-client/webpack');
const pluginAppWebpackConfig = require('./plugin-v2/webpack');
const registerAppWebpackConfig = require('./client/webpack');
const gutil = require('gulp-util');
const dotenv = require('dotenv')
const fs = require('fs');

if(!('env' in yargs.argv)) {
  console.error("No env flag passed. Usage: --env prod/dev/test");
  process.exit(1);
}

var env;
try{
  env = dotenv.parse(fs.readFileSync(`../.env/shared.${yargs.argv.env}`));
} catch(e){
  console.error('No .env file found in /.env');
  console.error('Have you remembered to copy your .env file from the main directory?')
  process.exit(1);
}

const DEST = path.resolve('./dist');

gulp.task('server', require('./gulp-tasks/server'));

gulp.task('build', [ 'move-assets', 'minify-assets', 'build.clientApp', 'build.pluginApp', 'build.registerApp'], () => { });
gulp.task('build-linux', ['move-assets', 'build.clientApp', 'build.pluginApp', 'build.registerApp'], () => { });


gulp.task('deploy', require('gulp-tasks/deploy')());

gulp.task('watch', ['watch.clientApp', 'watch.pluginApp','watch.registerApp'], () => { });

gulp.task('minify-assets', require('gulp-tasks/minify-assets'));

gulp.task('move-assets', require('gulp-tasks/move-assets'));

var webpackTask = (config) => (done) => {
  webpack(config, (err, stats) => {
    if (err)
      throw new gutil.PluginError('webpack:build', err);
    gutil.log('[webpack:build] Completed\n' + stats.toString({
      assets: true,
      chunks: false,
      chunkModules: false,
      colors: true,
      hash: false,
      timings: false,
      version: false
    }));
  });
}


gulp.task('build.clientApp', webpackTask(reactClientWebpackConfig(env, false)));
gulp.task('watch.clientApp', webpackTask(reactClientWebpackConfig(env, true)));

gulp.task('build.pluginApp', webpackTask(pluginAppWebpackConfig(env, false)));
gulp.task('watch.pluginApp', webpackTask(pluginAppWebpackConfig(env, true)));

gulp.task('build.registerApp', webpackTask(registerAppWebpackConfig(env, false)));
gulp.task('watch.registerApp', webpackTask(registerAppWebpackConfig(env, true)));


gulp.task('bump-local', function () {
  gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));
});


gulp.task('bump-dist', function () {
  gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest(DEST));
});

gulp.task('default', () => {
  gulp.run('watch.clientApp');
});
