(function() {

  class Files {
    download(url) {
      downloadFile(url);
    }

    dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var array = [];

      for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }

      return new Blob([new Uint8Array(array)], {type: mimeString});
    }

    textToQrCode(text, options = {}) {
      options = _.assign({ width: 500, height: 500}, options);

      var $qrContainer = $(`<div style="position: absolute; top: -${options.width}px; left: -${options.height}px; width: ${options.width}px; height: ${options.height}px"></div>`)

      $('body')
        .append($qrContainer);

      var code = new QRCode($qrContainer[0], {
        text: text,
        width: options.width,
        height: options.height,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });

      setTimeout(() => {
        this.download($qrContainer.find('img')[0].src);
        $qrContainer.remove();
      }, 500);
    }

    fileTypeValidator(type) {
      return (item) => {
        if(type=='text/csv' && /\.csv$/.test(item.name)) return true;
        return item.type === type;
      }
    }
  }

  angular.module('tapinApp.services')
    .service('Files', Files);

})();
