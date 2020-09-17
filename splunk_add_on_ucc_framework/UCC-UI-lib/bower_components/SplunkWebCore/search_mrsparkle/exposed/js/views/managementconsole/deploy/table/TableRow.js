define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'contrib/text!./TableRow.html'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		Template
	) {
		return BaseView.extend({
			moduleId: module.id,
			tagName: 'tr',
			className: 'expand',

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				if (_.isUndefined(this.options.columnBlacklist)) {
					this.options.columnBlacklist = [];
				}
				
				this.$el.addClass(this.options.index % 2 ? 'even' : 'odd');
			},

			render: function() {
				this.el.innerHTML = this.compiledTemplate({
					isPending: this.model.change.isPending(),
					editTime: this.model.change.getEditTime(),
					editUser: this.model.change.entry.content.get('user'),
					entityType: this.model.change.getEntityTypeLabel(),
					entityName: this.model.change.getEntityName(),
					operation: this.model.change.getOperationTypeLabel(),
					deployedOn: this.model.change.getDeployedOnTime(),
					deployedBy: this.model.change.entry.content.get('deployedBy'),
					hideColumns: this.options.hideColumns,
					hideMoreInfo: this.options.hideMoreInfo,
					columnBlacklist: this.options.columnBlacklist
				});
				return this;
			},

			template: Template
		});
	}
);