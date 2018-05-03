var should = require('should');
var request = require('supertest');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var server = require('../helpers/server');
var User = require('../../models/user');

describe('User', function() {
  var url = 'http://localhost:8080';

  it('should be able to change password with a valid token', function(done) {
    User.create({ displayname: 'Kalle', email: 'kalle.ilves@tapin.fi', password: 'kalle123' }, function(err, user) {
      jwt.sign({ tokenFor: 'passwordReset', userId: user._id }, process.env.JWT_SECRET, { }, function(token) {
        request(url)
          .post('/api/user/change_password')
          .send({ token: token, password: 'elina123' })
          .end(function(err, res) {
            res.status.should.be.equal(200);
            done();
          });
      });
    });
  });

  afterEach(function(done) {
    User.remove({}, done);
  });

  after(function(done) {
    server.stop();
    mongoose.connection.close();
    done();
  });

});
