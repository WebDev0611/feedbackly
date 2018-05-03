(function() {

  class Toaster {
    constructor($filter) {
      this._$filter = $filter;
    }

    _toast(message, options) {
      options = _.defaults(options, { translate: true, duration: 3000 });

      var content = options.translate === true
        ? this._$filter('translate')(message)
        : message;

      if(!options.type) {
        Materialize.toast(content, options.duration);
      } else {
        Materialize.toast(content, options.duration, options.type);
      }
    }

    neutral(message, options) {
      this._toast(message, options);
    }

    success(message, options) {
      this._toast(message, _.assign({}, options, { type: 'toast-success' }));
    }

    danger(message, options) {
      this._toast(message, _.assign({}, options, { type: 'toast-danger' }));
    }
  }

  Toaster.$inject = ['$filter'];

  angular.module('tapinApp.services')
    .service('Toaster', Toaster);

})();
