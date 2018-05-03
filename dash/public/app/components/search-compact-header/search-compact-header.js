/* global angular,moment,_,$ */
(() => {
  class searchCompactCtrl {
    constructor($filter, $scope, Toaster, Restangular, ResultsStore) {
      this._$filter = $filter;
      this._Toaster = Toaster;
      this._Restangular = Restangular;
      this._ResultsStore = ResultsStore;
      this._$scope = $scope;
      this.activeDevices = [...this.filters.devices];

      this.compareDate = false;
      this.toolTipDevices = '';
      this.toolTipSurveys = '';
      this.limitCount = '';
      this.limitPosition= '';

      this._getSurveyDetails();
      this._getDevices();
      this._addBodyClickListener();
      this._$scope.$on('$destroy', this._removeBodyClickListener);
      this.searchCriteriaFulfilled = false;
      this.buttonChanged = false;
      
    }
    _getSurveyDetails() {
      return this._Restangular
        .one('surveys')
        .get({ show_archived: false })
        .then(surveys => {
          this.surveys = surveys;
          const surveyIds = _.map(
            _.get(this.filters, 'surveys') || [],
            survey => survey._id
          );
          surveys.forEach(survey => {
            survey.chosen = surveyIds.indexOf(survey._id) >= 0;
            this.activeSurveys = [..._.filter(this.surveys, { chosen: true })];
          });
          this._onChange();
        });
    }
    _getDevices() {
      return this._Restangular
        .one('devices')
        .all('tree')
        .getList()
        .then(devices => {
          this.devices = devices;
        });
    }
    _onActiveDevicesChange(channels) {
      this.activeDevices = [...channels];
      this._onChange();
    }
    _onSurveysChange() {
      this.activeSurveys = [..._.filter(this.surveys, { chosen: true })];
      this.changeButton();
      this._onChange();
    }
    _onLimitFeedbacksChange(){
      if (this.limitCount < 1) {
        this.buttonChanged = false;
        return this._onChange();
      }
      this.changeButton();
      return this._onChange();
    }
    _onChange() {
      let filters = {
        compareDates: this.compareDates || false,
        devices: this.activeDevices,
        feedbacks: this.feedbackFilters || [],
        from: moment(this.filters.dateFrom).startOf('day').format('YYYY-MM-DD'),
        surveys: this.activeSurveys,
        to: moment(this.filters.dateTo).startOf('day').format('YYYY-MM-DD'),
      };

      if (this.limitCount) {
        filters.limitCount = this.limitCount;
        filters.limitPosition = this.limitPosition ? 'oldest' : 'latest'
      }
      
      if (this.compareDates) {
        const dateFrom = _.get(this, 'filters.compare.dateFrom') || moment();
        const dateTo = _.get(this, 'filters.compare.dateTo') || moment();

        this.filters.compare = {
          dateFrom: moment(dateFrom).startOf('day'),
          dateTo: moment(dateTo).startOf('day')
        };
        filters.compare = {
          from: this.filters.compare.dateFrom.format('YYYY-MM-DD'),
          to: this.filters.compare.dateTo.format('YYYY-MM-DD')
        };
      }
      this._isSearchCriteriaFulfilled({
        devices: this.activeDevices,
        surveys: this.activeSurveys
      });
      this.onChange({ filters });


      // TOOL-TIP FUNCTIONALITY
      if (this.activeSurveys && this.activeDevices) {
        this.toolTipDevices = this.activeDevices
        .map(device => device.name)
        .join(', ');
      this.toolTipSurveys = this.activeSurveys
        .map(survey => survey.name)
        .join(', ');
        this._renderTooltipText('.tooltippedSurveys');
        this._renderTooltipText('.tooltippedDevices');
      }
    }
    _isSearchCriteriaFulfilled(filters) {
      let result = 1;
      const verified = [];
      for (const key in filters) {
        if (filters[key] !== undefined) {
          verified.push(filters[key].length);
        }
      }
      verified.forEach(val => {
        if (!val) result = val;
      });
      this.searchCriteriaFulfilled = result > 0;
      // if (!this.searchCriteriaFulfilled) this.buttonChanged = false;
    }

    _bodyClickListener(self) {
      return function(event) {
        const CLASS = '.search-dropdown';
        const parent = $(event.target).closest(CLASS);
        if (parent.length === 0 && !$(event.target).hasClass(CLASS)) {
          self.surveysDropDownIsActive = false;
          self.channelsDropdownIsActive = false;
          self.limitsDropdownIsActive = false;
          self._$scope.$apply();
        }
      };
    }

    _addBodyClickListener() {
      this._listenerFunction = this._bodyClickListener(this);
      $(document).on('click', 'body', this._listenerFunction);
    }

    _removeBodyClickListener() {
      $(document).off('click', 'body', this._listenerFunction);
    }
    _renderTooltipText(el) {
      $(el).tooltip({
        tooltip:
          el === '.tooltippedDevices' 
          ? this.toolTipDevices 
          : this.toolTipSurveys,
        delay: 500,
        html: true
      });
    }

    toggleSurveyDropdown() {
      this.surveysDropDownIsActive = !this.surveysDropDownIsActive;
      this.channelsDropdownIsActive = false;
      this.limitsDropdownIsActive = false;
      //this.compareDropdownIsActive = false;
    }

    toggleChannelDropdown() {
      this.channelsDropdownIsActive = !this.channelsDropdownIsActive;
      this.surveysDropDownIsActive = false;
      this.limitsDropdownIsActive = false;
      //this.compareDropdownIsActive = false;
    }
    toggleLimitsDropdown(){
      this.limitsDropdownIsActive = !this.limitsDropdownIsActive;
      this.surveysDropDownIsActive = false;
      this.channelsDropdownIsActive = false;
    }
    /* toggleCompareDropdown() {
      this.compareDropdownIsActive = !this.compareDropdownIsActive;
      this.surveysDropDownIsActive = false;
      this.channelsDropdownIsActive = false;
    } */
    toggleCompare() {
      this.compareDates = !this.compareDates;
      this._onChange();
    }

    changeButton () {
      this.buttonChanged = true;
    }
    resetButton () {
      this.buttonChanged = false;
    }
  }
  angular.module('tapinApp.components').component('searchCompactHeader', {
    bindings: {
      filters: '<',
      feedbackFilters: '<',
      surveys: '<',
      channels: '<',
      onChange: '&',
      onSubmit: '&',
      onValidate: '&',
      allowDateCompare: '<',
      showLimitFeedback: '<'
    },
    controller: searchCompactCtrl,
    controllerAs: 'searchCompact',
    templateUrl: 
      '/app/components/search-compact-header/search-compact-header-template.html'
  });
})();
