define([
	'jquery',
	'underscore',
	'backbone',
	'models/SplunkDBase'
], function(
	$,
	_,
	backbone,
	SplunkDBaseModel
) {
	return SplunkDBaseModel.extend({
		url: 'configs/conf-dmc_alerts'
	});
});