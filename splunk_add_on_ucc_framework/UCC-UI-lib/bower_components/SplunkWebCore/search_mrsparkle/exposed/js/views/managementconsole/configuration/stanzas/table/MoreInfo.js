define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'contrib/text!./MoreInfo.html'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		Template
	) {
		var STRINGS = {
			NO_ATTRIBUTES: _('No attributes are set').t()
		};

		return BaseView.extend({
			moduleId: module.id,
			tagName: 'tr',
			className: 'more-info',

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);
				this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
			},

			render: function() {
				this.$el.html(this.compiledTemplate({
					attrs: this.model.stanza.getMergedFinal(),
					colspan: this.options.showBundle ? 4 : 3,
					strings: STRINGS
				}));
				return this;
			},

			template: Template
		});
	}
);