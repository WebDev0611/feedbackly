(function() {

  class ContactControl {
    /*@ngInject*/
    constructor(){
      this.choices = this.question.choices;

      if(this.question.question_type === 'Text'){
        this.choices = [{type: 'string', id: '0', text: {en: 'Input'}}]
      }

      this.dummyFields = {}
      this.checkboxes = {}
      _.forEach(this.choices, choice => {
        this.dummyFields[choice.id] = []
      })

      _.forEach(_.filter(this.conditionSets, {question_id: this.question._id, orGroupId: this.orGroupId}), c => {
        var id = c.key.split("dataMap[").join("").split("]").join("").split("'").join("").split("'").join("");
        var choice = _.find(this.choices, {id})
        if(choice){
          if(choice.type == 'string'){
            this.dummyFields[id] = c.conditions.and;
          }
          if(choice.type == 'boolean'){
            var cond = _.find(c.conditions.and, {fn: "equals"});
            if(cond){
              this.checkboxes[id] = cond.value;
            }
          }
        }


      })

    }


    createConditionSet(id){
      var key = this.question.question_type === 'Text' ? id : `'${id}'`
      return {
          question_id: this.question._id,
          key: `dataMap[${key}]`,
          conditions: {and:[]},
          orGroupId: this.orGroupId
      }

    }

    fnAvailable(fieldId, thisName, fn){
      var cs = this.dummyFields[fieldId]
      var usedFns = _.map(cs, 'fn');
      var used = usedFns.indexOf(fn) === -1;
      if(thisName === fn) return true;
      else return used;
    }

    addCondition(conditionArray){
      conditionArray.push({fn: undefined, value: []});
    }

    removeCondition(fieldId, fn){
      this.dummyFields[fieldId] = _.reject(this.dummyFields[fieldId], {fn: fn});
      this.updateConditionSet()
    }

    updateConditionSet(){
      var set = [];
      _.forEach(this.dummyFields, (conditions, id) => {
        var cs = this.createConditionSet(id);
        _.forEach(conditions, condition => {
          if(condition.fn !== undefined && condition.value !== undefined && condition.value.length > 0){
              if(condition.fn ==='length') cs.conditions.and.push(condition)
              else cs.conditions.and.push({fn: condition.fn, value: _.map(condition.value, 'text')});
          }
        })
        if(cs.conditions.and.length > 0) set.push(cs);
      })

      _.forEach(this.checkboxes, (value, id) => {
        if(value !== undefined && value !== ""){
          var cs = this.createConditionSet(id);
          var isTrueSet = (value === 'true');
          cs.conditions.and = [{fn: 'equals', value: isTrueSet}]
          set.push(cs)
        }
      })
      this.conditionSets = _.reject(this.conditionSets, {question_id: this.question._id});
      this.conditionSets = [...this.conditionSets, ...set]
    }
  }

  angular.module('tapinApp.components')
    .component('contactControl', {
      bindings: {
        conditionSets: '=',
        question: '<',
        displayLanguage: '<',
        orGroupId: '@'
      },
      controller: ContactControl,
      controllerAs: 'contactControl',
      templateUrl: '/app/routes/notifications/controls/contact/contact-control.template.html'
    });

})();
