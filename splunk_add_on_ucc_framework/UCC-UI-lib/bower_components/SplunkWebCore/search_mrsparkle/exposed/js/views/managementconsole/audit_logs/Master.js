define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'views/managementconsole/audit_logs/table/Master',
		'views/managementconsole/audit_logs/table/TableRow',
		'contrib/text!./Master.html',
		'views/managementconsole/shared.pcss',
		'views/managementconsole/deploy/Master.pcss'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		TableView,
		TableRowView,
		Template,
        cssShared,
        css
	) {
		var STRINGS = {
			TITLE: _('Install Log').t(),
			DESCRIPTION: _('All installed and uninstalled apps appear below.').t()
		};

		return BaseView.extend({
			moduleId: module.id,

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				this.children.table = new TableView({
					model: {
						timeRange: this.model.timeRange,
						appLocal: this.model.appLocal,
						user: this.model.user,
						application: this.model.application
					},
					collection: { 
						changes: this.collection.auditLogs,
						times: this.collection.times
					},
					TableRowView: TableRowView,
					hideMoreInfo: true,
					hideFilters: true,
					fullTimeRange: true
				});
			},

			render: function() {
				this.el.innerHTML = this.compiledTemplate({
					strings: STRINGS
				});
				this.children.table.render().appendTo(this.$('.audit-logs-table'));
				return this;
			},

			template: Template
		});
	}
);