(function() {

  class BaseResults {
    /*@ngInject*/
    constructor(ResultsStore, LocaleText) {
      this._ResultsStore = ResultsStore;

      this.filters = this._ResultsStore.getQuestionFilter();

      this.question.dateFrom = moment.utc(this.filters.from, 'YYYY-MM-DD').format('DD.MM.YYYY');
      this.question.dateTo = moment.utc(this.filters.to, 'YYYY-MM-DD').format('DD.MM.YYYY');
      
      
      this._LocaleText = LocaleText;

      if(this.filters.compareDates) {
        this.questionCompare = _.assign({}, this.question);

        this.questionCompare.dateFrom = moment.utc(this.filters.compare.from, 'YYYY-MM-DD').format('DD.MM.YYYY');
        this.questionCompare.dateTo = moment.utc(this.filters.compare.to, 'YYYY-MM-DD').format('DD.MM.YYYY');
      }

    }

    localize(text) {
      return this._LocaleText.getText(text);
    }

    inView(status) {
      if(status === true) {
        this.viewed = true;
      }
    }
  }

  angular.module('tapinApp.components')
    .component('baseResults', {
      bindings: {
        question: '<',
        printing: '@',
        showAll: '<'
      },
      template: `
        <div class="card result-card" in-view="baseResults.inView($inview)">
          <div class="card-content">
            <span class="card-title">{{::baseResults.localize(baseResults.question.heading)}}</span>

            <div ng-if="baseResults.viewed || baseResults.showAll === true">
              <div ng-if="baseResults.filters.compareDates">
                <h6 class="grey-text">({{::baseResults.questionCompare.dateFrom}}-{{::baseResults.questionCompare.dateTo}})</h6>
                <ng-switch on="baseResults.question.question_type">
                  <button-results question="baseResults.questionCompare" compare="true" ng-switch-when="Button"></button-results>
                  <image-results question="baseResults.questionCompare" compare="true" ng-switch-when="Image"></image-results>
                  <word-results question="baseResults.questionCompare" compare="true" ng-switch-when="Word"></word-results>
                  <text-results question="baseResults.questionCompare" compare="true" ng-switch-when="Text"></text-results>
                  <slider-results question="baseResults.questionCompare" compare="true" ng-switch-when="Slider"></slider-results>
                  <contact-results question="baseResults.questionCompare" compare="true" ng-switch-when="Contact"></contact-results>
                  <nps-results question="baseResults.questionCompare" compare="true" ng-switch-when="NPS"></nps-results>
                </ng-switch>
              </div>

              <h6 class="grey-text">({{::baseResults.question.dateFrom}}-{{::baseResults.question.dateTo}})</h6>
              <ng-switch on="baseResults.question.question_type">
                <button-results question="baseResults.question" ng-switch-when="Button"></button-results>
                <image-results question="baseResults.question" ng-switch-when="Image"></image-results>
                <word-results question="baseResults.question" ng-switch-when="Word"></word-results>
                <text-results question="baseResults.question" ng-switch-when="Text"></text-results>
                <slider-results question="baseResults.question" ng-switch-when="Slider"></slider-results>
                <contact-results question="baseResults.question" ng-switch-when="Contact"></contact-results>
                <nps-results question="baseResults.question" ng-switch-when="NPS"></nps-results>
              </ng-switch>
            </div>
          </div>
        </div>
      `,
      controller: BaseResults,
      controllerAs: 'baseResults'
    })

})();
