var q = require('q');
var _ = require('lodash');
var utils = require('../utils');

function getResults(options) {
  var buttonSorter = (a, b) => parseFloat(a.name) - parseFloat(b.name);

  return q.all([
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'organization' })),
    utils.aggregateTotals(_.assign({}, options, { totalsTarget: 'channels' })),
    utils.aggregateHourlyCounts(options)
      .then(data => utils.generateCountCharts(data, options))
      .then(data => {
        data.totals.regular.sort(buttonSorter);
        data.totals.normalized.sort(buttonSorter);
        return data
      }),
    utils.getDevices(options)
  ]).then(data => {
    data[2].channelList = data[3];
    data[2].totals = _.assign(data[2].totals, { organization: utils.getTotals(data[0], options), channels: utils.getTotals(data[1], options) });
    return data[2];
  });
}

module.exports = { getResults };
