var should = require('should');
var mongoose = require('mongoose');

var database = require('../../../config/database').url;
var User = require('../../models/user');

describe('User', function() {

  before(function() {
    mongoose.connect(database);
  });

  it('should not be able to create user without an email', function(done) {
    User.create({ displayname: 'kalle' }, function(err, user) {
      should.exist(err);

      done();
    });
  });

  it('should be able to create user with correct information', function(done) {
    User.create({ email: 'kalle.ilves@tapin.fi', displayname: 'kalle', password: 'kalle123' }, function(err, user) {
      should.not.exist(err);

      should.exist(user);
      should(user).have.property('_id');
      should(user).have.property('displayname', 'kalle');

      done();
    });
  });

  afterEach(function(done) {
    User.remove({}, done);
  });

  after(function() {
    mongoose.connection.close();
  });

});
