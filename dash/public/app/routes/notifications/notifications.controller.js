(function() {

  class NotificationsController {
    /*@ngInject*/
    constructor(surveys, tree, $filter, Toaster, $http, devices, $state, UserStore, userGroups, userRights, featureConstants, $stateParams) {
      var notification;
      this.notificationsEnabled = 
        userRights.availableFeatures.indexOf(featureConstants.NOTIFICATIONS.TO_ALL_EMAILS) > -1
        || userRights.availableFeatures.indexOf(featureConstants.NOTIFICATIONS.TO_ORGANIZATION_USERS) > -1
      
      if(this.notificationsEnabled){
          var id = $stateParams.id;
          if(id){
            $http.get('/api/v2/notifications/' + id)
            .then(res => {
              notification = res.data;
              this.onSetNotificationRenderPresets(notification, devices)
            }, err => {
              console.log(err)
            })
          } else {
              this.selectedSurvey = null;
              this.notification = {
                device_id: [],
                conditionSet: [],
                receivers: [],
                delay: "0"
              }
        }
      }
      

      this._$filter = $filter;
      this.tree = tree;
      this.surveys = surveys;
      this._Toaster = Toaster;
      this.userGroups = userGroups;
      this.contentSelections = {}
      this._$state = $state;
      this.defaultLanguage = _.get(UserStore.getUserSignedIn(), 'settings.locale');
      this.includeAllQuestionsInMessage = true;
      this.selectedContent = {}
      this.orGroups = []


      this._$http = $http;

    }
    onSetNotificationRenderPresets(notification, devices){
      if(notification){
        this.notification = notification;

        this.selectedSurveyIndex = _.findIndex(this.surveys, {_id: this.notification.survey_id}).toString()
        this.selectedSurvey = this.surveys[this.selectedSurveyIndex]
        this.activeChannels = _.filter(devices, d => this.notification.device_id.indexOf(d._id) > -1)

        _.forEach(this.notification.conditionSet, cs => {
          cs.orGroupId = cs.orGroupId || this.generateOrGroupId();
          var question = _.find(this.selectedSurvey.questions, {_id: cs.question_id});
          var exists = _.find(this.orGroups, {id: cs.orGroupId || "N/A"});
          if(exists) {
            if(!_.find(exists.questions, {_id: question._id})) exists.questions.push(question)
          }
          else this.orGroups.push({id: cs.orGroupId, questions: [question]})
        })
                 
        if(this.selectedSurvey.languages.indexOf(this.defaultLanguage) > -1){
          this.displayLanguage = this.defaultLanguage
        } else {
          this.displayLanguage = this.selectedSurvey.languages[0];
        }
        this.notification.delay = (this.notification.delay || 0).toString();
        if(this.notification.messageContentFromQuestionIds && this.notification.messageContentFromQuestionIds.length > 0) {
          this.includeAllQuestionsInMessage = false;
          this.notification.messageContentFromQuestionIds.forEach(id => this.selectedContent[id] = true)
        }

      } else {
        this.selectedSurvey = null;
        this.notification = {
          device_id: [],
          conditionSet: [],
          receivers: [],
          delay: "0"
        }
    }
    }
    includeAllQuestionsChange(){
      if(this.includeAllQuestionsInMessage === true) delete this.notification.messageContentFromQuestionIds
    }

    generateOrGroupId(){
      return Math.floor(Date.now() + Math.random()*1000).toString()
    }

    selectedSurveyChange(){
      this.orGroups = [];
      this.notification.conditionSet = []
      this.selectedSurvey = this.surveys[this.selectedSurveyIndex]
      this.notification.survey_id = this.selectedSurvey._id;
      this.availableLanguages = this.selectedSurvey.languages;

      if(this.selectedSurvey.languages.indexOf(this.defaultLanguage) > -1){
        this.displayLanguage = this.defaultLanguage
      } else {
        this.displayLanguage = this.selectedSurvey.languages[0];
      }
    }
    save(){
      var errors = []
      if(this.notification.device_id.length === 0){
        errors.push('Please select at least 1 channel.')
      }
      if(this.notification.conditionSet.length === 0){
        errors.push('Please make at least 1 notification rule.')
      }
      if(this.notification.receivers.length === 0){
        errors.push('Please type at least 1 e-mail recipient.')
      }


      this.notification.delay = parseInt(this.notification.delay || "0")
      const selectedContent = _.map(this.selectedContent, (val, key) => val == true ? key : undefined).filter(id => id != undefined);
      if(selectedContent.length > 0) this.notification.messageContentFromQuestionIds = selectedContent;

      if (errors.length === 0){
        var method = 'POST', id=""
        if(this.notification._id){
          method = 'PUT';
          id = "/" + this.notification._id;
        }
        this._$http({
          method,
          url: `/api/v2/notifications${id}`,
          data: this.notification
        })
        .then(res => {
          this._Toaster.success('Notification rule saved successfully.')
          this._$state.go('notifications-list')
        },
        error => {
          if(error) console.log(error)
        })

      } else {
        errors.forEach(err => this._Toaster.neutral(err))
      }

    }

    onTreeChange(channels){
      var ids = _.map(channels, '_id')
      this.notification.device_id = ids;
    }

    addQuestionToOrGroup(question, groupId){
      const group = _.find(this.orGroups, {id: groupId});
      group.questions.push(question);
    }

    addQuestion(question){
      this.orGroups.push({id: this.generateOrGroupId(), questions: [question]})
    }

    removeOrGroup(id){
      const message = this._$filter('translate')('Do you want to remove this rule set?');
      if(confirm(message)){
        this.orGroups = this.orGroups.filter(g => g.id !== id)        
      }
    }

    availableQuestionsForOrGroup(orGroup){
      return this.selectedSurvey.questions.filter(q => orGroup.questions.indexOf(q) == -1)
    }


  }

  angular.module('tapinApp.routes')
    .controller('NotificationsController', NotificationsController);

})();
