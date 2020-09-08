define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'views/managementconsole/configuration/stanzas/table/Master',
		'contrib/text!./Master.html'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		TableView,
		Template
	) {
		var STRINGS = {
			CONFIGURE: _('Configure').t(),
			SELECT_CONFIGURATION_TYPE: _('Select a configuration type').t()
		};

		return BaseView.extend({
			moduleId: module.id,
			tagName: 'div',
			className: 'dmc-stanzas',
			
			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				this.children.table = new TableView({
					model: {
						configuration: this.model.configuration,
						stanzasMeta: this.model.stanzasMeta,
						instance: this.model.instance,
						state: this.model.state,
						confSpec: this.model.confSpec,
						confStanzaSpec: this.model.confStanzaSpec,
						confDefaultSpec: this.model.confDefaultSpec
					},
					collection: {
						stanzas: this.collection.stanzas,
						createStanzas: this.collection.createStanzas,
						pendingChanges: this.collection.pendingChanges
					},
					showBundle: this.model.configuration.canShowRelated()
				});

				this.listenTo(this.collection.stanzas, 'sync reset', this.debouncedRender);
			},

			render: function() {
				var selectedType = this.collection.stanzas.fetchData.get('type'),
					urlOpts = {};

				if (selectedType) {
					urlOpts.type = selectedType;
				}

				this.el.innerHTML = this.compiledTemplate({
					selectedType: selectedType,
					strings: STRINGS
				});

				if (selectedType) {
					this.children.table.render().$el.appendTo(this.$el);
				}
				
				return this;
			},

			template: Template
		});
	}
);