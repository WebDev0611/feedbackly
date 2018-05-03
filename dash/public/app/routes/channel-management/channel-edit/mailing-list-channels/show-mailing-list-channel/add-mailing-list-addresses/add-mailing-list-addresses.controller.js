(function() {

  class AddMailingListAddressesController {
    constructor($scope, Restangular, $filter, FileUploader, Files, MailingListsStore, messageConstants, ChannelsStore, Toaster, UserStore) {
      this._$scope = $scope;
      this._Restangular = Restangular;
      this._$filter = $filter;
      this._Toaster = Toaster;
      this._MailingListsStore = MailingListsStore;
      this._ChannelsStore = ChannelsStore;
      this._messageConstants = messageConstants;
      this._UserStore = UserStore;

      this.channel = this._ChannelsStore.getActiveChannel();
      

      this.uploader = new FileUploader({
    		url: '/api/mailinglists/' + this.channel._id + '/upload',
    		queueLimit: 1,
        filters: [{ name: 'CSV', fn: Files.fileTypeValidator('text/csv') }],
    		autoUpload: false,
    		removeAfterUpload: true,
    		formData: []
    	});

      this.newAddress = { fname: '', lname: '', email: '' };

      this.uploader.onCompleteAll = () => {
        this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
        this._MailingListsStore.addAddress({});
        if(!(this.errors && this.errors.length > 0)) this.close();
      }
      
      this.uploader.onCompleteItem = (item, response, status, headers) => {
        if(response.length > 0){
          this.errors = response;
        }
      } 
    }

    addAddress(isValidForm) {
      if(isValidForm) {
        this._Restangular
          .one('mailinglists', this.channel._id)
          .all('addresses')
          .post(this.newAddress)
          .then(() => {
            this._Toaster.success(this._messageConstants.SAVING_SUCCEEDED);
            this._MailingListsStore.addAddress(this.newAddress);
            this.newAddress = { fname: '', lname: '', email: '' };
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

  AddMailingListAddressesController.$inject = ['$scope', 'Restangular', '$filter', 'FileUploader', 'Files', 'MailingListsStore', 'messageConstants', 'ChannelsStore', 'Toaster', 'UserStore'];

  angular.module('tapinApp.routes')
    .controller('AddMailingListAddressesController', AddMailingListAddressesController);

})();
