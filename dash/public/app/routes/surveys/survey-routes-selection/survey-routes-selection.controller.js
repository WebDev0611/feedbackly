(function() {

  class SurveyRoutesSelectionController {
    /*@ngInject*/
    constructor(
      activeSurvey,
      channelRights,
      activeChannels,
      allChannels,
      SurveySettingsStore,
      deviceConstants,
      $filter,
      $state,
      $http,
      Restangular,
      Toaster,
      Languages,
      UserStore,
      channelTree,
      SurveyWorkflow,
      deviceGroups,
      $scope,
      channelNames,
      featureConstants,
      userRights
    ){
      this.survey = activeSurvey;
      this.channelRights = channelRights;
      this._SurveySettingsStore = SurveySettingsStore;
      this.surveySettings = this._SurveySettingsStore.getSettings(this.survey._id);
      this.activeChannels = this.surveySettings.activeChannels ? this.surveySettings.activeChannels : activeChannels;
      this.activatedChannels = _.clone(this.activeChannels)
      this.channels = channelTree;
      this._$filter = $filter;
      this._deviceConstants = deviceConstants;
      this._Restangular = Restangular;
      this._$state = $state;
      this._$http = $http;
      this._Toaster = Toaster;
      this._SurveyWorkflow = SurveyWorkflow;
      this._UserStore = UserStore;
      this.canSendSms = userRights.availableFeatures.indexOf(featureConstants.SMS_MESSAGES) > -1
      this.canCreateChannels = userRights.availableFeatures.indexOf(featureConstants.CHANNEL_CREATION) > -1
      this.isOrganizationAdmin = UserStore.getUserSignedIn().isOrganizationAdmin;
      this.deviceTypes = deviceConstants.deviceTypes;
      this.deviceGroups = deviceGroups;
      this.baseGroup = _.find(this.deviceGroups, {is_all_channels_group: true})
      if(!this.baseGroup) this.baseGroup = _.find(this.deviceGroups, {is_base_devicegroup: true})
      if(!this.baseGroup) this.baseGroup = this.deviceGroups[0];
      this.newDevice = this.newDeviceBase();
      this._$scope = $scope;
      this._allChannels = allChannels;
      this._channelNames = channelNames;
    }

    newDeviceBase(){
      return {_id: ObjectId(), udid: ObjectId(), putInDeviceGroup: _.get(this.baseGroup, "_id"), settings: {}}
    }

    channelName(name){
      return this._channelNames.channelName(name);
    }

    getActiveChannels(active, store){
      return this.activeChannels;
    }

    onChannelsChange(channels) {
        var activeChannels = channels;
        this._SurveySettingsStore.updateSettings(this.survey._id, { activeChannels });
        this.activatedChannels = channels;
    }

    goToState(state){
        var channelIds = _.map(this.activatedChannels, '_id');
        var activeChannels = _.filter(this._allChannels, c => channelIds.indexOf(c._id) > -1)
        this._SurveySettingsStore.updateSettings(this.survey._id, { activeChannels });
        this._$state.go(state, { surveyId: this.survey._id });
    }

    getUpdatedChannelTree(){
      this._UserStore.getUserRightsBust().then(rights => {
        this.channels = rights.deviceTree;
        this._allChannels = rights.deviceObjects;
      })
    }

    saveDevice(form){
      if(form.$valid){

        if(this.newDevice.type === 'SMS' && !this.canSendSms){
          return this._Toaster.neutral("You have no rights to create SMS channels. Enter your credit card information in your organization details or request access from support@feedbackly.com")
        }

        var sendDevice = _.assign({}, this.newDevice);
        var dgId = sendDevice.putInDeviceGroup;
        delete sendDevice.putInDeviceGroup;

        var deviceGroup = _.find(this.deviceGroups, {_id: dgId});

        if(this.newDevice.type !== 'PLUGIN') delete sendDevice.udid;

        this._$http.post('/api/v2/channels',sendDevice)
        .then(success => {
           deviceGroup.devices.push(success.data._id);
           this._$http.put('/api/devicegroups/' + deviceGroup._id, deviceGroup).then(() => {
             this._Toaster.success('Channel created successfully.');
             this.newDevice = this.newDeviceBase();
             form.$setPristine();
             this.getUpdatedChannelTree();
           })
        })
      }
    }


  }

  angular.module('tapinApp.routes')
    .controller('SurveyRoutesSelectionController', SurveyRoutesSelectionController);

})();
