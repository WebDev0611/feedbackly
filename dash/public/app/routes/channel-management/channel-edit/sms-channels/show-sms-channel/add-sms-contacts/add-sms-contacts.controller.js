(function() {

  class AddSmsContactsController {
    constructor($scope, Restangular, $filter, FileUploader, Files, SmsContactsStore, messageConstants, ChannelsStore, Toaster) {
      this._$scope = $scope;
      this._Restangular = Restangular;
      this._$filter = $filter;
      this._Toaster = Toaster;
      this._SmsContactsStore = SmsContactsStore;
      this._ChannelsStore = ChannelsStore;
      this._messageConstants = messageConstants;

      this.channel = this._ChannelsStore.getActiveChannel();

      this.uploader = new FileUploader({
    		url: '/api/sms_channels/' + this.channel._id + '/upload',
    		queueLimit: 1,
        filters: [{ name: 'CSV', fn: Files.fileTypeValidator('text/csv') }],
    		autoUpload: false,
    		removeAfterUpload: true,
    		formData: []
    	});

      this.newContact = { fname: '', lname: '', phone_number: '' };

      this.uploader.onCompleteAll = () => {
        this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
        this._SmsContactsStore.addContact({});
    		this.close();
    	}
    }

    addContact(isValidForm) {
      if(isValidForm) {
        this._Restangular
          .one('sms_channels', this.channel._id)
          .all('contacts')
          .post(this.newContact)
          .then(() => {
            this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
            this._SmsContactsStore.addContact({});

            this.newContact = { fname: '', lname: '', phone_number: '' };
          });
      }
    }

    upload() {
      this.uploader.uploadAll();
    }

    close() {
      this._$scope.$close();
    }
  }

  AddSmsContactsController.$inject = ['$scope', 'Restangular', '$filter', 'FileUploader', 'Files', 'SmsContactsStore', 'messageConstants', 'ChannelsStore', 'Toaster'];

  angular.module('tapinApp.routes')
    .controller('AddSmsContactsController', AddSmsContactsController);

})();
