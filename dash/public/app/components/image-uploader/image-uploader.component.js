(function() {

  class ImageUploader {
    /*@ngInject*/
    constructor(FileUploader, $timeout, $scope, Files, UserStore) {
      this._$timeout = $timeout;
      this._$scope = $scope;
      this._Files = Files;
      this.jwt = UserStore.getUserSignedIn().jwt;

      this.uploader =  new FileUploader({
    		url: '/upload',
    		queueLimit: 2,
    		autoUpload: false,
    		removeAfterUpload: true,
        headers: {
          'Authorization': 'JWT ' + this.jwt,
          'Image-Type': this.imageType || ''
        }
    	});

      this.uploader.filters.push({
        name: 'imageFilter',
        fn: function(item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
    }

    cancel() {
      this.preview = undefined;
      this.uploader.clearQueue();
    }

    onAfterAddingFile(item) {
      if(this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(0);
      }

      var reader = new FileReader();

      this.preview = {};

      reader.onload = (event) => {
        this._$scope.$apply(() => {
          this.preview = { dataUrl: event.target.result };
          this._uploadImage();
        });
      };

      reader.readAsDataURL(item._file);
    }

    removeImage() {
      if(typeof this.onRemoveImage === 'function') {
        this.onRemoveImage();
      }
    }

    _uploadImage() {
      var img = new Image();

      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = img.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(img, 0, 0);

        // ... or get as Data URI
        var data_uri = canvas.toDataURL('image/png');
        var blob = this._Files.dataURItoBlob(data_uri);

        this.uploader.queue[0]._file = blob;

        this.onImage({ uploader: this.uploader });
      }

      img.src = this.preview.dataUrl;
    }

  }

  angular.module('tapinApp.components')
    .component('imageUploader', {
      bindings: {
        image: '<',
        onImage: '&',
        onRemoveImage: '&',
        imageType: '@'
      },
      controller: ImageUploader,
      controllerAs: 'imageUploader',
      templateUrl: '/app/components/image-uploader/image-uploader.template.html'
    });

})();
