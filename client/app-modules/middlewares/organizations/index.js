var _ = require('lodash');

var general = require('app-modules/middlewares/general');
var errors = require('app-modules/errors');
var clientState = require('app-modules/middlewares/client-state');

var Organization = require('app-modules/models/organization');

function getOrganizationById(getId) {
  return general.existsOrError({
    getPromise: req => Organization.findOne({ _id: getId(req) }),
    name: 'organization'
  });
}

function getOrganizationDecorators(getOrganization) {
  return clientState.addClientDecorator(req => {
    var organization = getOrganization(req);

    return _.get(organization, 'meta.eurosec') ? 'eurosec' : undefined;
  })
}


module.exports = { getOrganizationById, getOrganizationDecorators };
