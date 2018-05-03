(function() {

  class SurveyProgressBar {
    constructor($state, SurveyWorkflow, SurveySettingsStore, $scope) {
      this.stateName = $state.current.name;
      this._SurveyWorkflow = SurveyWorkflow;
      this._SurveySettingsStore = SurveySettingsStore;
      this._SurveySettingsStore.onChange($scope, () => {
        this._init();
      })
      this._init();
    }

    _init(){
      this.workFlow = this._SurveyWorkflow.getWorkflow(this.activeChannels);
      this.previousHidden = this.stateName === this.workFlow[0].state;
      this.nextHidden = this.stateName === _.last(this.workFlow).state;

      var next = this._SurveyWorkflow.getNextState(this.stateName, this.activeChannels);
      var prev = this._SurveyWorkflow.getPreviousState(this.stateName, this.activeChannels)
      this.nextStateName = _.get(next, 'state');
      this.previousStateName = _.get(prev, 'state');
      switch(this.workFlow.length){
        case 8: this.fontSize = {'font-size': '10px'}
        break;
        case 7: this.fontSize = {'font-size': '11px'}
        break;
        default: ''
        break;
      }
    }
  }

  SurveyProgressBar.$inject = ['$state', 'SurveyWorkflow', 'SurveySettingsStore', '$scope'];


  angular.module('tapinApp.components')
    .component('surveyProgressBar', {
      bindings: {
        goToState: '&',
        activeChannels: '<'
      },
      template: `
      <div class="progress-bar-new">

        <span ng-repeat="state in surveyProgressBar.workFlow">
          <a href
          ng-class="{ 'active': surveyProgressBar.stateName.includes(state.state) }"
          ng-click="surveyProgressBar.goToState({state: state.state})"
          ng-style="surveyProgressBar.fontSize"
          >
              {{::state.name}}
          </a>
          <i ng-if="$index < surveyProgressBar.workFlow.length-1" class="material-icons">play_arrow</i>
        </span>

        <button ng-class="{'btn-hide': surveyProgressBar.previousHidden}" ng-disabled="surveyProgressBar.previousHidden" class="btn-floating waves-effect waves-light nav-button-left" ng-click="surveyProgressBar.goToState({state: surveyProgressBar.previousStateName})">
          <i class="material-icons">arrow_back</i>
        </button>

        <button ng-class="{'btn-hide': surveyProgressBar.nextHidden}" ng-disabled="surveyProgressBar.nextHidden" class="btn-floating waves-effect waves-light nav-button-right" ng-click="surveyProgressBar.goToState({state: surveyProgressBar.nextStateName})">
          <i class="material-icons">arrow_forward</i>
        </button>


      </div>
      `,
      controller: SurveyProgressBar,
      controllerAs: 'surveyProgressBar'
    });

})();
