(function() {

  class ChartFactory {
    /*@ngInject*/
    constructor($filter, colorConstants, Buttons) {
      this._$filter = $filter;
      this._colorConstants = colorConstants;
      this._Buttons = Buttons;

      this._dateFormat = '%d.%m.';

      this.daysOfTheWeek = [ this._$filter('translate')('Monday'), this._$filter('translate')('Tuesday'), this._$filter('translate')('Wednesday'), this._$filter('translate')('Thursday'), this._$filter('translate')('Friday'), this._$filter('translate')('Saturday'), this._$filter('translate')('Sunday') ]

      this._tooltipTemplate = (content) => `<div class="chart-tooltip">${content}</div>`;

      var context = this;

      this._dummyChart = {
        credits: {
          enabled: false
        },
        tooltip: {
          borderWidth: 0,
          backgroundColor: 'transparent',
          borderRadius: 0,
          shadow: false,
          useHTML: true
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          title: {
            text: ''
          }
        },
        yAxis: {
          title: {
            text: ''
          }
        }
      }

    }

    _createBarChart(bars, options) {
      var series = [...bars];

      if(_.isObject(options.colorMapper)) {
        series.forEach(serie => {
          serie.color = options.colorMapper[serie.name.toString()];
        });
      }

      if(_.isFunction(options.sorter)) {
        series.sort(options.sorter);
      }

      var yAxis = options.yAxis || {
        allowDecimals: false,
        title: {
          text: ''
        }
      };

      var xAxis = options.xAxis || {
        type: 'datetime',
        tickInterval: 3600 * 24,
        dateTimeLabelFormats: {
          day: this._dateFormat
        }
      };

      if(options.average) {
        yAxis = [
          yAxis,
          {
            min: 0,
            max: 1,
            opposite: true,
            title: {
              text: ''
            },
            labels: {
              formatter: function() {
                return this.value * 100 + '%';
              }
            }
          }
        ];

        var splineSerie = _.assign({}, options.average);

        series.forEach(serie => { serie.type = 'column'; serie.yAxis = 0 })

        splineSerie.type = 'spline';
        splineSerie.connectNulls = true;
        splineSerie.yAxis = 1
        splineSerie.color = this._colorConstants.primaryColors.BLUE;
        splineSerie.name = this._$filter('translate')('Average');

        series.push(splineSerie);
      }

      var context = this;

      var chartData = {};

      if(options.legendDisabled === true) {
        _.set(chartData, 'legend.enabled', false);
      }

      return _.merge({}, chartData, {
        tooltip: {
          formatter: function() {
            var date;
            if(options.accuracy === 'daily'){
              date = moment.utc(this.x).format('DD.MM');
            } else if(options.accuracy === 'hourly') {
              date = `${this.x}:00`;
            } else if(options.accuracy === 'channelGroup'){
              date = `${this.key}`;
            } else{
              date = `${this.x}`;

            }

            if(this.series.options.type === 'column' || this.series.options.type === undefined) {
              var key = this.series.name;

              if(_.isFunction(options.labelMapper)) {
                key = options.labelMapper(key);
              }

              var value = options.unit === 'regular'
                ? this.y
                : `${_.round(this.y)}%`;
              return context._tooltipTemplate(`${date} - ${key}: ${value}`);
            } else {
              return context._tooltipTemplate(`${date}: ${_.round(this.y * 100)}%`)
            }
          }
        },
        chart: {
          type: 'column'
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          },
          series: {
            pointPadding: 0,
            groupPadding: 0.1
          }
        },
        title: {
          text: ''
        },

        yAxis: yAxis,
        xAxis: xAxis,
        series: series

      }, this._dummyChart);
    }


    _createPieChart(data, options) {

      data = _.assign({}, data);
      if(_.isObject(options.colorMapper)) {
        data.data.forEach(serie => serie.color = options.colorMapper[serie.name]);
      }
      if(_.isFunction(options.sorter)) {
        data.data.sort(options.sorter);
      }
      var context = this;
      return _.merge({
        plotOptions: {
          pie: {


            dataLabels: {
              enabled: false,

            }
          }
        },
        tooltip: {
          formatter: function() {
            var key = this.key;
            if(_.isFunction(options.labelMapper)) {
              key = options.labelMapper(this.key);
            }
            return context._tooltipTemplate(`${key} ${_.round(this.y * 100)}%`);
          }
        },
        chart: {
          type: 'pie'
        },
        title: {
          text: ''
        },
        series: [data]
      }, this._dummyChart);
    }

    _createBarCharts(data, channelNameList, options = {}) {

      options.includePie = options.includePie === undefined
        ? true
        : false;

      var charts = {};

      if(options.includePie) {
        charts.pie = this._createPieChart(data.pie, options);
      }

      charts.daily = {};

      charts.daily.regular = this._createBarChart(data.daily.regular, _.assign({ average: data.daily.average, unit: 'regular', accuracy: 'daily' }, options));
      charts.daily.normalized = this._createBarChart(data.daily.normalized, _.assign({ average: data.daily.average, yAxis: { min: 0, max: 100, title: { text: '' } }, unit: 'normalized', accuracy: 'daily' }, options));

      charts.hourly = {};

      charts.hourly.regular = this._createBarChart(data.hourly.regular, _.assign({ average: data.hourly.average, xAxis: { tickInterval: 1, title: { text: '' } }, unit: 'regular', accuracy: 'hourly' }, options));
      charts.hourly.normalized = this._createBarChart(data.hourly.normalized, _.assign({ average: data.hourly.average, xAxis: { tickInterval: 1, title: { text: '' } }, yAxis: { min: 0, max: 100, title: { text: '' } }, unit: 'normalized', accuracy: 'hourly' }, options));

      charts.weekly = {};
      var WeeksData = this.daysOfTheWeek;

      charts.weekly.regular = this._createBarChart(data.weekly.regular, _.assign({ average: data.weekly.average, xAxis: { tickInterval: 1, title: { text: '' },categories: WeeksData }, unit: 'regular', accuracy: 'weekly' }, options));

      charts.weekly.normalized = this._createBarChart(data.weekly.normalized, _.assign({ average: data.weekly.average, xAxis: {  tickInterval: 1, title: { text: '' },categories: WeeksData }, yAxis: { min: 0, max: 100, title: { text: '' } }, unit: 'normalized', accuracy: 'weekly' }, options));

      _.each(data.channelGroup.regular, (data) => {
        return data.data.map((item) => {
          var match = _.find(channelNameList, {'_id': item[0]});
          item[0] = match.name;
          return item;
        })
      });

      _.each(data.channelGroup.normalized, (data) => {
        return data.data.map((item) => {
          var match = _.find(channelNameList, {'_id': item[0]});
          item[0] = match.name;
          return item;
        })
      });

      if(data.channelGroup.average){
        data.channelGroup.average.data.map((item, index) => {
          var match = _.find(channelNameList, {'_id': item[0]});
          item[0] = match.name;
          return item;
        });
      }

      charts.channelGroup = {};

      charts.channelGroup.regular = this._createBarChart(data.channelGroup.regular, _.assign({ average: data.channelGroup.average, xAxis: {  type: 'category' },  unit: 'regular', accuracy: 'channelGroup' }, options));

      charts.channelGroup.normalized = this._createBarChart(data.channelGroup.normalized, _.assign({ average: data.channelGroup.average, xAxis: { type: 'category' }, yAxis: { min: 0, max: 100, title: { text: '' } }, unit: 'normalized', accuracy: 'channelGroup' }, options));

      return charts;
    }

    createChart(options) {


      return _.merge(options, this._dummyChart);
    }

    createWordCharts(data, channelNameList, options = {}) {
      return this._createBarCharts(data, channelNameList, options);
    }

    createButtonCharts(data, channelNameList, options = {}) {
      var options = _.assign(
        { legendDisabled: true },
        options,
        {
          sorter: (serieA, serieB) => (serieA.name || '').localeCompare(serieB.name || ''),
          labelMapper: name => {
            if(isNaN(parseFloat(name))) {
              return undefined;
            }

            var classes = this._Buttons.buttonValueToClass(parseFloat(name));

            return `<div class="${classes}"></div>`
          }
        }
     );
      var chart = this._createBarCharts(data, channelNameList, options);
      return chart;
    }

    createImageCharts(data, channelNameList, options = {}) {
      return this._createBarCharts(data, channelNameList, options);
    }

    createSliderCharts(data, options = {}) {
      var scale = options.smallScale ? 5 : 10;
      data.daily.regular.forEach(chart => {
        chart.type = 'scatter';
        chart.color = options.colorMapper[chart.name];
      });

      data.daily.average.forEach(chart => {
        chart.type = 'spline';
        chart.color = options.colorMapper[chart.name];
      });

      var charts = { daily: {} };

      var context = this;

      charts.daily.regular = _.merge({
        tooltip: {
          formatter: function() {
            var date;

            if(this.series.options.type === 'scatter') {
              date = moment(this.x).format('DD.MM.YYYY hh:mm');
            } else {
              date = moment(this.x).format('DD.MM.YYYY');
            }

            return context._tooltipTemplate(`${date}: ${this.series.name} ${this.y}`);
          }
        },
        xAxis: {
          tickInterval: 24 * 3600 * 1000,
          type: 'datetime',
          min: new Date(data.options.dateFrom).getTime(),
          max: new Date(data.options.dateTo).getTime() + 1000 * 60 * 60 * 24,
          dateTimeLabelFormats: {
            day: this._dateFormat
          }
        },
        yAxis: {
          min: 0,
          max: scale,
          tickInterval: 1
        },
        series: data.daily.regular.concat(data.daily.average)
      }, this._dummyChart);

      return charts;
    }

    createNpsCharts(data, channelNameList, options = {}) {
      options = _.assign({}, options ,{
        labelMapper: name => {
          return parseFloat(name) * 10;
        },
        legendDisabled: true,
        sorter: (serieA, serieB) => parseFloat(serieA.name) - parseFloat(serieB.name),
        includePie: false
      });

      var charts = _.assign({}, this._createBarCharts(data, channelNameList, options));
      charts.nps = { daily: {}, weekly: {}, hourly: {}, channelGroup: {}};

      var context = this;

      charts.nps.daily = _.merge({ chart: { type: 'areaspline'}, tooltip: { formatter: function() { var date = moment.utc(this.x).format('DD.MM.YYYY'); return context._tooltipTemplate(`${date}: ${_.round(this.y)}`); } },  xAxis: {  type: 'datetime',  tickInterval: 1000 * 3600 * 24,  dateTimeLabelFormats: {  day: this._dateFormat,  }},  yAxis: {  allowDecimals: false, min: -100,  max: 100  }, series: [{ name: 'NPS', data: data.nps.daily, color: this._colorConstants.primaryColors.TEAL }] }, this._dummyChart);
      charts.nps.hourly = _.merge({ chart: { type: 'areaspline' }, tooltip: { formatter: function() { var date = `${this.x}:00`; return context._tooltipTemplate(`${date}: ${_.round(this.y)}`); }}, xAxis: { tickInterval: 1, title: { text: '' } }, yAxis: { allowDecimals: false,  min: -100, max: 100  }, series: [{ name: 'NPS', data: data.nps.hourly,  color: this._colorConstants.primaryColors.TEAL }] }, this._dummyChart);
      charts.nps.weekly = _.merge({ chart: { type: 'areaspline' }, tooltip: { formatter: function() { return context._tooltipTemplate(`${this.x}: ${_.round(this.y)}`); }}, xAxis: { tickInterval: 1,  title: { text: '' },
      categories: this.daysOfTheWeek},  yAxis: { allowDecimals: false,  min: -100, max: 100}, series: [ { name: 'NPS', data: data.nps.weekly, color: this._colorConstants.primaryColors.TEAL }] }, this._dummyChart);

      if(charts.nps.channelGroup){
        data.nps.channelGroup.map((item, index) => {
          var match = _.find(channelNameList, {'_id': item[0]});
          item[0] = match.name;
          return item;
        });
      }

      charts.nps.channelGroup = _.merge({ chart: { type: 'areaspline' }, tooltip: { formatter: function() { return context._tooltipTemplate(`${this.key}: ${_.round(this.y)}`) ;}}, xAxis: {
      type: 'category'},  yAxis: { allowDecimals: false,  min: -100,  max: 100 }, series: [{ name: 'NPS', data: data.nps.channelGroup, color: this._colorConstants.primaryColors.TEAL }] }, this._dummyChart);

      return charts;
    }
  }

  angular.module('tapinApp.services')
    .service('ChartFactory', ChartFactory);

})();
