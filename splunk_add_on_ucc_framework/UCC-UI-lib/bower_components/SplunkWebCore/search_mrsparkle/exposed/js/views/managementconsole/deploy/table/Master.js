define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'collections/managementconsole/Changes',
		'views/Base',
		'views/shared/TableHead',
		'views/shared/tablecaption/Master',
		'views/shared/controls/SyntheticSelectControl',
		'views/shared/controls/TextControl',
		'views/shared/delegates/TableRowToggle',
		'views/shared/timerangepicker/Master',
		'views/managementconsole/shared/ExpandAllToggle',
		'views/managementconsole/deploy/table/TableRow',
		'views/managementconsole/deploy/table/MoreInfo',
		'views/managementconsole/shared/TopologyProgressControl',
		'contrib/text!./Master.html',
		'./Master.pcss'
	],
	function(
		$,
		_,
		Backbone,
		module,
		ChangesCollection,
		BaseView,
		TableHeadView,
		TableCaptionView,
		SyntheticSelectControlView,
		TextControlView,
		TableRowToggleView,
		TimeRangePickerView,
		ExpandAllToggleView,
		TableRowView,
		MoreInfoView,
		TopologyProgressControl,
		Template,
		css
	) {
		var STRINGS = {
			NO_PENDING_CHANGES: _('No pending changes').t(),
			NO_DEPLOYED_CHANGES: _('No recently deployed changes').t()
		};

		return BaseView.extend({
			moduleId: module.id,

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				this.model = this.model || {};
				this.model.state = this.model.state || new Backbone.Model();	

				if (_.isUndefined(this.options.hideFilters)) {
					this.options.hideFilters = false;
				}
				if (_.isUndefined(this.options.hideColumns)) {
					this.options.hideColumns = false;
				}
				if (_.isUndefined(this.options.simplifiedMoreInfo)) {
					this.options.simplifiedMoreInfo = {
						hideBundle: false,
						hideConfType: false,
						hideVersion: false
					};
				}
				if (_.isUndefined(this.options.hideMoreInfo)) {
					this.options.hideMoreInfo = false;
				}
				if (_.isUndefined(this.options.TableRowView)) {
					this.options.TableRowView = TableRowView;
				}

				// This magical line of code makes the expanding details view work
				this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: false });

				var columns = [];

				if (!this.options.hideMoreInfo) {
					columns = columns.concat([
						{ label: 'i', className: 'col-info', html: '<i class="icon-info"></i>' }
					]);
				}

				if (!this.options.hideColumns) {
					columns = columns.concat(this.getEntityColumns());
				}

				columns = columns.concat([
					{ label: _('Operation').t(), className: 'col-operation' }
				]);

				if (this.collection.changes.isDeployedOnly()) {
					columns = columns.concat(this.getDeployColumns());
				}

				if (!this.collection.changes.canSort()) {
					columns = _.map(columns, function(column) {
						delete column.sortKey;
						return column;
					});
				}

				this.children.head = new TableHeadView({
					model: this.collection.changes.fetchData,
					columns: columns
				});

				this.children.caption = new TableCaptionView({
					model: {
						state: this.collection.changes.fetchData
					},
					countLabel: _('Changes').t(),
					collection: this.collection.changes,
					noFilterButtons: true,
					noFilter: true,
					noDock: true
				});

				if (!this.options.hideFilters) {
					this.children.selectChangeType = new SyntheticSelectControlView({
						label: _('Entity Type:').t(),
						menuWidth: 'narrow',
						className: 'btn-group pull-left',
						items: [
							{value: null, label: _('All').t()},
							{value: ['app'], label: _('App').t()},
							{value: ['group'], label: _('Server Class').t()},
							{value: ['stanza'], label: _('Stanza').t()}
						],
						model: this.collection.changes.fetchData,
						modelAttribute: 'type',
						toggleClassName: 'btn-pill'
					});

					this.children.inputChangeName = new TextControlView({
						label: _('Entity Name:').t(),
						model: this.collection.changes.fetchData,
						modelAttribute: 'nameRegex',
						placeholder: _('filter by Entity Name').t(),
						inputClassName: 'search-query',
						canClear: true
					});

					if (this.model.deployTask) {
						this.children.progressControl = new TopologyProgressControl({
							buttonHidden: false,
							model: {
								topologyTask: this.model.deployTask
							}
						});
						this.listenTo(this.model.deployTask.entry, 'change:name', this._setProgressControlTaskId);

                        // If a taskId exists set it on the progress control
                        if (this.model.deployStatus && this.model.deployStatus.entry.content.get('taskId')) {
                            this.children.progressControl.setTaskId(this.model.deployStatus.entry.content.get('taskId'));
                        }
					}
				}

				if (this.collection.changes.isDeployedOnly()) {
					if (!this.options.fullTimeRange) {
						this.children.timeRangePicker = new SyntheticSelectControlView({
							label: _('Time Range:').t(),
							menuWidth: 'narrow',
							className: 'btn-group pull-left',
							items: [
								{value: ChangesCollection.TIME_RANGE.lastHour, label: ChangesCollection.TIME_RANGE.lastHour.label},
								{value: ChangesCollection.TIME_RANGE.lastDay, label: ChangesCollection.TIME_RANGE.lastDay.label},
								{value: ChangesCollection.TIME_RANGE.lastWeek, label: ChangesCollection.TIME_RANGE.lastWeek.label}
							],
							model: this.collection.changes.fetchData,
							modelAttribute: 'timeRange',
							toggleClassName: 'btn-pill'
						});
					} else {
						this.children.timeRangePicker = new TimeRangePickerView({
							dialogOptions: {
								showPresetsRealTime: false,
								showCustomRealTime: false
							},
							className: [
								TimeRangePickerView.prototype.className,
								'pull-left dmc-timerangepicker-padding'
							].join(' '),
							model: {
								state: new Backbone.Model(),
								timeRange: this.model.timeRange,
								appLocal: this.model.appLocal,
								user: this.model.user,
								application: this.model.application
							},
							collection: this.collection.times
						});
						this.listenTo(this.model.timeRange, 'change:earliest change:latest', function() {
							this.collection.changes.fetchData.set({
								earliest_time: this.model.timeRange.get('earliest'),
								latest_time: this.model.timeRange.get('latest')
							});
						});
					}
				}

				this.children.selectPageCount = new SyntheticSelectControlView({
					menuWidth: 'narrow',
					className: 'btn-group pull-left',
					items: [
						{value: 10, label: _('10 per page').t()},
						{value: 25, label: _('25 per page').t()},
						{value: 50, label: _('50 per page').t()},
						{value: 100, label: _('100 per page').t()}
					],
					model: this.collection.changes.fetchData,
					modelAttribute: 'count',
					toggleClassName: 'btn-pill'
				});

				this.children.rows = this.rowsFromCollection();


				this.children.expandStanzasToggle = new ExpandAllToggleView({
					model: this.model.state,
					modelAttribute: this.collection.changes.isDeployedOnly() ? 'isDeployedExpanded' : 'isPendingExpanded',
					label: _('Changes').t(),
					tableRowToggle: this.children.tableRowToggle,
					getExpandRows: function() {
						return this.$('.table-listing tbody tr.expand');
					}.bind(this)
				});

				this.listenTo(this.collection.changes, 'sync', this.renderRows);
			},

			// Overridden by subclasses
			getEntityColumns: function() {
				return [
					{ label: _('Entity Name').t(), sortKey: 'key.name', className: 'col-entity-name' },
					{ label: _('Entity Type').t(), sortKey: 'type', className: 'col-entity-type' }
				];
			},

			// Overridden by subclasses
			getDeployColumns: function() {
				return [
					{ label: _('Deploy Time').t(), sortKey: 'deployedOn', className: 'col-deployed-on' },
					{ label: _('Deploy User').t(), sortKey: 'deployedBy', className: 'col-deployed-by' }
				];
			},

			_setProgressControlTaskId: function() {
				var taskId = this.model.deployTask.entry.get('name');
				if (taskId) {
					this.children.progressControl.setTaskId(taskId);
				}
			},

			render: function() {
				var $timeRangePicker;

				if (!this.el.innerHTML) {
					this.$el.append(this.compiledTemplate({
						strings: STRINGS,
						isPending: this.collection.changes.isPendingOnly()
					}));

					this.children.caption.render().$el.appendTo(this.$('.table-control-container'));
					if (!this.options.hideMoreInfo) {
						this.children.expandStanzasToggle.render().$el.appendTo(this.$('.checkbox-expand-placeholder'));
					}
					if (this.children.selectChangeType) {
						this.children.selectChangeType.render().insertBefore(this.$('.pagination'));
					}
					if (this.children.timeRangePicker) {
						$timeRangePicker = this.children.timeRangePicker.render().$el;
						$timeRangePicker.insertBefore(this.$('.pagination'));

						if (this.options.fullTimeRange) {
							$timeRangePicker.prepend($('<span class="deploy-time-label">' + _('Deploy Time:').t() + ' </span>'));
						}
					}
					if (this.children.inputChangeName) {
						this.children.inputChangeName.render().insertBefore(this.$('.pagination'));
					}
					if (this.children.progressControl) {
						this.children.progressControl.render().$el.appendTo(this.$('.deployment-progress'));
					}

					this.children.selectPageCount.render().appendTo(this.$('.select-page-count-placeholder'));
					this.children.head.render().$el.prependTo(this.$('.table-chrome'));
				}
				this._renderRows();
				return this;
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
					this.collection.changes.map(function(change, i) {
						var views = [
								new this.options.TableRowView({
									hideMoreInfo: this.options.hideMoreInfo,
									hideColumns: this.options.hideColumns,
									model: {
										change: change
									},
									collection: {
										changes: this.collection.changes
									},
									index: i
								})
							];

						if (!this.options.hideMoreInfo) {
							views.push(new MoreInfoView({
								hideColumns: this.options.hideColumns,
								simplifiedMoreInfo: this.options.simplifiedMoreInfo,
								model: {
									change: change
								},
								index: i
							}));
						}

						return views;
					}, this)
				);
			},

			_renderRows: function() {
				if (this.children.rows.length === 0) {
					this.$('.dmc-no-results').show();
				} else {
					this.$('.dmc-no-results').hide();
					
					_.each(_.values(this.children.rows), function(row) {
						row.render().$el.appendTo(this.$('.changes-table'));
					}, this);
				}

				this.children.expandStanzasToggle.toggleExpansion();
			},

			template: Template
		});
	}
);