define(
	[
		'jquery',
		'underscore',
		'backbone',
		'collections/managementconsole/Stanzas',
		'fixtures/managementconsole/stanzas_indexers_indexes',
		'fixtures/managementconsole/stanzas_search_heads_data_ui_views'
	],
	function(
		$,
		_,
		Backbone,
		StanzasCollection,
		StanzasIndexersIndexesFixture,
		StanzasSearchHeadsDataUiViewsFixture
	) {
		return StanzasCollection.extend({
			fetch: function(options) {
				var mergedOptions = $.extend(true, {}, {data: this.fetchData.toJSON()}, options),
					fixture = {};

				if (mergedOptions.data.bundle === '__indexers' && 
					mergedOptions.data.type === 'indexes') {

					fixture = StanzasIndexersIndexesFixture;
				} else if (mergedOptions.data.bundle === '__search_heads' &&
					mergedOptions.data.type === 'data/ui/views') {

					fixture = StanzasSearchHeadsDataUiViewsFixture;
				}

				this.setFromSplunkD(fixture);
				this.trigger('sync');

				return $.Deferred().resolve().promise();
			}
		});
	}
);