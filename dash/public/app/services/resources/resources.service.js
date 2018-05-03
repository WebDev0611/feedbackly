(function() {

  angular.module('tapinApp.services')
    .factory("User", ['$resource', function($resource) {
        return $resource("/api/users/:id", { id: '@_id' }, {
          update: {method: 'PUT'}
        });
    }])
    .factory('MailingList', ['$resource', function($resource) {
        return $resource("/api/mailinglists/:id", { id: '@_id' }, {
          update: {method: 'PUT'}
        });
    }])
  	.factory("UserSettings", ['$resource', function($resource) {
          return $resource("/api/user", {}, {
            update: {method: 'PUT'}
          });
      }])
  	.factory("Organization", ['$resource', function($resource) {
          return $resource("/api/organizations/:id", { id: '@_id' }, {
              update: {method: 'PUT'}
          });
      }])
  	.factory("Survey", ['$resource', function($resource) {
        return $resource("/api/surveys/:id", { id: '@_id' }, {
            update: {method: 'PUT'},
            schedulations: { method: 'GET', params: { id: '@_id' }, url: '/api/surveys/:id/schedulations' }
        });
    }])
  	.factory("Question", ['$resource', function($resource) {
        return $resource("/api/questions/:id", { id: '@_id' }, {
            update: {method: 'PUT'}
        });

    }])
  	.factory("Fbevent", ['$resource', function($resource) {
        return $resource("/api/fbevents/:id", { id: '@_id' }, {
        });
    }])
  	.factory("Device", ['$resource', function($resource) {
        return $resource("/api/devices/:id", { id: '@_id' }, {
            update: {method: 'PUT'},
            tree: { method: 'GET', isArray: true, url: '/api/devices/tree' },
            activateSurvey: { method: 'POST', url: '/api/devices/activate_survey' },
            schedulations: { method: 'GET', params: { id: '@_id' }, url: '/api/devices/:id/schedulations' }
        });
    }])
  	.factory("AdminDevice", ['$resource', function($resource) {
        return $resource("/api/devices/:id?admin=true", { id: '@_id' }, {
            update: {method: 'PUT'}
        });
    }])
  	.factory("Devicegroup", ['$resource', function($resource) {
        return $resource("/api/devicegroups/:id", { id: '@_id' }, {
            update: {method: 'PUT'}
        });
    }])
  	.factory("AdminDevicegroup", ['$resource', function($resource) {
        return $resource("/api/devicegroups/:id?admin=true", { id: '@_id' }, {
            update: {method: 'PUT'}
        });
    }]);

})();
