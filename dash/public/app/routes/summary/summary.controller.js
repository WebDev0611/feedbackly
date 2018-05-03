(function () {
  class SummaryController {
    /* @ngInject */
    constructor (SummaryApi, $filter, $scope, ChartFactory, colorConstants, $window, UserStore, $q) {
      this._$q=$q 
      this._$filter = $filter;
      this._$scope = $scope;
      this._SummaryApi = SummaryApi;
      this._ChartFactory = ChartFactory;
      this._colorConstants = colorConstants;
      
      this.setDateInterval(7);
      this.tutorialsFinished = $window.TUTORIALS_FINISHED;
      this.tutorialFinished = this.tutorialsFinished.indexOf('summary') > -1;
      var user = UserStore.getUserSignedIn();
      if(!this.tutorialFinished && !user.ipad_user && user.rights.survey_create) window.location = "/app/#/tutorial"
      this.userHasFeedback = $window.USER_HAS_FEEDBACK;
      this._setDateIntervalToCustomRange();
      this._noPropagationOnDateRangeElements();
    }

    setDateInterval (interval) {
      this.dateRange = {
        to: moment.utc().toDate().toISOString(),
        from: moment.utc().subtract(parseInt(interval) - 1, 'days').toDate().toISOString()
      };

      this._getData();
    }

    setDateIntervalToLastMonth () {
      this.dateRange = {
        to: moment.utc().subtract(1, 'months').endOf('month').subtract(1, 'days').toISOString(),
        from: moment.utc().subtract(1, 'months').startOf('month').toISOString()
      };
      this._getData();
    }
    _setDateIntervalToCustomRange () {
      const start = moment().subtract(7, 'days');
      const end = moment();
      const doSetDateRange = (start, end) => {
        const translatedText = this._$filter('translate')('Custom range'); // customRangeLabel doesn't work
        $('#reportrange span').text(translatedText);
        this.dateRange = {
          to: moment.utc(end).toDate().toISOString(),
          from: moment.utc(start).add(1, 'days').toDate().toISOString()
        };
        this._getData();
      };

      $('#reportrange')
        .daterangepicker({
          maxDate: new Date(),
          startDate: start,
          endDate: end,
          opens: 'left',
          drops: 'up',
          autoApply: true,
          locale: {
            "firstDay": 1
          }
          
        }, doSetDateRange)
        .click(function (e) {
          e.stopPropagation();
        });

      this._$scope.$on('$destroy', () => {
        $(".daterangepicker").remove()
      });

      doSetDateRange(start, end);
    }

    color (valueA, valueB) {
      return valueA - valueB < 0 ? 'red-text' : 'green-text';
    }

    arrow (valueA, valueB) {
      return valueA - valueB < 0 ? 'keyboard_arrow_down' : 'keyboard_arrow_up';
    }

    satisfactionIcon (value) {
      if (value < 25) {
        return 'sentiment_dissatisfied';
      } else if (value >= 25 && value < 75) {
        return 'sentiment_neutral';
      } else {
        return 'sentiment_satisfied';
      }
    }

    satisfactionColor (value) {
      if (value < 25) {
        return 'red white-text';
      } else if (value >= 25 && value < 75) {
        return 'orange white-text';
      } else if (value >= 75) {
        return 'green white-text';
      } else {
        return '';
      }
    }

    toggleBestChannelsDisplay () {
      if (this.bestChannelsDisplayLimit === this.bestChannels.top.length) {
        this.bestChannelsDisplayLimit = 5;
      } else {
        this.bestChannelsDisplayLimit = this.bestChannels.top.length;
      }
    }

    _getFeedbackAmountChart (data) {
      return this._ChartFactory.createChart({
        tooltip: {
          formatter: function () {
            var date = moment.utc(this.x).format('DD.MM.YYYY');

            return `<div class="chart-tooltip">${date}: ${this.y}</div>`;
          }
        },
        xAxis: {
          title: {
            text: ''
          },
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          dateTimeLabelFormats: {
            day: '%d.%m.'
          }
        },
        yAxis: {
          title: {
            text: ''
          },
          allowDecimals: false
        },
        series: [{
          type: 'areaspline',
          name: this._$filter('translate')('Feedback amount'),
          data: data,
          color: this._colorConstants.primaryColors.BLUE
        }]
      });
    }

    _getFeedbackAverageChart (data) {
      return this._ChartFactory.createChart({
        tooltip: {
          formatter: function () {
            var date = moment.utc(this.x).format('DD.MM.YYYY');

            return `<div class="chart-tooltip">${date}: ${_.round(this.y)}%</div>`;
          }
        },
        xAxis: {
          title: {
            text: ''
          },
          type: 'datetime',
          tickInterval: 24 * 3600 * 1000,
          dateTimeLabelFormats: {
            day: '%d.%m.'
          }
        },
        yAxis: {
          title: {
            text: ''
          },
          min: 0,
          max: 100,
          labels: {
            formatter: function () {
              return this.value + '%';
            }
          }
        },
        series: [{
          type: 'areaspline',
          name: this._$filter('translate')('Average'),
          data: data,
          color: this._colorConstants.primaryColors.TEAL,
          connectNulls: true
        }]
      });
    }

    _spotlightDay (data) {
      if (data) {
        return { date: moment(data[0]).format('dd DD.MM.'), value: _.round(data[1]) };
      } else {
        return { date: '-', value: '-' };
      }
    }

    _spotlightHour (data) {
      if (data) {
        return { hour: `${data[0]}:00`, value: _.round(data[1]) };
      } else {
        return { hour: '-:-', value: '-' };
      }
    }

    _getData () {
      this.loading=true; 
      const PromiseBulk = [
        this._SummaryApi.getOrganizationAverage(this.dateRange),
        this._SummaryApi.getHourlyAverage(this.dateRange),
        this._SummaryApi.getDailyAverage(this.dateRange),
        this._SummaryApi.getFeedbackAmount(this.dateRange),
        this._SummaryApi.getFbeventAmount(this.dateRange),
        this._SummaryApi.getAllFeedbackAmount(this.dateRange),
        this._SummaryApi.getNps(this.dateRange),
        this._SummaryApi.getBestDevices(this.dateRange)
      ]
      this._$q.all(PromiseBulk)
        .then(([res1,res2,res3,res4,res5,res6,res7,res8])=>{
          this.organizationAverage = res1.data
          this.bestHour = this._spotlightHour(res2.data.bestHour);
          this.worstHour = this._spotlightHour(res2.data.worstHour);
    
          this.dailyAverage = res3.data;
          this.feedbackAverageChart = _.assign({}, this._getFeedbackAverageChart(res3.data.graph));
          this.bestDay = this._spotlightDay(res3.data.bestDay);
          this.worstDay = this._spotlightDay(res3.data.worstDay);
    
          this.feedbackAmount = res4.data;
          this.feedbackAmountChart = _.assign({}, this._getFeedbackAmountChart(res4.data.graph));
          this.quietestDay = this._spotlightDay(res4.data.quietestDay);
          this.busiestDay = this._spotlightDay(res4.data.busiestDay);
    
          this.fbeventAmount = res5.data.count
          this.allFeedbackAmount = res6.data.count
          this.nps = res7.data
    
          this.bestChannels = res8.data;
          this.bestChannelsDisplayLimit = 5;
          this.loading=false
        })
    }
    _noPropagationOnDateRangeElements () {
      const elements = ['.daterangepicker', '.input-mini', '.available', 'in-range'];
      elements.forEach(element => (
        $(element)
        .click(function (e) {
          e.stopPropagation();
        })
      ));
    }
  }
  angular.module('tapinApp.routes')
    .controller('SummaryController', SummaryController);
})();