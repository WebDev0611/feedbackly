(function() {

  class OrganizationMetaEditor {
    constructor() {
      this._createMetaDataArray();
    }

    _createMetaDataArray() {
      this.metaArray = _.chain(this.meta || {})
        .keys()
        .reduce((array, metaKey) => [...array, { key: metaKey, value: this.meta[metaKey] }], [])
        .value();
    }

    _getMetaDataObject() {
      return _.chain(this.metaArray || [])
        .reduce((map, meta) => {
          map[(meta.key || '').toLowerCase()] = (meta.value || '').toLowerCase();

          return map;
        }, {})
        .value();
    }

    removeRow(index) {
      this.metaArray = [...this.metaArray.splice(1, index)];

      this.onMetaChange();
    }

    onMetaChange() {
      this.onChange({ meta: this._getMetaDataObject() });
    }

    addRow() {
      this.metaArray = [...this.metaArray, { key: '', value: '' }];
    }
  }

  angular.module('tapinApp.components')
    .component('organizationMetaEditor', {
      bindings: {
        meta: '<',
        onChange: '&'
      },
      controller: OrganizationMetaEditor,
      templateUrl: '/app/components/organization-meta-editor/organization-meta-editor.template.html',
      controllerAs: 'organizationMetaEditor'
    });

})();
