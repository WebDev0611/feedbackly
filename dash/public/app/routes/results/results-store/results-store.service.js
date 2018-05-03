(function() {

  class ResultsStore {
    constructor(PubSub) {
      this._PubSub = PubSub;
      this._filter = {};
      this._questionPayload = {};
      this._questions = [];

      this._ON_QUESTION_FILTER_CHANGE = 'ON_QUESTION_FILTER_CHANGE';
      this._ON_QUESTION_PAYLOAD_READY = 'ON_QUESTION_PAYLOAD_READY';
      this._ON_QUESTION_FILTER_INTERACTED = 'ON_QUESTION_FILTER_INTERACTED';
      this._ON_QUESTION_FILTER_RESET = 'ON_QUESTION_FILTER_RESET';
    }

    unSubscripe(sub) {
      this._PubSub.unsubscribe(sub);
    }

    onQuestionFilterChange(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_QUESTION_FILTER_CHANGE, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    triggerQuestionFilterReset() {
      this._PubSub.publish(this._ON_QUESTION_FILTER_RESET);
    }

    triggerQuestionFilterInteracted() {
      this._PubSub.publish(this._ON_QUESTION_FILTER_INTERACTED);
    }

    onQuestionFilterInteracted(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_QUESTION_FILTER_INTERACTED, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    onQuestionFilterReset(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_QUESTION_FILTER_RESET, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    setQuestionFilter(filter) {
      this._filter = _.assign({}, filter);

      this._PubSub.publish(this._ON_QUESTION_FILTER_CHANGE);
    }

    updateQuestionPayload(questionId, payload) {
      this._questionPayload[questionId.toString()] = this._questionPayload[questionId.toString()] || {};

      _.assign(this._questionPayload[questionId.toString()], payload);

      if(_.keys(this._questionPayload).length === this._questions.length) {
        this._PubSub.publish(this._ON_QUESTION_PAYLOAD_READY);
      }
    }

    setQuestions(questions) {
      this._questions = questions;
      this._questionPayload = {};
    }

    getQuestionPayload() {
      var questionsToIndex = {};

      this._questions.forEach((question, index) => { questionsToIndex[question._id.toString()] = index });

      var payloads = [];

      for(questionId in this._questionPayload) {
        payloads.push(this._questionPayload[questionId]);
      }

      payloads.sort((a, b) => questionsToIndex[a.question._id] - questionsToIndex[b.question._id]);

      return payloads;
    }

    onQuestionPayloadReady(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_QUESTION_PAYLOAD_READY, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));

      return token;
    }

    getQuestionFilter() {
      return _.assign({}, this._filter);
    }

    removeFeedbackFilter(filter) {
      var key = `feedbacks.${filter.questionId}`;
      var filters = _.get(this._filter, key) || [];

      this._filter.feedbacks = _.assign({}, this._filter.feedbacks || {}, { [filter.questionId]: _.reject(filters, { value: filter.value }) || [] });

      if((_.get(this._filter, key) || []).length === 0) {
        _.unset(this._filter, key);
      }

      this._PubSub.publish(this._ON_QUESTION_FILTER_CHANGE);
      this._PubSub.publish(this._ON_QUESTION_FILTER_INTERACTED);
    }

    addFeedbackFilter(filter) {
      var filters = _.get(this._filter, `feedbacks.${filter.questionId}`) || [];

      filters.push(filter);

      this._filter.feedbacks = _.assign({}, this._filter.feedbacks || {}, { [filter.questionId]: _.uniqBy(filters, filter => filter.value) });

      this._PubSub.publish(this._ON_QUESTION_FILTER_CHANGE);
      this._PubSub.publish(this._ON_QUESTION_FILTER_INTERACTED);
    }
  }

  ResultsStore.$inject = ['PubSub'];

  angular.module('tapinApp.services')
    .service('ResultsStore', ResultsStore);

})();
