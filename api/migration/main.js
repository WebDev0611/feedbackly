var spawn = require('child_process').spawn;
var _ = require('lodash');
function worker(child,id) {
    return new Promise((resolve, reject) =>{
        child.stdout.on('data', (data) => console.log(id + ': ' + data.toString().trim()));
        child.on('close', code => code == 0 ? resolve() : reject());

    });
}

var WORKER_COUNT = 4;
var procs = _.chain().range(4).map( i =>worker(spawn('node', `worker.js ${WORKER_COUNT} ${i}`.split(' ')),i)).value();

Promise.all(procs).then( x => console.log('DONE')).catch(e => console.error('Fail', e));
