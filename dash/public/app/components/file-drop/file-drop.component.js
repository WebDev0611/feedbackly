(function() {

  class FileDrop {
    constructor() {
      this.uploader.onAfterAddingFile = (item) => {
        if(_.isFunction(this.onAddingFile)) {
          this.onAddingFile({ item });
        };

        this.filesInQueue = _.map(this.uploader.queue, data => data.file.name || '').join(', ');
      }
    }
  }

  angular.module('tapinApp.components')
    .component('fileDrop', {
      bindings: {
        uploader: '<',
        onAddingFile: '&'
      },
      controller: FileDrop,
      controllerAs: 'fileDrop',
      templateUrl: '/app/components/file-drop/file-drop.template.html'
    })

})();
