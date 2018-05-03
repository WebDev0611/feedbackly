(function() {

  class SurveyPublishSettingsController {
    /*@ngInject*/
    constructor(
      activeSurvey,
      SurveySettingsStore,
      DeviceIcons,
      $sce,
      activeChannels,
      moment,
      $state,
      Restangular,
      Toaster
    ){
      this.survey = activeSurvey;
      this._SurveySettingsStore = SurveySettingsStore;
      this.surveySettings = this._SurveySettingsStore.getSettings(this.survey._id);
      this.format = "dd.mm.yyyy";
      this.momentFormat = this.format.toUpperCase();
      this.getIcon = function(type){
        return $sce.trustAsHtml(DeviceIcons.getIcon(type));
      };
      this.activeChannels = this.surveySettings.activeChannels ? this.surveySettings.activeChannels : activeChannels;
      this.surveySettings.schedule = _.get(this.surveySettings, "schedule") ||
        { plan: "now",
          time: {
            date: moment().format("DD.MM.YYYY"),
            hour: moment().hour()+1+"",
            minute: moment().minute()+"",
            tz: moment.tz.guess(),
            realDate: moment(),
            unix: moment.unix()
          }
        }
      this.showScheduleControls = false;
      this.timezoneNames = [];
      _.forEach(moment.tz.names(), tzName => {
        var offset = moment.tz(tzName).utcOffset();
        this.timezoneNames.push({name: tzName, offset: offset})
      })
      this._Toaster = Toaster;
      this.state = $state;

    }

    range(from, to){
      return _.map(_.range(from, to), val => {
        if(val < 10) return `0${val}`;
        else return `${val}`
      });
    }

    goToState(state){
      this._SurveySettingsStore.updateSettings(this.survey._id, {schedule: this.surveySettings.schedule});
      this.state.go(state, { surveyId: this.survey._id });
    }

    dateStringToArray(string, format){
      if(typeof string === 'string'){
      var dayIndex = format.indexOf('d');
      var monthIndex = format.indexOf('m');
      var yearIndex = format.indexOf('y');
      var year = string.substring(yearIndex, yearIndex+4);
      var month = string.substring(monthIndex, monthIndex+2);
      var day = string.substring(dayIndex, dayIndex+2);
      return [parseInt(year), parseInt(month)-1, parseInt(day)];
      } else  return false
    }

    onTimeDateChange(){
      var date = this.surveySettings.schedule.time.date;
      var arr = this.dateStringToArray(date, this.format);
      if(arr){
        this.surveySettings.schedule.time.realDate = moment.tz(arr, this.surveySettings.schedule.time.tz);
        this.surveySettings.schedule.time.realDate = this.surveySettings.schedule.time.realDate
          .add(this.surveySettings.schedule.time.hour, 'hours')
          .add(this.surveySettings.schedule.time.minute, 'minutes');
      }

      this.surveySettings.schedule.time.unix = this.surveySettings.schedule.time.realDate.unix();

    }


  }

  angular.module('tapinApp.routes')
    .controller('SurveyPublishSettingsController', SurveyPublishSettingsController);

})();
