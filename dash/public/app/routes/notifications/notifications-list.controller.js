(function() {

  class NotificationsListController {
    /*@ngInject*/
    constructor(UserStore, $http, $state, Toaster, userRights, featureConstants) {
      this._$http = $http;
      this.notifications = [];

      this._$http.get('/api/surveys')
      .then(res => {
          this._surveys = res.data;
      }, err => {})

      this._$state = $state;
      this._Toaster = Toaster;
      this._deviceObjects = userRights.deviceObjects;
      

      this.notificationsEnabled = 
        userRights.availableFeatures.indexOf(featureConstants.NOTIFICATIONS.TO_ALL_EMAILS) > -1
        || userRights.availableFeatures.indexOf(featureConstants.NOTIFICATIONS.TO_ORGANIZATION_USERS) > -1

      if(this.notificationsEnabled) $http.get('/api/v2/notifications')
      .then(res => {
        this.notifications = res.data;
      }, err => {
        console.log(err);
      })

      }

    getSurveyName(survey_id){
      var s = _.find(this._surveys, {_id: survey_id})
      if(s) return s.name;
      else return ''
    }

    getReceivers(receivers){
      var emails = _.map(receivers, 'text');
      return emails.join(", ")
    }

    getChannelNames(channel_ids){
      var returnable = []
      _.forEach(channel_ids, id => {
        var s = _.find(this._deviceObjects, {_id: id})
        if(s) returnable.push(s.name)
      })

      return returnable.join(", ")
    }

    formatLastSent(last_sent){
      return last_sent
    }

    delete(id){
      this._$http.delete('/api/v2/notifications/' + id)
      .then(() => {
        this._Toaster.success('Notification removed.');
        this._$state.reload();
      },
      err => console.log(err))
    }


  }

  angular.module('tapinApp.routes')
    .controller('NotificationsListController', NotificationsListController);

})();
