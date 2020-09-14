define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'models/classicurl',
		'views/Base',
		'views/managementconsole/deploy/DeployConfirmationDialog',
        'views/managementconsole/deploy/CancelPendingChangesConfirmationDialog',
		'views/managementconsole/deploy/table/Master',
		'util/splunkd_utils',
		'helpers/managementconsole/url',
		'contrib/text!./Master.html',
		'views/managementconsole/shared.pcss',
        './Master.pcss'
	],
	function(
		$,
		_,
		Backbone,
		module,
		classicurlModel,
		BaseView,
        DeployConfirmationDialog,
        CancelPendingChangesConfirmationDialog,
		TableView,
		splunkdUtils,
		urlHelper,
		Template,
        cssShared,
        css
	) {
		var STRINGS = {
			TITLE: _('Deploy Changes').t(),
			DESCRIPTION: _('All pending changes to Server Classes, Apps, and Forwarders can be deployed by pressing Deploy Changes button.  A detailed list of recently deployed changes is under the Recently Deployed Changes tab.').t(),
			DEPLOY_PENDING_CHANGES: _('Deploy Pending Changes').t(),
            CANCEL_PENDING_CHANGES: _('Cancel Pending Changes').t(),
			PENDING_CHANGES: _('Pending Changes').t(),
			DEPLOYED_CHANGES: _('Recently Deployed Changes').t()
		};

		return BaseView.extend({
			moduleId: module.id,

			initialize: function() {
				BaseView.prototype.initialize.call(this, arguments);

				this.children.pendingTable = new TableView({
					model: {
						state: this.model.state,
						deployTask: this.model.deployTask,
                        deployStatus: this.model.deployStatus
					},
					collection: { 
						changes: this.collection.pendingChanges 
					}
				});

				this.children.deployedTable = new TableView({
					model: {
						state: this.model.state
					},
					collection: {
						changes: this.collection.deployedChanges
					}
				});

				this.listenTo(this.collection.pendingMeta, 'sync', this._updateDeployButton);
			},

			events: {
				'click .btn-deploy': '_confirmDeployPendingChanges',

                'click .btn-cancel-pending': '_confirmCancelPendingChanges',

				'click .pending-changes-tab a': function(e) {
					e.preventDefault();
					urlHelper.replaceState({tab: 'pending-changes'});
					this.$('.deployed-changes-tab').removeClass('active');
					this.$('.pending-changes-tab').addClass('active');
					this.$('.deployed-changes').hide();
					this.$('.pending-changes').show();
				},

				'click .deployed-changes-tab a': function(e) {
					e.preventDefault();
					urlHelper.replaceState({tab: 'deployed-changes'});
					this.$('.pending-changes-tab').removeClass('active');
					this.$('.deployed-changes-tab').addClass('active');
					this.$('.pending-changes').hide();
					this.$('.deployed-changes').show();
				}
			},

			render: function() {
				var tab = this.model.classicurl.get('tab');

				this.el.innerHTML = this.compiledTemplate({
					canDeploy: this.collection.pendingChanges.canDeploy(),
					strings: STRINGS
				});
				this.children.pendingTable.render().appendTo(this.$('.pending-changes'));
				this.children.deployedTable.render().appendTo(this.$('.deployed-changes'));

				if (this.$('.' + tab + '-tab').length === 0) {
					this.$('.pending-changes-tab').addClass('active');
					this.$('.pending-changes').show();
				} else {
					this.$('.' + tab + '-tab').addClass('active');
					this.$('.' + tab).show();
				}

				this._updateDeployButton();

				return this;
			},

			_updateDeployButton: function() {
				if (this.collection.pendingMeta.paging.get('total') === 0) {
					this.$('.btn-deploy').prop('disabled', true);
                    this.$('.btn-cancel-pending').prop('disabled', true);
				} else {
					this.$('.btn-deploy').prop('disabled', false);
                    this.$('.btn-cancel-pending').prop('disabled', false);
				}

                // In case the last deploy task failed we do want to allow the user to redeploy the changes
                if (this.model.deployTask.entry.content.get('state') && this.model.deployTask.entry.content.get('state') === 'failed') {
                    this.$('.btn-deploy').prop('disabled', false);
                }
			},

            _confirmCancelPendingChanges: function(e) {
                e.preventDefault();
                var dialog = new CancelPendingChangesConfirmationDialog({
                    headerTitle: _('Do you want to cancel all pending changes?').t(),
                    buttonTitle: STRINGS.CANCEL_PENDING_CHANGES,
                    onHiddenRemove: true,
                    model: {
                        deployTask: this.model.deployTask
                    },
                    collection: {
                        pendingMeta: this.collection.pendingMeta
                    }
                });

                $('body').append(dialog.render().el);
                dialog.show();
            },

			_confirmDeployPendingChanges: function(e) {
				e.preventDefault();
				var dialog = new DeployConfirmationDialog({
					headerTitle: _('Do you want to deploy all pending changes?').t(),
					buttonTitle: STRINGS.DEPLOY_PENDING_CHANGES,
					onHiddenRemove: true,
					model: {
						deployTask: this.model.deployTask
					},
					collection: {
						pendingMeta: this.collection.pendingMeta
					}
				});

				$('body').append(dialog.render().el);
				dialog.show();
			},

			template: Template
		});
	}
);
