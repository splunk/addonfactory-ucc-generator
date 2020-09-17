define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'views/managementconsole/shared/PendingChangesDialog',
		'views/managementconsole/configuration/group/CreateDialog',
		'views/managementconsole/shared/DeleteConfirmationDialog',
		'views/managementconsole/configuration/stanzas/table/RevertDialog',
		'contrib/text!./TableRow.html',
		'bootstrap.tooltip'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		PendingChangesDialog,
		CreateDialog,
		DeleteConfirmationDialog,
		RevertDialog,
		Template
		// bootstrap.tooltip
	) {
		var STRINGS = {
			EDIT: _('Edit').t(),
			EXPORT: _('Export').t(),
			DELETE: _('Delete').t(),
			REVERT: _('Revert').t(),
			GROUPS_TOOLTIP_HEADER: _('Installed on').t()
		};

		return BaseView.extend({
			moduleId: module.id,
			tagName: 'tr',
			className: 'expand',

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				this.$el.addClass(this.options.index % 2 ? 'even' : 'odd');

				this.listenTo(this.model.stanza, 'change', this.debouncedRender);
				this.listenTo(this.model.stanza.links, 'change', this.debouncedRender);
			},

			events: {
				'click .edit-stanza': function(e) {
					this._popModal(e, CreateDialog);
				},

				'click .delete-stanza': function(e) {
					e.preventDefault();

					var confirmDialog = new DeleteConfirmationDialog({
						id: "modal_delete",
						flashModel: this.model.stanza,
						entitySingular: _('Stanza').t(),
						dialogButtonLabel: _('Delete').t(),
						targetEntity: this.model.stanza,
						onActionSuccess: function() {
                            return $.when(this.collection.stanzas.fetch(), this.model.configuration.fetch());
						}.bind(this)
					});
					$('body').append(confirmDialog.render().el);
					confirmDialog.show();
				},

				'click .revert-stanza': function(e) {
					this._popModal(e, RevertDialog);
				},

				'click .pending-link': function(e) {
					e.preventDefault();
					var bundleType = this.model.configuration.getBundleType();

					this.collection.pendingChanges.fetchData.set({
						type: ['stanza'],
						name: this.model.stanza.entry.get('name'),
						bundleType: bundleType === 'node' ? this.model.instance.getBundleType(this.model.stanza.entry.content.get('bundle')) : bundleType,
						bundleId: this.model.stanza.getBundleId(),
						configurationType: this.model.stanza.entry.content.get('type')
					});

					// This line is necessary to force a fetch
					// in the case that none of the values in `fetchData`
					// have changed.
					this.collection.pendingChanges.safeFetch();

					var dialog = new PendingChangesDialog({
						onHiddenRemove: true,
						mode: 'stanza-context',
						collection: {
							pendingChanges: this.collection.pendingChanges
						}
					});

					$('body').append(dialog.render().el);
					dialog.show();
				}
			},

			render: function() {
				var bundle = this.model.stanza.getBundleDisplayName(),
					bundleGroups = this.model.instance.getBundleGroups(
						this.model.stanza.entry.content.get('bundle')
					);

				if (this._isNodeOnlyStanza() &&
					this.options.nodeOnlyLabel) {

					bundle = this.options.nodeOnlyLabel;
				}

				this.el.innerHTML = this.compiledTemplate({
					name: this.model.stanza.entry.get('name'),
					bundle: this.options.showBundle && bundle,
					bundleGroups: this.options.showBundle && 
						bundleGroups &&
						bundleGroups.length &&
						bundleGroups,
					isNodeOnly: this._isNodeOnlyStanza(),
					isPending: this.model.stanza.isPending(),
					pendingText: this.model.stanza.getPendingText(),
					canRevert: this.model.stanza.canRevert(),
					canDelete: this.model.stanza.canDelete(),
					canEdit: this.model.stanza.canEdit(),
					exportUrl: this.model.stanza.getExportUrl(),
					isExpanded: this.model.state.get('isStanzaExpanded'),
					strings: STRINGS,
					stanza: this.model.stanza
				});

				this.$('.bundle-groups-icon').tooltip({
					title: [ 
						// Put in a header
						STRINGS.GROUPS_TOOLTIP_HEADER + ':'
					].concat(bundleGroups).join('\n')
				});

				return this;
			},

			_isNodeOnlyStanza: function() {
				return this.model.stanza.entry.content.get('bundle') ===
					this.model.configuration.getBundleName();
			},

			_popModal: function(e, modalCls) {
				e.preventDefault();

				var dialog = new modalCls({
					model: {
						configuration: this.model.configuration,
						stanza: this.model.stanza,
						confSpec: this.model.confSpec,
						confStanzaSpec: this.model.confStanzaSpec,
						confDefaultSpec: this.model.confDefaultSpec,
                        stanzasMeta: this.model.stanzasMeta
					},
					collection: {
						stanzas: this.collection.stanzas
					},
					onHiddenRemove: true
				});

				$('body').append(dialog.render().el);
				dialog.show();
			},

			template: Template
		});
	}
);