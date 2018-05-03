(function() {

	class UpsellEditorController {
		/*@ngInject*/
		constructor($state, UpsellConstants, upsell, $http, Toaster, Barcode) {
			this.$state = $state;
			this.COMMON_CONST = UpsellConstants;
			this.barcodeTypes = this.COMMON_CONST.BARCODE_TYPES;
			this._$http = $http;
			this._Toaster = Toaster;
			this.update = upsell ? true : false;
			this.upsell = upsell ? upsell : {barcode: {}};
			this.upsell.useCode = this.upsell.barcode ? true : false
			this.formSubmitted = false;
			this._Barcode = Barcode;
			this._uploader;
			this.barcodeIsValid = false;
			if(this.upsell.useCode) this.generateBarcode()

		}

		save(valid) {
			//save or update upsell information
			this.formSubmitted = true;
			this.barcodeError = undefined;
			if(valid) {
				let payload = _.assign({}, this.upsell);
				payload.barcode = this.upsell.barcode && this.upsell.useCode ? {
					type: this.upsell.barcode.type,
					showText: true
				} : null;
				delete payload.useCode;

				this._Barcode.validate({type: _.get(payload.barcode, "type"), code: payload.code})
				.then(result => {
					if(result.pass === false) return this.barcodeIsInvalid(result)
					this.barcodeIsValid = true;
					if(this.update) {
						//for update condition
						const id = payload._id;
						delete payload._id;

						this._$http.put('/api/v2/upsells/' + id, payload)
						.then(res => {
							this._Toaster.success("Upsell updated")
						}, err => {
							this._Toaster.danger("Error in updating upsell")
							console.log(err)
						})

					}else {
						//for save condition
						this._$http.post('/api/v2/upsells', payload)
						.then(res => {
							this._Toaster.success("Upsell added")
							this.$state.go('upsells');
						}, err => {
							this._Toaster.danger("Error in updating upsell")
							console.log(err)
						})
					}
				})

			}
		}

		barcodeIsInvalid(result){
			console.log(result)
			this.barcodeIsValid = false;
			this.barcodeError = result.error;
		}

		generateBarcode(){
			this._Barcode.validate({type: _.get(this.upsell.barcode, "type"), code: this.upsell.code})
			.then(result => {
				if(result.pass === false) this.barcodeIsInvalid(result)
				else if(result.pass === true) this.barcodeIsValid = true
				else this.barcodeIsValid = false;
			})
		}

		useCodeToggle(){
			if(!this.upsell.useCode) delete this.upsell.barcode
		}

		_onImageUpload(item, response, status, headers) {
			this.upsell.image_url = response.file;
		}

		onRemoveImage() {
			this.upsell.image_url = null;
		}


		onImage(uploader) {
			this._uploader = uploader;
			this._uploader.onSuccessItem = this._onImageUpload.bind(this);
			this.upsell.image_url = 'uploading'
			if(this._uploader !== undefined && this._uploader.queue.length > 0) {
				this._uploader.uploadItem(0);
			}
		}

	}

    angular.module('tapinApp.routes')
    .controller('UpsellEditorController', UpsellEditorController);

})();
