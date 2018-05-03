(function() {

  class UserStore {
    /*@ngInject*/
    constructor($localStorage, PubSub, Languages, Restangular, $q, $http) {
      this._$localStorage = $localStorage;
      this._PubSub = PubSub;
      this._Languages = Languages;
      this._Restangular = Restangular;
      this._$q = $q;
      this._ON_SIGNED_IN_USER_CHANGE = 'ON_SIGNED_IN_USER_CHANGE';
      this._$http = $http;
      this._FETCHING = false;
    }

    getUserSignedIn() {
      return _.assign({}, this._$localStorage.user, { isOrganizationAdmin: this._isOrganizationAdmin(), canCreateSurveys: this._canCreateSurveys() });
    }

    getLocale() {
      var navigatorLanguage = navigator.language || navigator.userLanguage;

      if(navigatorLanguage.indexOf(_.map(this._Languages.getDashboardTranslations(), language => language.code)) < 0) {
        navigatorLanguage = undefined;
      }

      return  _.get(this._$localStorage, 'user.settings.locale') || navigatorLanguage || 'en';
    }

    updateUserSignedIn(updates) {
      this._$localStorage.user = _.assign({}, this._$localStorage.user, updates);

      this._PubSub.publish(this._ON_SIGNED_IN_USER_CHANGE);
    }

    setUserSignedIn(user) {
      this._$localStorage.user = user;
      if(user._id === undefined) this._nullifyRights();

      this._PubSub.publish(this._ON_SIGNED_IN_USER_CHANGE);
    }

    onSignedInUserChange(scope, subscription) {
      var token = this._PubSub.subscribe(this._ON_SIGNED_IN_USER_CHANGE, subscription);

      scope.$on('$destroy', () => this._PubSub.unsubscribe(token));
    }

    _isOrganizationAdmin() {
      var adminOrganizations = _.get(this._$localStorage.user, 'organization_admin') || [];

      return adminOrganizations.indexOf(this._$localStorage.user.organization_id) >= 0;
    }

    _canCreateSurveys() {
      return this._isOrganizationAdmin() || _.get(this._$localStorage.user, 'rights.survey_create') === true;
    }

    onRightsChange(){
      return this._getRights({bust: true});
    }

    getUserRights(){
      var deferred = this._$q.defer();
      var self = this;
      if(this._FETCHING){
        const int = setInterval(function(){
          if(!self._FETCHING){
            if(self.cacheRights) deferred.resolve(self.cacheRights)
            if(!self.cacheRights) self._getRights().then(r => deferred.resolve(r));
            clearInterval(int);
          }
        }, 300)
      } else return this._getRights()
      return deferred.promise;
    }

    getUserRightsBust(){
      return this._getRights({bust:true});
    }

    _nullifyRights(){
      this._$localStorage.userRights = undefined;
    }

    _getRights(opts){
      var deferred = this._$q.defer();
        var bust = _.get(opts, 'bust') === true;
        this._FETCHING = true;
        this._$http.get("/api/user-rights?bust=" + bust)
        .then(
          success => {
            deferred.resolve(success.data)
            this.cacheRights = success.data;
            this._FETCHING = false;
          },
          error => {
            deferred.reject(error);
            this._FETCHING = false;
          }
        )
      return deferred.promise;

    }

  }

  angular.module('tapinApp.services')
    .service('UserStore', UserStore);

})();
