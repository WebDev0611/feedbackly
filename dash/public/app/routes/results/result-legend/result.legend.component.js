(function() {

  class ResultLegend {
    /*@ngInject*/
    constructor($scope, Buttons, ResultsStore, LocaleText) {
      this._Buttons = Buttons;
      this._ResultsStore = ResultsStore;
      this.canBeFiltered = ['Image', 'Word', 'NPS', 'Button'].indexOf(this.question.question_type) >= 0;
      this._LocaleText = LocaleText;

      $scope.$watch(() => this.unit, () => this._updateTotals());

      this._updateTotals();

      this._ResultsStore.onQuestionFilterChange($scope, () => {
        this._updateTotals();
      });

      this.displayLimit = 11;
    }

    showAll() {
      this.displayLimit = this.totals.length;
    }

    _getColor(name) {
      if(this.colorMapper !== undefined) {
        var mapper = this.colorMapper();

        return mapper[name];
      } else {
        return '';
      }
    }

    toggleFeedbackFilter(value) {
      var data = {};

      switch(this.question.question_type) {
        case 'Button':
          data = { value: parseFloat(value.id), label: parseFloat(value.id), valueToStr: value.id.toString() };
          break;
        case 'Image':
          data = { value: value.id, label: this.getImageUrl(value.id), valueToStr: value.id.toString() };
          break;
        case 'Word':
          data = { value: value.id, label: value.name, valueToStr: value.id.toString() };
          break;
        case 'NPS':
          data = { value: parseFloat(value.id), label: parseFloat(value.name) * 10, valueToStr: value.id.toString() };
          break;
      }
      var filter = {
        questionId: this.question._id,
        questionType: this.question.question_type,
        title: this._LocaleText.getText(this.question.heading)
      };

      var newFilter = _.assign(filter, data);

      if(value.isFiltered) {
        this._ResultsStore.removeFeedbackFilter(newFilter)
      } else {
        this._ResultsStore.addFeedbackFilter(newFilter);
      }
    }

    buttonValueToClass(value) {
      return this._Buttons.buttonValueToClass(value, (this.question.opts || {}).buttonStyle);
    }

    getImageUrl(id) {
      var image = _.find(this.question.choices, { id: id });

      return _.get(image, 'url');
    }

    _updateTotals() {
      var suffix = this.unit === 'normalized'
        ? '%'
        : '';

      this.legend = [..._.map(this.totals, total => {
        var isFiltered = this._isFiltered(total.id);
        var color = tinycolor(this._getColor(total.name));
        var style = { 'border-right': `3px solid ${color.toHexString()}` };

        if(isFiltered) {
          style['background-color'] = color.lighten(5).toHexString();
          style['color'] = 'white';
        } else {
          delete style['background-color'];
          delete style['color'];
        }

        return _.assign({}, total, { value: total.value + suffix, isFiltered, style, trackId: `${total.name}_${total.id}_${this.unit}` })
      })];
    }

    _isFiltered(id) {
      var feedbackFilters = _.get(this._ResultsStore.getQuestionFilter(), `feedbacks.${this.question._id}`) || [];

      var filter = _.find(feedbackFilters, { valueToStr: id });

      return filter !== undefined;
    }
  }

  angular.module('tapinApp.components')
    .component('resultLegend', {
      bindings: {
        totals: '<',
        question: '<',
        unit: '<',
        colorMapper: '&'
      },
      controller: ResultLegend,
      controllerAs: 'resultLegend',
      templateUrl: '/app/routes/results/result-legend/result-legend.template.html'
    });

})();
