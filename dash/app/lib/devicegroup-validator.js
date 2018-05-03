var _ = require('lodash');

var Devicegroup = require('../models/devicegroup');

function noCycle(groupIdGetter, childGroupIdsGetter) {
  return (req, res, next) => {
    var groupId = (groupIdGetter(req) || '').toString();
    var childGroupIds = childGroupIdsGetter(req);

    if(_.isEmpty(childGroupIds)) {
      return next();
    }

    childGroupIds = _.map(childGroupIds, id => id.toString());

    Devicegroup.find({ _id: { $in: childGroupIds } })
      .then(groups => {
        var children = _.reduce(groups, (allChildren, group) => {
          return [...allChildren, ..._.map(group.devicegroups || [], child => child.toString())];
        }, []);

        if(children.indexOf(groupId.toString()) >= 0 && childGroupIds.indexOf(groupId.toString()) < 0) {
          return res.sendStatus(400);
        } else {
          return next();
        }
      });
  }
}

module.exports = { noCycle };
