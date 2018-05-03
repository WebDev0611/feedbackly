'use strict';

var _ = require('lodash');
var Survey = require('../models/survey');
var Question = require('../models/question');
var Devicegroup = require('../models/devicegroup');
var Device = require('../models/device');
var User = require('../models/user');
var Organization = require('../models/organization');
var jwt = require('jsonwebtoken');
var Promise = require('bluebird');


exports.isLoggedIn = function (role) {
  var jwtAuth = require('../../config/auth')()

  return function (req, res, next) {
    jwtAuth.authenticate()(req, res, () => {
      if (req.isAuthenticated()){
        return next();
      } else {
        return res.send(401);
      }
    })
  };
};

exports.isCurrentUser = function(getter) {
  return (req, res, next) => {
    if(req.user.system_admin === true) {
      return next();
    }

    var userId = getter(req);

    if(!userId) {
      return res.sendStatus(400);
    }

    if(userId.toString() === req.user._id.toString()) {
      return next();
    } else {
      return res.sendStatus(401);
    }
  }
}

exports.deviceGroupsAreInOrganization = function(getter) {
  return (req, res, next) => {
    if(req.user.system_admin === true) {
      return next();
    }

    var groupIds = getter(req);

    if(_.isEmpty(groupIds)) {
      return next();
    }

    Devicegroup.find({ _id: { $in: groupIds } })
      .then(groups => {
        if(_.every(groups, group => group.organization_id.toString() === req.user.organization_id.toString())) {
          return next();
        } else {
          return res.sendStatus(401);
        }
      })
      .catch(err => res.sendStatus(500));
  }
}

exports.isUserOrIsOrganizationAdmin = function(getter) {
  return (req, res, next) => {
    var targetUser = getter(req);

    if(targetUser === undefined) {
      return res.sendStatus(404);
    }

    var isUser = targetUser._id.toString() === req.user._id.toString();
    var adminStatus = _.map(targetUser.organization_id || [], id => req.user.isOrganizationAdminOf(id));

    if(isUser) {
      req.isUser = true;
    }

    if(_.some(adminStatus, Boolean) || req.user.system_admin === true) {
      req.isOrganizationAdmin = true;
    }

    if(!(req.isUser || req.isOrganizationAdmin)) {
      return res.sendStatus(401);
    } else {
      next();
    }
  }
}

exports.isOrganizationAdmin = function(getter) {
  return function(req, res, next) {
    if(req.user.system_admin === true) {
      return next();
    }

    var organizationId = getter(req);

    if(!organizationId) {
      return res.sendStatus(400);
    }

    var isAdmin = false;

    if(_.isArray(organizationId)) {
      var adminStatus = _.map(organizationId, id => req.user.isOrganizationAdminOf(id));
      isAdmin = _.some(adminStatus, Boolean);
    } else {
      isAdmin = req.user.isOrganizationAdminOf(organizationId);
    }

    if(isAdmin) {
      return next();
    }else {
      return res.sendStatus(401);
    }

  }
}

exports.isInOrganization = function(getter) {
  return function(req, res, next) {
    if(req.user.system_admin === true) {
      return next();
    }

    var organizationId = getter(req);

    if(!organizationId) {
      return res.sendStatus(400);
    }

    var usersOrganizations = [...(req.user.organization_admin || []), ...(req.user.organization_id || [])];

    var inOrganization = _.find(usersOrganizations, organization => organization.toString() === organizationId.toString()) !== undefined;

    if(inOrganization) {
      return next();
    }else {
      return res.sendStatus(401);
    }

  }
}


exports.surveyIsInOrganization = function(getter) {
  return (req, res, next) => {
    var organizationId = getter(req);

    if(organizationId === undefined) {
      return res.sendStatus(400);
    }

    Survey.findOne({ _id: organizationId })
      .then(survey => {
        if(!survey) {
          return res.sendStatus(404);
        } else if(survey.organization.toString() !== req.user.activeOrganizationId().toString()) {
          return res.sendStatus(401);
        } else {
          req.targetSurvey = survey;
          next();
        }
      })
      .catch(err => res.sendStatus(500));
  }
}

exports.canCreateSurvey = function(req, res, next) {
  if(req.user.system_admin === true) {
    return next();
  }

  if(req.user.isOrganizationAdmin()) {
    return next();
  }

  req.user.rights()
    .then(rights => {
      if(rights.survey_create) {
        return next();
      } else {
        return res.sendStatus(401);
      }
    })
    .catch(err => res.sendStatus(500));
}

exports.hasValidToken = function(getter, options) {
  return function(req, res, next) {
    var jwtSecret = process.env.JWT_SECRET;
    var token = getter(req);

    if(!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    jwt.verify(token, jwtSecret, function(err, decoded) {
      if(err || decoded.tokenFor !== options.for) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      } else {
        req[options.name.toString()] = decoded;
        next();
      }
    });
  }
}

exports.hasValidApiKey = function(getter) {
  return (req, res, next) => {
    var apiKey = getter(req);

    if(apiKey === undefined) {
      return res.sendStatus(400);
    } else if(apiKey.toString() !== process.env.API_KEY.toString()) {
      return res.sendStatus(401)
    } else {
      next();
    }
  }
}

exports.canEditQuestion = function(getter) {
  return function(req, res, next) {
    if(req.user.system_admin === true) {
      return next();
    }

    var questionId = getter(req);

    if(!questionId) {
      return res.sendStatus(400);
    }

    req.user.rights()
      .then(rights => {
        return Question.findOne({ _id: questionId })
          .then(question => {
            if(!question) {
              return res.sendStatus(404);
            } else if(question.organization_id.toString() !== req.user.activeOrganizationId().toString()) {
              return res.sendStatus(401);
            } else if(rights.survey_create === false && !req.user.isOrganizationAdminOf(question.organization_id || '')) {
              return res.sendStatus(401);
            } else {
              return next();
            }
          })
      })
      .catch(err => res.sendStatus(500));
  }
}

exports.canEditSurvey = function(getter) {
  return function(req, res, next) {
    if(req.user.system_admin === true) {
      return next();
    }

    var surveyId = getter(req);

    if(!surveyId) {
      return res.sendStatus(400);
    }

    var promises = [req.user.rights(), Survey.findOne({ _id: surveyId })];

    Promise.all(promises)
      .spread((rights, survey) => {
        if(!survey) {
          return res.sendStatus(404);
        } else if(survey.organization.toString() !== req.user.activeOrganizationId()) {
          return res.sendStatus(401);
        } else if(rights.survey_create === false && !req.user.isOrganizationAdminOf(survey.organization || '')) {
          return res.sendStatus(401);
        } else {
          console.log('can edit survey');
          return next();
        }
      })
      .catch(() => res.sendStatus(500));
  }
}

exports.canAccessDevices = function(getter) {
  return function(req, res, next) {
    if(req.user.system_admin === true) {
      return next();
    }

    var devices = getter(req);

    if(_.isEmpty(devices)) {
      return next();
    }

    devices = _.map(devices, id => id.toString());

    req.user.devices()
      .then(usersDevices => {
        var deviceIds = _.map(usersDevices, device => device._id.toString());
        var difference = _.difference(devices, deviceIds);

        if(difference.length === 0) {
          return next();
        } else {
          return res.sendStatus(401);
        }
      })
      .catch(() => res.sendStatus(500));
  }
}

exports.canAccessDeviceGroups = function(getter) {
  return function(req, res, next) {
    if(req.user.system_admin === true) {
      return next();
    }

    var deviceGroups = getter(req);

    if(_.isEmpty(deviceGroups)) {
      return next();
    }

    req.user.devicegroups()
      .then(usersGroups => {
        groupIds = _.uniq(groupIds);

        var groupIds = _.map(usersGroups, group => group._id.toString());
        var difference = _.difference(deviceGroups, groupIds);

        if(difference.length === 0) {
          return next();
        } else {
          return res.sendStatus(401);
        }
      })
      .catch(() => res.sendStatus(500));
  }
}

exports.isLoggedInAndAdmin = function(){
  var jwtAuth = require('../../config/auth')()

	return function (req, res, next) {
    jwtAuth.authenticate()(req, res, () => {
		if (req.isAuthenticated() && req.user.system_admin === true){
			return next();
		} else if (req.isAuthenticated()){
			res.send(401);
		} else {
			res.send(401);
		}
  })
	};
};
