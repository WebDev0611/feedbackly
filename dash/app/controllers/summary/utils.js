var moment = require('moment');

function getDoubleDateRange(options) {
	var middleDate = moment.utc(options.dateFrom * 1000).startOf('day').unix();

	var dateTo = moment.utc(options.dateTo * 1000).add('days').unix();

  var difference = dateTo - moment.utc(options.dateFrom * 1000).startOf('day').unix();

  var dateFrom = moment.utc((middleDate - difference) * 1000).unix();

	return { dateFrom, middleDate, dateTo };
}

function getDateSplitProject(options) {
  var difference = Math.abs(options.dateTo - options.dateFrom);

  var middleDate = moment.utc((options.dateFrom + difference / 2) * 1000).unix();

	return {
		num_sum: '$num_sum',
		num_count: '$num_count',
		fbevent_count: '$fbevent_count',
		feedback_count: '$feedback_count',
		date: '$date',
    data: '$data',
    date_group: {
      $cond: { if: { $gte: ['$' + (options.dateField || 'date'), middleDate] }, then: 1, else: 0 }
    }
  };
}

module.exports = { getDoubleDateRange, getDateSplitProject };
