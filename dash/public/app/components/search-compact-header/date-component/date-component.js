(() => {
  class dateController {
    constructor($filter, $scope) {
      this._$filter = $filter;
      this._$scope = $scope;
      this.className = 'datepicker-' + Math.floor(Math.random() * 1000);
      const self = this;
      this.buttonStat = 0;
      setTimeout(function () {
        self._setDateRange();
      }, 100);
    }
    _setDateRange() {
      this.filters.dateFrom =
        this.filters.dateFrom ||
        moment.subtract(7, 'days').startOf('day').toDate();
      this.filters.dateTo =
        this.filters.dateTo || moment.endOf('day').toDate();

      const doSetDateRange = (newDateFrom, newDateTo) => {
        if (newDateFrom && newDateTo) {
          this.filters.dateFrom = newDateFrom;
          this.filters.dateTo = newDateTo;
        }
        $('.' + this.className + ' span').text(
          moment(this.filters.dateFrom).format('DD.MM.YYYY') +
            ' - ' +
            moment(this.filters.dateTo).format('DD.MM.YYYY')
        );
        this.onChange();
        this.buttonStat += 1;
        if (this.buttonStat > 1) this.searchCriteria && this.changeButton();// ensuring the button color doesn't change the first time
      };

      const [
        TODAY,
        LAST_WEEK,
        LAST_7_DAYS,
        LAST_30_DAYS,
        THIS_MONTH,
        LAST_MONTH
      ] = [
        'Today',
        'Last week',
        'Last 7 Days',
        'Last 30 Days',
        'This Month',
        'Last Month'
      ].map(label => this._$filter('translate')(label));

      $('.' + this.className).daterangepicker(
        {
          maxDate: new Date(),
          startDate: this.filters.dateFrom,
          endDate: this.filters.dateTo,
          autoApply: true,
          autoUpdateInput: false,
          ranges: {
            [TODAY]: [moment().startOf('day'), moment().endOf('day')],
            [LAST_7_DAYS]: [moment().subtract(6, 'days'), moment()],
            [LAST_WEEK]: [
              moment().subtract(1, 'week').startOf('week'),
              moment().subtract(1, 'week').endOf('week')
            ],
            [LAST_30_DAYS]: [moment().subtract(29, 'days'), moment()],
            [LAST_MONTH]: [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month')
            ]
          },
          alwaysShowCalendars: false,
          locale: {
            cancelLabel: this._$filter('translate')('Cancel'),
            applyLabel: this._$filter('translate')('Apply'),
            customRangeLabel: this._$filter('translate')('Custom range'),
            "firstDay": 1
          }
        },
        doSetDateRange
      );

      this._$scope.$on('$destroy', () => {
        $('.daterangepicker').remove();
      });

      doSetDateRange();
    }
  }

  angular.module('tapinApp.components').component('dateComponent', {
    bindings: {
      filters: '<',
      onChange: '&',
      changeButton: '=',
      buttonChanged: '=',
      searchCriteria: '='
    },
    controller: dateController,
    controllerAs: 'dateCtrl',
    templateUrl:
      '/app/components/search-compact-header/date-component/date-component-template.html'
  });
})();
