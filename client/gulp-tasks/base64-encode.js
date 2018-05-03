const gulp = require('gulp');
const reduce = require('stream-reduce')
const map = require('map-stream');
const fs = require('fs');

const getFileObject = (map, chunk) => {
  const distIndex = chunk.path.lastIndexOf('/dist');
  const filePath = chunk.path.substring(distIndex, chunk.path.length);

  map[filePath] = `data:image/png;base64,${chunk.contents.toString('base64')}`;

  return map;
}

const jsonify = options => (data, callback) => {
  fs.writeFile(options.dest, JSON.stringify(data), (err) => {
    callback(null, null);
  });
}

const base64Encode = options => () => {
  return gulp.src(options.src)
    .pipe(reduce(getFileObject, {}))
    .pipe(map(jsonify({ dest: options.dest })));
}

module.exports = base64Encode;
