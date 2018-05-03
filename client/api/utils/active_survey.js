var mongoose = require('mongoose');
var Device = require('app-modules/models/device')
var Survey = require('app-modules/models/survey')
var Question = require('app-modules/models/question')
var Organization = require('app-modules/models/organization')

var q = require('q');

var self = {
  getByUdid: udid => {

    var promise = Device.findOne({udid: udid}).then(device => {
      return Survey.findOne({_id: device.active_survey}).populate('organization question_ids').then(survey => {
        if (!survey) return new Error("not found")
        return {device: device, survey: survey}
      })
    })

    return promise;
  },

  getById: function(id){
    var query = {_id: id}
    return self._get(query)
  },

  _get: function(query){

  }
}

module.exports = self;
