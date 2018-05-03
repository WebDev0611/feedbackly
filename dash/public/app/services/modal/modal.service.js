/*
* Since I used Visual Studio to write this, I used VS XML Docs to document it, but anyone can read it.
* I only documented the open method, but since it's the only puclic method, its all you need..
*/
(function () {
	'use strict';

	angular
		.module('ui.materialize')
		.factory('modal', modal);

	modal.$inject = ['$http', '$compile', '$rootScope', '$document', '$q', '$controller', '$timeout'];

	function modal($http, $compile, $rootScope, $document, $q, $controller, $timeout) {
		var service = {
			open: open
		};

		function open(options) {
			/// <summary>Opens a modal</summary>
			/// <param name="options" type="Object">
			/// ? title {string} The title of the modal.<br />
			/// ? scope {$scope} The scope to derive from. If not passed, the $rootScope is used<br />
			/// ? params {object} Objects to pass to the controller as $modalInstance.params<br />
			/// ? template {string} The HTML of the view. Overriden by @templateUrl<br />
			/// ? templateUrl {string} The URL of the view. Overrides @template<br />
			/// ? fixedFooter {boolean} TRUE if the modal should have a fixed footer<br />
			/// ? controller {string||array||function} A controller definition<br />
			/// ? controllerAs {string} the controller alias for the controllerAs sintax. Requires @controller
			/// </param>
			/// <param name="options.title" type="String">The title of the window</param>
			/// <returns type="$.when" />

			var deferred = $q.defer();

			getTemplate(options).then(function (modalBaseTemplate) {
				var modalBase = angular.element(modalBaseTemplate);

				// temp fix:
				var openModal = function() { modalBase.modal(); modalBase.modal('open')};
				var closeModal = function() { modalBase.modal('close'); };

				var scope = $rootScope.$new(false, options.scope),
					modalInstance = {
						params: options.params || {},
						close: function (result) {
							deferred.resolve(result);
							closeModal();
						},
						dismiss: function (reason) {
							deferred.reject(reason);
							closeModal();
						}
					};

				scope.$close = modalInstance.close;
				scope.$dismiss = modalInstance.dismiss;

				$compile(modalBase)(scope);


				runController(options, modalInstance, scope);

				modalBase.appendTo('body');
				openModal();


			}, function (error) {
				deferred.reject({ templateError: error });
			});

			return deferred.promise;
		}

		function runController(options, modalInstance, scope) {
			/// <param name="option" type="Object"></param>

			if (!options.controller) return;

			var controller = $controller(options.controller, {
				$scope: scope,
				$modalInstance: modalInstance
			});

			if (angular.isString(options.controllerAs)) {
				scope[options.controllerAs] = controller;
			}
		}

		function getTemplate(options) {
			var deferred = $q.defer();

			if (options.templateUrl) {
				$http.get(options.templateUrl).success(function (data) {
					deferred.resolve(data);
				}).catch(function (error) {
					deferred.reject(error);
				});
			} else {
				deferred.resolve(options.template || '');
			}


			return deferred.promise.then(function (template) {

				var cssClass = options.fixedFooter ? 'modal modal-fixed-footer' : 'modal';
				var html = [];
				html.push('<div class="' + cssClass + '">');
				if (options.title) {
					html.push('<div class="modal-header">');
					html.push(options.title);
					html.push('<a class="grey-text text-darken-2 right" ng-click="$dismiss()">');
					html.push('<i class="mdi-navigation-close" />');
					html.push('</a>');
					html.push('</div>');
				}
				html.push(template);
				html.push('</div>');

				return html.join('');
			});
		}



		return service;
	}
})();
