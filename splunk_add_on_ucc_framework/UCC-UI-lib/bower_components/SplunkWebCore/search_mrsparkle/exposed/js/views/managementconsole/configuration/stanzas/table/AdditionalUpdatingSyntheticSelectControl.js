define(
	[
		'jquery',
		'underscore',
		'backbone',
		'views/shared/controls/SyntheticSelectControl'
	],
	function(
		$,
		_,
		Backbone,
		SyntheticSelectControl
	) {
		// In a minor way, this extends the SyntheticSelectControl
		// to be able always update some attributes to a certain value
		// on change at the same time as the change to the Control's underlying modelAttribute
		return SyntheticSelectControl.extend({
			getUpdatedModelAttributes: function() {
				var alwaysUpdateAttributes = this.options.alwaysUpdateAttributes || {};

				return $.extend(
					true, 
					alwaysUpdateAttributes,
					SyntheticSelectControl.prototype.getUpdatedModelAttributes.apply(this, arguments)
				);
			}
		});
	}
);