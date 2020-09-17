define(
	[
		'jquery',
		'underscore',
		'backbone',
		'collections/managementconsole/DmcsBase',
		'models/managementconsole/Stanza',
		'mixins/managementconsole/StanzaMixin',
		'helpers/managementconsole/Filters',
		'util/splunkd_utils',
        'util/url'
	],
	function(
		$,
		_,
		Backbone,
		DmcsBaseCollection,
		StanzaModel,
		StanzaMixin,
		FiltersHelper,
		splunkDUtils,
        urlUtils
	) {
		var StanzasCollection = DmcsBaseCollection.extend({
			url: '/services/dmc/stanzas',
            rootExportUrl: '/services/dmc/stanzas-export',
			model: StanzaModel,

            getExportAllUrl: function() {
                var bundle = this.fetchData.get('bundle'),
                    instance = this.fetchData.get('instance'),
                    type = this.fetchData.get('type'),
                    url = splunkDUtils.fullpath(this.getResolvedUrl(this.rootExportUrl, bundle, type));

                if (bundle === '-') {
                    url += '?' + urlUtils.encode({
                        instance: instance
                    });
                }

                return url;
            },

			getMergedOptions: function(options) {
				// Get the options passed merged with the fetchData model
				options = DmcsBaseCollection.prototype.getMergedOptions.call(this, options);

				// Set the url, which must be normalize for splunkd
				// and also depends on the bundle, type, app, and owner
				options.url = splunkDUtils.fullpath(
					this.getResolvedUrl(this.url, options.data.bundle, options.data.type),
					this.getAppOwner(options)
				);


				this._handleBundleAndTypeFetchOption(options);
                this._handleQueryFetchOption(options);

				return options;
			},

            _handleBundleAndTypeFetchOption: function(options) {
                // We only want to relate to the instance if the bundle is a wildcard
                if (options.data.bundle !== '-') {
                    delete options.data.instance;
                }

                // bundle and type should not be passed because it is already included in the url path
                delete options.data.bundle;
                delete options.data.type;

            },

            _handleQueryFetchOption: function(options) {
                delete options.data.search; // property not used

                if (options.data.rawSearch) {
                    options.data.query = JSON.stringify({
						name: FiltersHelper.modifyRegExp(options.data.rawSearch)
					});
                    delete options.data.rawSearch;
                }
            }
		});

		_.extend(StanzasCollection.prototype, StanzaMixin);
		return StanzasCollection;
	}
);