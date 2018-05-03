(function() {

  class ButtonControl {
    /*@ngInject*/
    constructor(Buttons){
      this.Buttons = Buttons;
      this.qtype = this.question.question_type
      if(this.qtype == 'Button') this.choices =  this.Buttons.buttonValues(this.question.choices.length).sort((a,b)=>b-a);
      if(this.qtype == 'NPS') this.choices = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]
      if(this.qtype == 'Word' || this.qtype == 'Image') this.choices = _.map(this.question.choices, 'id');

      this.conditionSet = _.find(this.conditionSets, {question_id: this.question._id, orGroupId: this.orGroupId})
      if(this.conditionSet){
        var conditions = _.get(this, 'conditionSet.conditions.or');
        _.forEach(conditions, c => {
          this.selections = _.assign({}, this.selections, {[c.value]: true})
        })
      }
    }

    getElById(id){
      return _.find(this.question.choices, {id: id});
    }

    onValueChange(){
      _.forEach(this.selections, (val, key) => {
        var k = ['NPS', 'Button'].indexOf(this.qtype) > -1 ? parseFloat(key) : key
        if(val === true) this.addValue(k);
        else this.removeValue(k)
      })
      this.conditionSets = _.reject(this.conditionSets, {question_id: this.question._id})
      this.conditionSets.push(this.conditionSet)
    }

    addValue(value){
      if(!_.get(this.conditionSet, 'key')) this.createConditionSet();
      var val = _.find(this.conditionSet.conditions.or, {value: value});
      if(!val) this.conditionSet.conditions.or.push({fn: 'equals', value: value})
      if(this.conditionSet.conditions.or.length === 0) this.conditionSet = undefined;
    }

    toggleValue(value){
      if(_.find(this.conditionSet.conditions.or, {value: value})) this.emoveValue(value);
      else this.addValue(value)
    }

    removeValue(value){
      this.conditionSet.conditions.or = _.reject(this.conditionSet.conditions.or, {value: value})
    }

    createConditionSet(){
      this.conditionSet = {
          question_id: this.question._id,
          key: 'dataMap',
          conditions: {or:[]},
          orGroupId: this.orGroupId
      }

    }
  }

  angular.module('tapinApp.components')
    .component('buttonControl', {
      bindings: {
        conditionSets: '=',
        question: '<',
        displayLanguage: '<',
        orGroupId: '@'
      },
      controller: ButtonControl,
      controllerAs: 'buttonControl',
      templateUrl: '/app/routes/notifications/controls/button/button-control.template.html'
    });

})();
