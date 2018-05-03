(function() {

  class SurveysListController {
    /*@ngInject*/
    constructor(surveyList, messageConstants, UserStore, $filter, $state, Restangular, Toaster) {
      this._$filter = $filter;
      this._$state = $state;
      this._messageConstants = messageConstants;
      this._Restangular = Restangular;
      this._Toaster = Toaster;

      this.signedInUser = UserStore.getUserSignedIn();
      this.surveys = this._responseToSurveys(surveyList.list);
      this.surveyCount = surveyList.count;
      this.showArchived = false;
      this.newSurvey = { name: '' };

      this.pageSize = 25;
      this.page = 1;

      this.editingSurvey = {};
    }

    setEditingSurvey(survey) {
      this.editingSurvey = survey;
      this.editingSurveyNotArchiveable = survey.active_devices !== '' && !survey.archived;
    }

    createCopy() {
      this._Restangular
        .one('surveys', this.editingSurvey._id)
        .one('copy')
        .customPOST({})
        .then(() => {
          this._Toaster.success('Survey has been copied');
          this._getSurveys()
        });
    }

    saveSurvey() {
      this._Restangular
        .one('surveys', this.editingSurvey._id)
        .customPUT(_.pick(this.editingSurvey, ['name', 'archived']))
        .then(() => this._getSurveys());
    }

    onToggleShowArchived() {
      this._getSurveys();
    }

    onPageChange(page) {
      this.page = parseInt(page);

      this._getSurveys();
    }

    _responseToSurveys(surveys) {
      return _.map(surveys, survey => {
        return _.assign({}, survey, {
          active_devices: _.map(survey.active_devices, device => device.name).join(', ')
        });
      });
    }

    _getSurveys() {
      this._Restangular
        .one('surveys')
        .get({ show_archived: this.showArchived, include_meta: true, limit: this.pageSize, skip: (this.page - 1) * this.pageSize })
        .then(res => {
          this.surveys = this._responseToSurveys(res.list);
          this.surveyCount = res.count;
        });
    }

    addSurvey(isValidForm) {
      if(isValidForm) {
        this._Restangular
          .all('surveys')
          .post(this.newSurvey)
          .then(survey => {
            this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
            this._$state.go('surveys.editor', { surveyId: survey._id });
          });
      }
    }
  }

  angular.module('tapinApp.routes')
    .controller('SurveysListController', SurveysListController)

})();
