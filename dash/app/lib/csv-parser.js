var fs = require('fs');
var csv = require('csv-parse');

// Read the first line of a file
function readFirstLine (path) {
  return new Promise(function (resolve, reject) {
    var rs = fs.createReadStream(path, {encoding: 'utf8'});
    var acc = '';
    var pos = 0;
    var index;
    rs
      .on('data', function (chunk) {
        index = chunk.indexOf('\n');
        acc += chunk;
        index !== -1 ? rs.close() : pos += chunk.length;
      })
      .on('close', function () {
        resolve(acc.slice(0, pos + index));
      })
      .on('error', function (err) {
        reject(err);
      })
  });
}

function parseCsv(path, columnCount) {
  return new Promise( async (res,rej) => {
    var firstLine = await readFirstLine(path);
    var delimiter = ","
    if(firstLine.split(";").length > firstLine.split(",").length) delimiter = ";"
    /*
    if(firstLine.split(';').length === columnCount) delimiter = ';';
    else if(firstLine.split(',').length === columnCount) delimiter = ',';
    else return rej('First line doesn\'t match target column count');
    */
    var parser = csv({delimiter, relax_column_count: true, columns: true}, function(err, data){
				if(err) rej(err);
        else if(data.length === 0) rej('No data');
        else res(data);
    });
    fs.createReadStream(path).pipe(parser);
  });
}

module.exports = parseCsv;
