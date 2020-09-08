define(
	[
		'jquery',
		'underscore',
		'backbone',
		'views/shared/controls/SyntheticRadioControl'
	],
	function(
		$,
		_,
		Backbone,
		SyntheticRadioControl
	) {
		return SyntheticRadioControl.extend({
			buttonClicked: function(value) {
				this.model.trigger(this.options.changeEvent, value);
			}
		});
	}
);