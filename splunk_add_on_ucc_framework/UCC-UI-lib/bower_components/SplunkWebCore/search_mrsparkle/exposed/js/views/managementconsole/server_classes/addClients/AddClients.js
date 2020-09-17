define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/deploymentserver/editServerclass/addClients/AddClients',
        'views/managementconsole/server_classes/addClients/SelectedClientsTab',
        'views/managementconsole/server_classes/addClients/UnselectedClientsTab',
        'views/managementconsole/server_classes/addClients/AllClientsTab',
		'./AddClients.pcss'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseAddClientsView,
        SelectedClientsTab,
        UnselectedClientsTab,
        AllClientsTab,
		css
	) {
		return BaseAddClientsView.extend({
			moduleId: module.id,

			initialize: function() {
				BaseAddClientsView.prototype.initialize.apply(this, arguments);

				this.listenTo(this.children.previewButton, 'previewClicked', function() {
					this.model.whitelist.validate();
				}, this);
			},

			handleSaveClicked: function() {

				//validate
                if (this.model.whitelist.validate()) {
                    return;
                }

				// the only way in the UI to run the whitelist/blacklist validations is to call the
				// preview endpoint. Below we listen to the sync or error on the collection to determine
				// if the validation succeded (in which case we save and navigate back) else we stay on the
				// same page
				$('.btn-primary').attr('disabled', true);
				this.listenToOnce(this.collection.allClients, 'sync error', function(collection, response) {
					this.stopListening(this.collection.allClients, 'sync error');
					if (response.status && response.status != 200) {
						$('.btn-primary').attr('disabled', false);
					} else {
						this.model.serverClass.save(null, {
							success: this.goBack.bind(this)
						});
					}

				}, this);

				this.performWhitelistBlacklistFiltering();

				this.model.serverClass.entry.content.set({
					whitelist: this.model.whitelist.get('filter'),
					blacklist: this.model.blacklist.get('filter'),
					machineTypesFilter: this.collection.selectedMachineTypes.pluck('name').join(',')
				});
			},

			extractWhitelistAndBlacklist: function() {
				var content = this.model.serverClass.entry.content.toJSON();
				this.model.whitelist.set('filter', content.whitelist);
				this.model.blacklist.set('filter', content.blacklist);
				this.extractMachineTypes();
			},

			getDocUrl: function() {
				return ''; // No doc URL
			},

			getSectionTitle: function() {
				return _('Edit Server Class').t();
			},

			getNameLabel: function() {
				return _('Name').t();
			},

			getBackButtonUrl: function() {
				return this.getReturnTo();
			},
            _getSelectedClientsTab: function() {
                return SelectedClientsTab;
            },
            _getUnselectedClientsTab: function() {
                return UnselectedClientsTab;
            },
            _getAllClientsTab: function() {
                return AllClientsTab;
            }
		});
	}
);
