(function() {

  class SliderControl {
    /*@ngInject*/
    constructor(){
      this.choices = this.question.choices;
      this.values = {}
      this.operators = {}

      _.forEach(_.filter(this.conditionSets, {question_id: this.question._id}), c => {
        var id = c.key.split("dataMap[").join("").split("]").join("").split("'").join("").split("'").join("");
        var choice = _.find(this.choices, {id})
        if(choice){
          var opAndVal = _.find(c.conditions.and, {fn: 'isGreaterOrLess'});
          if(opAndVal){
            opAndVal = opAndVal.value.split("")
            this.operators[id] = opAndVal[0];
            this.values[id] = opAndVal[1]
          }

        }
      })

    }

    createConditionSet(id, fn, val){
      return {
          question_id: this.question._id,
          key: `dataMap['${id}']`,
          conditions: {and:[
            {fn: "isGreaterOrLess", value: `${fn}${val}`}
          ]},
          orGroupId: this.orGroupId
      }

    }

    onChange(){
      var set = [];
      _.forEach(this.choices, choice => {
        var val = this.values[choice.id];
        var operator = this.operators[choice.id];
        if(val && operator){
          var cs = this.createConditionSet(choice.id, operator, val)
          set.push(cs)
        }
      })

      this.conditionSets = _.reject(this.conditionSets, {question_id: this.question._id})
      this.conditionSets = [...this.conditionSets, ...set]
    }

  }

  angular.module('tapinApp.components')
    .component('sliderControl', {
      bindings: {
        conditionSets: '=',
        question: '<',
        displayLanguage: '<',
        orGroupId: '@'
      },
      controller: SliderControl,
      controllerAs: 'sliderControl',
      templateUrl: '/app/routes/notifications/controls/slider/slider-control.template.html'
    });

})();
