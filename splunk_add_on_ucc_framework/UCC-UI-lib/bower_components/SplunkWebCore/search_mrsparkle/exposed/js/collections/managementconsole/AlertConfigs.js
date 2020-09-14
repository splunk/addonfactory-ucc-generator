define([
	'jquery',
	'underscore',
	'models/managementconsole/AlertConfig',
	'collections/SplunkDsBase'
], function(
	$,
	_,
	AlertConfigModel,
	BaseCollection
){
	return BaseCollection.extend({
		model: AlertConfigModel,
		url: 'configs/conf-dmc_alerts',
		fetch: function(options) {
			options = _.defaults(options || {}, { count: 25 });
			options.data = _.defaults(options.data || {}, {
				app: 'splunk_monitoring_console',
				owner: '-'
			});

			return BaseCollection.prototype.fetch.call(this, options);
		}
	});
});