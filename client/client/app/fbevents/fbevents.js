var UserAgent = require('user-agent-parser');

var idGenerator = require('../utils/generate_id');
var query = require('../utils/query');

var meta = query.getParameterByName('meta');
var currentFeedbackId;
var pubSubTokens = [];
var fbeventFeedbacks = {}
var offset = moment().utcOffset();
var chainStartedAt;
var savingQueue = false;

var self = {
  init: function(){
      self._destroy()
      currentFeedbackId = idGenerator();
      chainStartedAt = moment().unix();

      $(".question-type").each(function(){
        $(this).attr("fbevent-id", idGenerator())
      });

      pubSubTokens.push(PubSub.subscribe('SAVE_FEEDBACK', self._save));

  },
  _save: function(event, opts){ // opts = {targetObj, data, type}
    if(window.IS_PREVIEW) return;

    var qIndex = opts.targetObj.closest('.question-type').index();
    var qId = opts.targetObj.closest('.question-type').attr("question-id");
    var fbe_id = opts.targetObj.closest('.question-type').attr("fbevent-id")
    if(["Button", "Image", "NPS", "Word"].indexOf(opts.type) > -1){
      fbeventFeedbacks[qId] = opts.data
    }

    self._prepareFbeventAndSave(_.assign(opts, {fbe_id, qIndex, qId }));

  },

  saveFromQuery: function(){
      var qId = window.PREFILLED.question;
      var val = window.PREFILLED.value;

      var $question = $(".question-type[question-id=" + qId + "]");
      var type = $question.attr("type");

      if(!qId || !val || window.IS_PREVIEW || $question.length === 0){
        return PubSub.publish('NEXT_QUESTION')
      }

      if(type == 'Button' || type == 'NPS' || type == 'Slider'){
        val = parseFloat(val);
      }

      self._prepareFbeventAndSave({
        fbe_id: $question.attr("fbevent-id"),
        qIndex: $question.index(),
        qId,
        data: [val],
        type
      });

      var logic = window.SURVEY_LOGIC[qId] || {};

      if(logic['submit'] !== undefined) {
        PubSub.publish('NEXT_QUESTION', logic['submit']);
      } else if(type === 'Button') {
        var valToString = val.toString().replace('.', '');

        PubSub.publish('NEXT_QUESTION', logic[valToString]);
      } else {
        PubSub.publish('NEXT_QUESTION', logic[val.toString()]);
      }

      window.PREFILLED = {};
  },

  _prepareFbeventAndSave: function(opts){ // opts: {id, isFirst, qId, data, type }
    var fbevent = {
      _id: opts.fbe_id,
      _isFirst: opts.qIndex === 0 ? '1' : '0',
      question_id: opts.qId,
      data: opts.data,
      question_type: opts.type,
      feedback_id: currentFeedbackId,
      device_id : window.device_id,
      survey_id : window.survey_id,
      created_at_adjusted_ts : moment().unix() + (offset*60),
      created_at: new Date(),
      organization_id : window.organization_id,
      feedbacks : fbeventFeedbacks,
      offset : offset,
      meta: _.pick(new UserAgent(window.navigator.userAgent).getResult(), ['browser', 'device', 'os']),
      chain_started_at: opts.qIndex === 0 ? (moment().unix() + (offset*60)) : chainStartedAt
    }

    if(meta) {
      try {
        fbevent.meta = _.assign({}, JSON.parse(decodeURIComponent(meta)), fbevent.meta);
      } catch(exception) {}
    }

    localStorage.setItem(fbevent._id, JSON.stringify(fbevent));

    self.saveQueue();
  },

  saveQueue: function(){
    if(window.IS_PREVIEW) return;

    if(!savingQueue){
      savingQueue = true;

      var q = []

      _.forEach(_.keys(localStorage), function(key){
        q.push(JSON.parse(localStorage[key]))
      });

      async.eachLimit(q, 1, function(fbe, cb){
        var req = $.ajax({
          url: '/api/fbevents',
          type: 'POST',
          data: JSON.stringify(fbe),
          contentType: 'application/json; chartset=utf-8'
        });

        req.done(function(data){
          localStorage.removeItem(fbe._id);
          cb()
        })
        req.fail(function(data){
          if(data.status === 400) {
            localStorage.removeItem(fbe._id);
          }

          cb(data);
        })
      }, function(err){
          if(err) console.error(err);
          savingQueue = false;
      })

    }
  },

  _destroy: function(){
    _.forEach(pubSubTokens, function(token){
      PubSub.unsubscribe(token);
    })
  }
}

module.exports = self;
