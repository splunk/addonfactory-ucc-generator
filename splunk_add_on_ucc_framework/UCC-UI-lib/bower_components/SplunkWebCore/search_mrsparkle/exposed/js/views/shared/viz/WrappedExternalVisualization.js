define([
            'underscore',
            'module',
            './Base',
            'api/SplunkVisualizationBase',
            'util/time',
            'util/console',
            'splunk.util'
        ],
        function(
            _,
            module,
            Base,
            SplunkVisualizationBase,
            timeUtils,
            console,
            splunkUtils
        ) {

    var DEFAULT_DATA_PARAMS = {
        show_metadata: true,
        show_empty_fields: 'True',
        offset: 0,
        count: 1000,
        sortDirection: 'desc'
    };

    var DATA_PARAM_WHITELIST = [
        'output_mode',
        'count',
        'offset',
        'sortKey',
        'sortDirection',
        'search'
    ];

    var EMPTY_DATA_PAYLOAD = { fields: [], rows: [], columns: [], results: [] };

    return Base.extend({

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this._namespace = 'display.visualizations.custom.' + this.options.appName
                + '.' + this.options.vizName + '.';

            this.$el.width('100%').height('100%');
            this._wrappedViz = new this.options.vizConstructor(this.el, this.options.appName, this.options.vizName);

            this.listenTo(this._wrappedViz, 'invalidateFormatData', this.invalidate.bind(this, 'formatDataPass'));
            this.listenTo(this._wrappedViz, 'invalidateUpdateView', this.invalidate.bind(this, 'updateViewPass'));
            this.listenTo(this._wrappedViz, 'invalidateReflow', this.invalidate.bind(this, 'reflowPass'));
            this.listenTo(this._wrappedViz, 'updateDataParams', function(newParams) {
                this.model.searchDataParams.set(this._filterDataParams(newParams));
            });
            this.listenTo(this._wrappedViz, 'drilldown', this._drilldown);

            var initialConfig = this._filterConfigObject(this.model.config.toJSON());
            var initialParamsFromViz = this._tryWithAsyncCatch(function() {
                return this._filterDataParams(this._wrappedViz.getInitialDataParams(initialConfig));
            });
            this.model.searchDataParams.set(_.extend({}, DEFAULT_DATA_PARAMS, initialParamsFromViz));
            this._wrappedViz.setCurrentData(EMPTY_DATA_PAYLOAD);
            this._wrappedViz.setCurrentConfig(initialConfig);
        },

        onConfigChange: function(changedAttributes, previousAttributes) {
            changedAttributes = this._filterConfigObject(changedAttributes);
            if (_.isEmpty(changedAttributes)) {
                return;
            }
            this._wrappedViz.setCurrentConfig(this._filterConfigObject(this.model.config.toJSON()));
            this._tryWithAsyncCatch(function() {
                this._wrappedViz.onConfigChange(changedAttributes, this._filterConfigObject(previousAttributes));
            });
        },

        formatData: function(rawData) {
            if (!rawData || _.isEmpty(rawData)) {
                rawData = EMPTY_DATA_PAYLOAD;
            }
            var formattedData = this._tryWithAsyncCatch(function() {
                return this._wrappedViz.formatData(rawData, this._wrappedViz.getCurrentConfig());
            });
            this._wrappedViz.setCurrentData(formattedData);
            return formattedData;
        },

        setupView: function() {
            this._tryWithAsyncCatch(function() {
                this._wrappedViz.setupView();
            });
        },

        // For wrapped external visualizations only, if the formatData routine returns null,
        // skip the update view step.  This handles the case where an error is thrown in formatData.
        // See SPL-114332.
        _updateView: function() {
            if (this._formattedData === null) {
                return;
            }
            return Base.prototype._updateView.call(this);
        },

        updateView: function(data, config, async) {
            this._tryWithAsyncCatch(function() {
                this._wrappedViz.updateView(
                    this._wrappedViz.getCurrentData(),
                    this._wrappedViz.getCurrentConfig(),
                    async
                );
            });
        },

        reflow: function() {
            this._tryWithAsyncCatch(function() {
                this._wrappedViz.reflow();
            });
        },

        render: function() {
            // Since render can be used to kick things off with pre-populated models (by-passing onConfigChange),
            // make sure the wrapped viz has the correct config first.  This is not an issue
            // with the search data because formatData will always be called before anything else.
            this._wrappedViz.setCurrentConfig(this._filterConfigObject(this.model.config.toJSON()));
            return Base.prototype.render.apply(this, arguments);
        },

        remove: function() {
            this._tryWithAsyncCatch(function() {
                this._wrappedViz.remove();
            });
            return Base.prototype.remove.apply(this, arguments);
        },

        _drilldown: function(payload, originalEvent) {
            payload = payload || {};
            payload.data = payload.data || {};
            var transformedPayload = { rowContext: {} };
            if (originalEvent) {
                transformedPayload.originalEvent = originalEvent;
            }

            this._addTimeRangeDrilldownInfo(payload, transformedPayload);

            // keyword drilldown is temporarily disabled because of a bug in the intentions parser (SPL-111722)
            if (false && payload.action === 'keyword') {
                this._addKeywordDrilldownInfo(payload, transformedPayload);
            } else if (payload.action === 'fieldvalue') {
                this._addFieldValueDrilldownInfo(payload, transformedPayload);
            } else if (payload.action === 'geoviz') {
                this._addGeospatialDrilldownInfo(payload, transformedPayload);
            } else if (payload.action) {
                console.warn('Ignoring the following un-supported drilldown action: ' + payload.action);
            }

            if (transformedPayload.type || transformedPayload.name === '_time') {
                this.trigger('drilldown', transformedPayload);
            }
        },

        _addTimeRangeDrilldownInfo: function(payload, transformedPayload) {
            var rowContext = transformedPayload.rowContext;
            if (payload.hasOwnProperty('earliest')) {
                var earliestTimeEpoch = this._normalizeDrilldownTimeValue(payload.earliest);
                _.extend(transformedPayload, {
                    name: '_time',
                    value: earliestTimeEpoch
                });
                rowContext['row._time'] = earliestTimeEpoch;
                if (payload.latest) {
                    var latestTimeEpoch = this._normalizeDrilldownTimeValue(payload.latest);
                    transformedPayload._span = latestTimeEpoch - earliestTimeEpoch;
                }
            } else if (payload.hasOwnProperty('latest')) {
                console.warn('Ignoring drilldown "latest" argument because no "earliest" argument was specified.');
            }
        },

        _normalizeDrilldownTimeValue: function(timeValue) {
            if (timeUtils.isValidIsoTime(timeValue)) {
                return parseFloat(splunkUtils.getEpochTimeFromISO(timeValue));
            }
            return parseFloat(timeValue) || 0;
        },

        _addKeywordDrilldownInfo: function(payload, transformedPayload) {
            if (payload.data.term) {
                _.extend(transformedPayload, {
                    type: 'addterm',
                    name2: payload.data.term
                });
            } else {
                console.warn('Ignoring keyword drilldown action because the data did not contain a "term".');
            }
        },

        _addFieldValueDrilldownInfo: function(payload, transformedPayload) {
            var rowContext = transformedPayload.rowContext;
            if (!_.isEmpty(payload.data)) {
                _.extend(transformedPayload, {
                    type: 'row'
                });
                var fields = _(payload.data).keys(),
                    values = _(payload.data).values();

                _(fields).each(function(field, i) {
                    rowContext['row.' + field] = values[i];
                });
                // There has to be a `name` for Simple XML drilldown, so we just use the first field name alphabetically.
                if (!transformedPayload.name) {
                    transformedPayload.name = fields.sort()[0];
                }
            } else {
                console.warn('Ignoring field-value drilldown because the data did not contain any field-value pairs.');
            }
        },

        _addGeospatialDrilldownInfo: function(payload, transformedPayload) {
            if (this._validateGeovizDrilldownPayload(payload)) {
                _.extend(transformedPayload, {
                    type: 'geoviz',
                    data: {
                        latitude: payload.data.lat.value,
                        longitude: payload.data.lon.value,
                        _geo_lat_field: payload.data.lat.name,
                        _geo_long_field: payload.data.lon.name
                    },
                    fields: ['latitude', 'longitude']
                });
                if (payload.data.bounds) {
                    _.extend(transformedPayload.data, {
                        _geo_bounds_south: payload.data.bounds[0],
                        _geo_bounds_west: payload.data.bounds[1],
                        _geo_bounds_north: payload.data.bounds[2],
                        _geo_bounds_east: payload.data.bounds[3]
                    });
                }
            } else {
                console.warn(
                    'Ignoring geo-spatial drilldown because the data was incomplete.  ' +
                    'Both "lat" and "lon" are required, each with a "name" and "value" property.'
                );
            }
        },

        _validateGeovizDrilldownPayload: function(payload) {
            var data = payload.data;
            if (!data || !data.lat || !data.lon) {
                return false;
            }
            return (data.lat.name && data.lat.value && data.lon.name && data.lon.value);
        },

        _filterConfigObject: function(configObject) {
            var filtered = {};
            _(configObject).each(function(value, key) {
                // Mod viz properties must be in the correct namespace, and the un-qualified property name
                // can't contain a '.'
                if (key.indexOf(this._namespace) === 0 && key.replace(this._namespace, '').indexOf('.') === -1) {
                    filtered[key] = value;
                }
            }, this);
            return filtered;
        },

        _filterDataParams: function(params) {
            // Re-map outputMode to output_mode so the consumer has consistent camel-case keys.
            if (params.outputMode) {
                params = _.extend({ output_mode: params.outputMode }, params);
                delete params.outputMode;
            }
            return _(params).pick(DATA_PARAM_WHITELIST);
        },

        _tryWithAsyncCatch: function(callback) {
            try {
                return callback.call(this);
            } catch(e) {
                if (e instanceof SplunkVisualizationBase.VisualizationError) {
                    this.trigger('error', e.message);
                } else {
                    this.trigger('error');
                }
                setTimeout(function() { throw e; }, 0);
                return null;
            }
        }

    });

});