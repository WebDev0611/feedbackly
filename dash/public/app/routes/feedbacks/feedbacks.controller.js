(function () {
  class FeedbacksController {
    /* @ngInject */
    constructor (defaults, Restangular, Buttons, UserStore, Files, Toaster, $filter, rights, $http, featureConstants) {
      this._Restangular = Restangular;
      this._Files = Files;
      this._Buttons = Buttons;
      this._Toaster = Toaster;
      this._$filter = $filter;
      this._UserRights = rights;
      this._$http = $http;
      this.currentUser = UserStore.getUserSignedIn();
      this.isOrganizationAdmin = this._UserRights.organization_admin;

      this.locale = this.currentUser.settings.locale;

      var defaultTo = moment.utc(defaults.dateTo, 'YYYY-MM-DD');
      var defaultFrom = moment.utc(defaults.dateFrom, 'YYYY-MM-DD');

      this._resetPage();

      this.filters = _.assign({}, defaults, { dateFrom: defaultFrom.toDate(), dateTo: defaultTo.toDate() });

      this.searchFilter = {
        surveys: this.filters.surveys,
        devices: this.filters.devices,
        from: defaultFrom.format('YYYY-MM-DD'),
        to: defaultTo.format('YYYY-MM-DD'),
        language: this.locale
      };

      if (defaults.devices.length === 0 ||  defaults.surveys.length === 0) {
        this.feedbackCount = 0;
        this.list = [];
      } else {
        this._getFeedbacks(_.assign({}, this.searchFilter, { limit: this.pageSize, skip: (this.page - 1) * this.pageSize }));
      }

      this.enableFileExport = this._UserRights.availableFeatures.indexOf(featureConstants.FILE_EXPORTS.ALL) > -1;
      this.fileExportTeaser = $filter("translate")("File exports are available at a higher plan. Upgrade your plan to use this feature.")
    }

    onValidateTerms (validation) {
      this.termValidation = validation;
    }

    _resetPage ()  {
      this.pageSize = 100;
      this.page = 1;
    }

    _updateFbeventLimitInfo () {
      this.showPlanFbeventLimit = this.list.feedbackCountInPlan < this.list.feedbackCount;
      this.fbeventLimit = { count: this.list.feedbackCount - (this.list.feedbackCountInPlan || 0), planLimit: this.list.maxFbeventCount };
    }

    onPageChange (page) {
      this.page = parseInt(page);

      this._getFeedbacks(_.assign({}, this.searchFilter, { limit: this.pageSize, skip: (parseInt(page) - 1) * this.pageSize }));
    }

    onFiltersChange (filters) {
      this.searchFilter = {
        surveys: filters.surveys,
        devices: filters.devices,
        from: filters.from,
        to: filters.to,
        language: this.locale
      };
    }

    search () {
      this._resetPage();

      this._Toaster.neutral('Getting the results...');

      this._getFeedbacks(_.assign({}, this.searchFilter, { limit: this.pageSize, skip: (this.page - 1) * this.pageSize }));
    }

    buttonValueToClass (value) {
      return this._Buttons.buttonValueToClass(value);
    }

    printFeedbacks (format) {
      if (this.printing ||  this.feedbackCount === 0) return;

      this.printing = true;

      this._Toaster.neutral('Creating a file...');

      var options = _.assign(
        {},
        this.searchFilter,
        { language: this.locale },
        { format },
        { surveys: _.map(this.searchFilter.surveys, survey => survey._id), devices: _.map(this.searchFilter.devices, device => device._id) }
      );

      this._$http.post('/api/v2/feedback-list/create-request', options)
        .then(
        success => {
          var id = success.data.request;
          var url = '/api/v2/feedback-list?id=' + id;

          this._Files.download(url);
          this.printing = false;
        }
        );
    }
    _startDragscroll () {
      // Hack needed to load
      setTimeout(
        (a) => {
          // Need to initialize dragscroll, if coming from other page.
          window.dragscroll.reset();
        }, 1000
      );
    }
    _getFeedbacks (options) {
      if (options.surveys.length > 0) {
        this.surveysTitle = _.map(options.surveys, survey => survey.name).join(', ');
      }

      if (options.devices.length > 0) {
        this.channelsTitle = _.map(options.devices, device => device.name).join(', ');
      }

      options = _.assign(
        {},
        options,
        { surveys: _.map(options.surveys, survey => survey._id), devices: _.map(options.devices, device => device._id) }
      );

      this.loading = true;
      this._$http.post('/api/v2/feedback-list/create-request', options)
        .then(
        success => {
          var id = success.data.request;
          this._$http.get('/api/v2/feedback-list?id=' + id).then(
            success => {
              var data = success.data;
              this.list = data;
              this.loading = false;
              this.feedbackCount = data.feedbackCount || 0;
              this._updateFbeventLimitInfo();
              this._startDragscroll();
            },
            error => {
              console.log(error);
              this.loading = false;
            }
          );
        }
        );
    }
  }

  angular.module('tapinApp.routes')
    .controller('FeedbacksController', FeedbacksController);
})();
