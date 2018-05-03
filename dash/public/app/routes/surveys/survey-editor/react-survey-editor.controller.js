(function () {

  class ReactSurveyEditorController {
    /*@ngInject*/
    constructor(activeSurvey, $state, activeChannels, $filter, Toaster, Restangular, userRights, UserStore, featureConstants) {
      this._$state = $state;
      this.survey = activeSurvey;
      this.activeChannels = activeChannels;
      this._Toaster = Toaster;
      this._filter = $filter;

      this._Restangular = Restangular;
      this.currentUser = UserStore.getUserSignedIn();

      var finishedTutorials = _.get(this.currentUser, 'tutorials_finished') || [];
      this.showNewEditorVideo = (finishedTutorials.indexOf('react-editor') === -1 && window.TUTORIALS_FINISHED.indexOf('react-editor') === -1) && !this.currentUser.ipad_user;
      this.language = _.get(this.currentUser, 'settings.locale') || 'en';

      if(this.showNewEditorVideo){
        var ctrl = this;
        setTimeout(function(){
          $("#modalVideo").modal({
            complete: function(){ctrl.stopVideoAndMarkCompleted(ctrl)}
          })
          $("#modalVideo").modal('open')
        }, 1000)
      }

      this.props = {
        initialSurvey: this.survey,
        translate: $filter('translate'),
        toaster: Toaster,
        can_use_upsell:userRights.availableFeatures.indexOf(featureConstants.UPSELL_MODULE) > -1,
        availableFeatures: userRights.availableFeatures,
        featureConstants: featureConstants,
        organizationAdmin: userRights.organization_admin,
        callbacks: {
          onSave: (newSurvey) => {
            if(newSurvey.error) {
              // editor will show the error
            } else {
              this.saveSurvey(newSurvey).then(() => {
                Toaster.success('Survey saved');
                this.props.methods.onSaveSuccess()
              })
              .catch(() => {
                Toaster.danger('Survey saving failed');
                this.props.methods.onSaveFail()
              });
            }
          },
        },
        methods: {
          getSurvey: null,
          onSaveSuccess: null,
          onSaveFail: null,
        }

      }


    }

    stopVideoAndMarkCompleted(ctrl){
      $("#modalVideoIframe").each(function(){
        this.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*')
      })
      window.TUTORIALS_FINISHED.push('react-editor');
      ctrl._Restangular.one('users', this.currentUser._id).all('finish_tutorial').post({id: 'react-editor'});

    }

    closeVideoModal(){
      $("#modalVideo").modal('close')
    }


    saveSurvey(survey) {
      return this._Restangular.one('v2/surveys/'+this.survey._id).customPUT(survey).then(s => {console.log("Saved")})
    }

    goToState(state) {
      var newSurvey = this.props.methods.getSurvey();
      if(newSurvey.error) {
        //editor will show the error
      } else {
        this._Toaster.neutral('Saving the survey...');

        this.saveSurvey(newSurvey).then(() => this._saveAllAndGoToState(state, { surveyId: this.survey._id })).catch(() => {
          this._Toaster.danger('Survey saving failed');
          this.props.methods.onSaveFail()});
      }
    }

    _saveAllAndGoToState(state, params) {
      return this._$state.go(state, params);
    }

  }

  angular.module('tapinApp.routes')
  .controller('ReactSurveyEditorController', ReactSurveyEditorController)

})();
