define(
	[
		'jquery',
		'underscore',
		'backbone',
		'views/shared/tablecaption/Master'
	],
	function(
		$,
		_,
		Backbone,
		TableCaptionView
	) {
		// Appends an optional selectorView to the table caption view
		return TableCaptionView.extend({
			render: function() {
				TableCaptionView.prototype.render.apply(this, arguments);
				if (this.options.selectorView) {
					this.options.selectorView.render().$el.appendTo(this.$('.table-caption-inner'));
				}
				return this;
			}
		});
	}
);