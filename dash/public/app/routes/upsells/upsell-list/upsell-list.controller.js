(function() {

	class UpsellListController {
		/*@ngInject*/
		constructor($state, upsells, $http, Toaster, channelTree, channels, UserStore, featureConstants) {
			this.$state = $state;
			this._$http = $http;
			this.upsellService = {};
			this.upsells = upsells;
			this.deleteUpsellId = null;
			this._Toaster = Toaster;
			this.channelTree = channelTree;
			this._channels = channels;
			this.channelTreeAssignAs = 'neutral'
			this.assignUpsellId = undefined;
			this.activeUpsells= {}
			this.activations = {}
			this._UserStore = UserStore;
			this._UserStore.getUserRights()
			.then(rights => {
				this.userRights = rights;
			})
			this._featureConstants = featureConstants;

		}

		upsellEnabled(){
			var availableFeatures = _.get(this, 'userRights.availableFeatures') || [];
			return availableFeatures.indexOf(this._featureConstants.UPSELL_MODULE) > -1
		}
		

		getSelectedUpsellChannels(upsellId, target){
			// target = 'negative' || 'positive' || 'neutral'
			var result = [];
			_.forEach(this._channels, channel => {
				var upsell = _.get(channel, 'upsells.' + target);
				if(upsell === upsellId) result.push(channel);
			})
			_.sortBy(result, () => Math.random())
			return result;
		}

		assignUpsells(upsellId){
			this.assignUpsellId = upsellId;
			this.activeUpsells[this.channelTreeAssignAs] = this.getSelectedUpsellChannels(upsellId, this.channelTreeAssignAs)
		}

		onUpsellSelectionChange(){
			this.activeUpsells[this.channelTreeAssignAs] = this.getSelectedUpsellChannels(this.assignUpsellId, this.channelTreeAssignAs)
			this.channelTree = _.assign([],this.channelTree)
			this.activations = {}
		}

		onActivationsChange(activations){
			this.activations[this.channelTreeAssignAs] = {active: _.map(activations.active, '_id'), notActive: _.map(activations.notActive, '_id')}
		}

		activateUpsell(){
			var id = this.assignUpsellId;
			var payload = {target: this.channelTreeAssignAs, activations: this.activations[this.channelTreeAssignAs]}
			this._$http.post('/api/v2/upsells/' + id + '/activate', payload)
			.then(res => {
				this._Toaster.success("Upsell activated.")
				this.$state.reload();
			}, err => {

			})
		}


		deleteUpsellConfirm(id) {
			//show upsell delete confirmation and store id to delete
			this.deleteUpsellId = id;
		}

		deleteUpsell(del, e) {
			//delete upsell if ok button clicked in confirmation and delete id exists
			if(this.deleteUpsellId && del) {
				this._$http.delete("/api/v2/upsells/" + this.deleteUpsellId)
				.then(res => {
					this._Toaster.neutral("Upsell deleted.")
					this.$state.reload();
				}, err => {
					this._Toaster.danger("Error while deleting upsell");
					console.log(err)
				})
			}
			e.preventDefault();
		}
	}

    angular.module('tapinApp.routes')
    .controller('UpsellListController', UpsellListController);

})();
