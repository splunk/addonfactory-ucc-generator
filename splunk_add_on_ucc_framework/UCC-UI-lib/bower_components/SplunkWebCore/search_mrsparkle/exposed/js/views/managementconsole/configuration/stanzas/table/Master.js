define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'models/managementconsole/DmcBase',
		'views/Base',
		'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl',
		'views/shared/TableHead',
		'views/managementconsole/configuration/stanzas/table/TableCaption',
		'views/managementconsole/shared/ExpandAllToggle',
		'views/shared/delegates/TableRowToggle',
		'views/managementconsole/configuration/stanzas/table/TableRow',
		'views/managementconsole/configuration/stanzas/table/MoreInfo',
		'views/managementconsole/configuration/group/CreateDialog',
		'views/managementconsole/configuration/stanzas/table/AdditionalUpdatingSyntheticSelectControl',
		'contrib/text!./Master.html'
	],
	function(
		$,
		_,
		Backbone,
		module,
		DmcBaseModel,
		BaseView,
		SyntheticSelectControlView,
        TextControl,
		TableHeadView,
		TableCaptionView,
		ExpandAllToggle,
		TableRowToggleView,
		TableRowView,
		MoreInfoView,
		CreateDialog,
		AdditionalUpdatingSyntheticSelectControl,
		Template
	) {
		var STRINGS = {
				NEW_STANZA: _('New Stanza').t(),
				NO_STANZAS_FOUND: _('No stanzas found.').t(),
				THIS_NODE_ONLY: _('This instance only').t(),
				ALL_SOURCES: _('All').t(),
                EXPORT_FILE: _('Export All Stanzas').t()
			},
			BUNDLE_TYPE_TO_HEADER = {
				custom: _('Server Classes').t(),
				app: _('Apps').t()
			};

		return BaseView.extend({
			moduleId: module.id,

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				var keyColumns = [
						{ label: _('Stanza name').t(), sortKey: 'name', className: 'col-stanza-name' },
						{ label: _('Actions').t(), className: 'col-actions' }
					];

				// This magical line of code makes the expanding details view work
				this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: false });

				if (this.options.showBundle) {
					keyColumns.push(
						{ label: _('Source').t(), className: 'col-bundle' }
					);
				}

				keyColumns.push(
					{ label: DmcBaseModel.PENDING_COLUMN_NAME, className: 'col-pending' }
				);

				this.children.head = new TableHeadView({
					model: this.collection.stanzas.fetchData,
					columns: [
						{ label: 'i', className: 'col-info', html: '<i class="icon-info"></i>' }
					].concat(keyColumns)
				});
				
                this.children.expandStanzasToggle = new ExpandAllToggle({
					model: this.model.state,
					modelAttribute: 'isStanzaExpanded',
                    label: _('Stanzas').t(),
					tableRowToggle: this.children.tableRowToggle,
					getExpandRows: function() {
						return this.$('.table-listing tbody tr.expand');
					}.bind(this)
                });

				this.children.caption = new TableCaptionView({
					model: {
						state: this.collection.stanzas.fetchData
					},
					countLabel: _('Stanzas').t(),
					collection: this.collection.stanzas,
					noFilterButtons: true,
					noFilter: true,
					noDock: true,
					selectorView: this.options.showBundle ? 
						new AdditionalUpdatingSyntheticSelectControl({
							className: 'control btn-group pull-left',
		                    label: _('Source').t() + ': ',
		                    model: this.collection.stanzas.fetchData,
		                    modelAttribute: 'bundle',
		                    toggleClassName: 'btn-pill',
		                    menuWidth: 'wide',
		                    items: this._getBundleItems(),
		                    popdownOptions: {
		                        detachDialog: true
		                    },
		                    alwaysUpdateAttributes: {
		                    	offset: 0
		                    }
		                }) :
		                null
				});

                this.children.filterTextControl = new TextControl({
                    model: this.collection.stanzas.fetchData,
                    modelAttribute: 'rawSearch',
                    className: 'pull-left control stanza-filter-text-control',
                    inputClassName: 'search-query',
                    canClear: true,
                    placeholder: _('filter').t()
                });

				this.children.selectPageCount = new SyntheticSelectControlView({
					menuWidth: "narrow",
					className: "btn-group pull-left",
					items: [
						{value: 10, label: _('10 per page').t()},
						{value: 25, label: _('25 per page').t()},
						{value: 50, label: _('50 per page').t()},
						{value: 100, label: _('100 per page').t()}
					],
					model: this.collection.stanzas.fetchData,
					modelAttribute: 'count',
					toggleClassName: 'btn-pill'
				});

				this.children.rows = this.rowsFromCollection();

				this.listenTo(this.collection.stanzas, 'sync', this.onStanzaSync);
                this.listenTo(this.collection.stanzas, 'change', this.renderRows);
				this.listenTo(this.model.instance, 'sync', this.updateBundleSelect);
				this.listenTo(this.collection.stanzas.fetchData, 'change:bundle', this.updateCanCreate);
				this.listenTo(this.collection.stanzas.fetchData, 'change:type', this.updateTitle);
            },

			events: {
				'click .new-stanza-button': function(e) {
					var dialog = new CreateDialog({
						model: {
							configuration: this.model.configuration,
							stanzasMeta: this.model.stanzasMeta,
							confSpec: this.model.confSpec,
							confStanzaSpec: this.model.confStanzaSpec,
							confDefaultSpec: this.model.confDefaultSpec
						},
                        collection: {
                            stanzas: this.collection.stanzas
                        },
						onHiddenRemove: true,
						warningMessage: this.options.showBundle ?
							_('This stanza will be created on this instance only.').t() :
							null
					});

					$('body').append(dialog.render().el);
					dialog.show();
				},
                'click .export-all-link': function(e) {
                    if ($(e.target).hasClass('disabled')) {
                        e.preventDefault();
                    }
                }
			},

			onStanzaSync: function() {
				this.renderRows();
				this.updateExportAllLink();
				this.updateCreateButton();
			},

			render: function() {
				if (!this.el.innerHTML) {
					this.$el.append(this.compiledTemplate({
						strings: STRINGS
					}));
					this.children.expandStanzasToggle.render().appendTo(this.$('.expand-collapse-placeholder'));
					this.children.selectPageCount.render().appendTo(this.$('.select-page-count-placeholder'));

					this.children.caption.render().$el.appendTo(this.$('.table-control-container'));
                    this.children.filterTextControl.render().$el.appendTo(this.$('.table-caption-inner'));
					this.children.head.render().$el.prependTo(this.$('.table-chrome'));
					this.updateTitle();
                    this.updateExportAllLink();
                    this.updateCreateButton();
				}
				this._renderRows();
				return this;
			},

			updateCreateButton: function() {
				if (this._canCreate()) {
					this.$('.new-stanza-button').show();
				} else {
					this.$('.new-stanza-button').hide();
				}
			},

			renderRows: function() {
				_.each(_.values(this.children.rows), function(row) {
					row.remove();
				}, this);
				this.children.rows = this.rowsFromCollection();
				this._renderRows();
			},

			rowsFromCollection: function() {
				return _.flatten(
					this.collection.stanzas.map(function(stanza, i) {
						return [
							new TableRowView({
								model: {
									stanza: stanza,
									configuration: this.model.configuration,
									instance: this.model.instance,
									state: this.model.state,
									confSpec: this.model.confSpec,
									confStanzaSpec: this.model.confStanzaSpec,
									confDefaultSpec: this.model.confDefaultSpec,
                                    stanzasMeta: this.model.stanzasMeta
								},
								collection: {
									stanzas: this.collection.stanzas,
									pendingChanges: this.collection.pendingChanges
								},
								showBundle: this.options.showBundle,
								nodeOnlyLabel: STRINGS.THIS_NODE_ONLY,
								index: i
							}),
							new MoreInfoView({
								model: {
									stanza: stanza
								},
								showBundle: this.options.showBundle,
								index: i
							})
						];
					}, this)
				);
			},

			updateBundleSelect: function() {
				if (this.options.showBundle) {
					this.children.bundleSelect.setItems(this._getBundleItems());
				}
			},

			updateCanCreate: function() {
				var $createButton = this.$('.dmc-no-results .new-stanza-button');

				if (this._isNodeOnlySet()) {
					$createButton.show();
				} else {
					$createButton.hide();
				}
			},

			_getBundleItems: function() {
				var result = [[
						{
							label: STRINGS.ALL_SOURCES,
							value: '-'
						},
						{ 
							label: STRINGS.THIS_NODE_ONLY, 
							value: this.model.configuration.getBundleName() 
						}
					]],
					bundlesByType = this.model.instance.getRelatedBundlesByType();
				
				// Include builtin bundles in the first group
				result[0] = result[0].concat(
					this._formatBundles(bundlesByType.builtin)
				);

				_.each(['custom', 'app'], function(type) {
					var bundles = bundlesByType[type];

					if (bundles && bundles.length > 0) {
						result.push([
							{ label: BUNDLE_TYPE_TO_HEADER[type] },
							this._formatBundles(bundles)
						]);
					}
				}, this);

				return result;
			},

			_formatBundles: function(bundles) {
				return _.map(bundles, function(bundle) {
					return {
						label: bundle.displayName,
						value: bundle.name
					};
				});
			},

			_renderRows: function() {
				if (this.children.rows.length === 0) {
					this.$('.dmc-no-results').show();
				} else {
					this.$('.dmc-no-results').hide();
					
					_.each(_.values(this.children.rows), function(row) {
						row.render().$el.appendTo(this.$('.table-listing tbody'));
					}, this);

					this.updateTitle();
				}

				this.children.expandStanzasToggle.toggleExpansion();
			},

			_isNodeOnlySet: function() {
				return this.collection.stanzas.fetchData.get('bundle') ===
					this.model.configuration.getBundleName();
			},

            updateExportAllLink: function() {
                if (this.collection.stanzas.length > 0) {
                    this.$('.export-all-link').removeClass('disabled');
                    this.$('.export-all-link').attr('href', this.collection.stanzas.getExportAllUrl());
                } else {
                    this.$('.export-all-link').addClass('disabled');
                    this.$('.export-all-link').attr('href', '#');
                }
            },

            updateTitle: function() {
				this.$('.section-title').text(this.collection.stanzas.fetchData.get('type') || '');
			},

			_canCreate: function() {
				if (_.isObject(this.collection.createStanzas)) {
					return this.collection.createStanzas.canCreate();
				} else {
					return this.collection.stanzas.canCreate();
				}
			},

			template: Template
		});
	}
);