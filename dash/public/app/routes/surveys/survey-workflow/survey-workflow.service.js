(function() {

  class SurveyWorkflow {
    /*@ngInject*/
    constructor($filter) {
      this._workFlows = [
        {name: $filter("translate")("Edit"), state: "surveys.editor", type: "ALL"},
        {name: $filter("translate")("Preview"), state: "surveys.preview.ipadPreview", type: "ALL"},
        {name: $filter("translate")("Channel Selection"), state: "surveys.routes-selection", type: "ALL"},
        {name: $filter("translate")("E-mail Settings"), state: "surveys.email-settings", type: "EMAIL"},
        {name: $filter("translate")("SMS Settings"), state: "surveys.sms-settings", type: "SMS"},
        {name: $filter("translate")("Publish Settings"), state: "surveys.publish-settings", type: "ALL"},
        {name: $filter("translate")("Review and Confirmation"), state: "surveys.confirmation", type: "ALL"}
      ]

    }

    _getWorkflowOrder(activeChannels){
       var email = _.filter(activeChannels, {type: "EMAIL"}).length > 0;
       var sms = _.filter(activeChannels, {type: "SMS"}).length > 0;

       var workflow = _.clone(this._workFlows);
       if(!email) _.remove(workflow, {type: 'EMAIL'});
       if(!sms) _.remove(workflow, {type: 'SMS'});
       return workflow;
    }

    getNextState(state, activeChannels){
      var currentIndex = _.map(this._getWorkflowOrder(activeChannels), 'state').indexOf(state);
      if(currentIndex == -1) return this._getWorkflowOrder(activeChannels)[0];
      else if (currentIndex >= this._getWorkflowOrder(activeChannels).length) return null;
      else return this._getWorkflowOrder(activeChannels)[currentIndex+1];
    }

    getPreviousState(state, activeChannels){
      var currentIndex = _.map(this._getWorkflowOrder(activeChannels), 'state').indexOf(state);
      if(currentIndex <= 0) return this._getWorkflowOrder(activeChannels)[0];
      else if (currentIndex > this._getWorkflowOrder(activeChannels).length) return null;
      else return this._getWorkflowOrder(activeChannels)[currentIndex-1];
    }

    getWorkflow(activeChannels){
      return this._getWorkflowOrder(activeChannels);
    }

  }

  angular.module('tapinApp.services')
    .service('SurveyWorkflow', SurveyWorkflow);

})();
