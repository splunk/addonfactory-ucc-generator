define([
            'underscore',
            'backbone'
        ],
        function(
            _,
            Backbone
        ) {

    var VisualizationError = function(message) {
        this.name = 'SplunkVisualizationError';
        this.message = message || '';
        Error.apply(this, arguments);
    };

    VisualizationError.prototype = new Error();

    var SplunkVisualizationBase = function(el, appName, vizName) {
        this.el = el;
        this._config = null;
        this._data = null;
        this._appName = appName;
        this._vizName = vizName;
        this.initialize();
    };

    _.extend(SplunkVisualizationBase.prototype, Backbone.Events, {

        /**
         * Override to perform constructor logic.
         *
         * Code in initialize can assume that the visualization has been assigned
         * a root DOM element, available as `this.el`.
         */
        initialize: function() {},

        /**
         * Override to define initial data parameters that the framework should use to
         * fetch data for the visualization.
         *
         * Allowed data parameters:
         *
         * outputMode (required) the data format that the visualization expects, one of
         * - SplunkVisualizationBase.COLUMN_MAJOR_OUTPUT_MODE
         *     {
         *         fields: [
         *             { name: 'x' },
         *             { name: 'y' },
         *             { name: 'z' }
         *         ],
         *         columns: [
         *             ['a', 'b', 'c'],
         *             [4, 5, 6],
         *             [70, 80, 90]
         *         ]
         *     }
         * - SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE
         *     {
         *         fields: [
         *             { name: 'x' },
         *             { name: 'y' },
         *             { name: 'z' }
         *         ],
         *         rows: [
         *             ['a', 4, 70],
         *             ['b', 5, 80],
         *             ['c', 6, 90]
         *         ]
         *     }
         * - SplunkVisualizationBase.RAW_OUTPUT_MODE
         *     {
         *         fields: [
         *             { name: 'x' },
         *             { name: 'y' },
         *             { name: 'z' }
         *         ],
         *         results: [
         *             { x: 'a', y: 4, z: 70 },
         *             { x: 'b', y: 5, z: 80 },
         *             { x: 'c', y: 6, z: 90 }
         *         ]
         *     }
         *
         * count (optional) how many rows of results to request, default is 1000
         *
         * offset (optional) the index of the first requested result row, default is 0
         *
         * sortKey (optional) the field name to sort the results by
         *
         * sortDirection (optional) the direction of the sort, one of:
         * - SplunkVisualizationBase.SORT_ASCENDING
         * - SplunkVisualizationBase.SORT_DESCENDING (default)
         *
         * search (optional) a post-processing search to apply to generate the results
         *
         * @param {Object} config The initial config attributes
         * @returns {Object}
         *
         */
        getInitialDataParams: function(config) {
            return {};
        },

        /**
         * Override to implement custom handling of config attribute changes.
         *
         * Default behavior is to mark the formatData routine invalid.
         *
         * @param {Object} configChanges The changed config attributes, an object with
         *     changed keys mapping to their new values
         * @param {Object} previousConfig The previous config attributes
         */
        onConfigChange: function(configChanges, previousConfig) {
            this.invalidateFormatData();
        },

        /**
         * Override to implement custom data processing logic.
         *
         * The return value of this method will be passed to the updateView routine.
         * This method should not be called directly by visualization code, call
         * invalidateFormatData instead to notify the framework that the formatData
         * routine needs to be run again.
         *
         * @param {Object} rawData The data in its raw form
         * @param {Object} config The current config attributes
         * @returns {*}
         */
        formatData: function(rawData, config) {
            return rawData;
        },

        /**
         * Override to implement one-time view setup logic.
         *
         * This method will be called immediately before the first call to the
         * updateView routine.
         * This method should not be called directly by visualization code.
         */
        setupView: function() {},

        /**
         * Override to implement visualization rendering logic.
         *
         * This method should not be called directly by visualization code, call
         * invalidateUpdateView instead to notify the framework that the updateView
         * routine needs to be run again.
         *
         * @param {*} data The formatted data, as returned by the formatData routine
         * @param {Object} config The current config attributes
         * @param {Function} async A function that notifies the framework that the
         *    visualization will update asynchronously.
         *    If all updates are occurring synchronously within updateView,
         *    the `async` parameter can be ignored.
         *    If any updates are asynchronous (e.g. animations), call async() and
         *    use the return value as a callback to signal that the update has completed:
         *
         *    updateView: function(data, config, async) {
         *        var done = async();
         *        this.performAsyncUpdates({
         *            onComplete: done
         *        });
         *    }
         */
        updateView: function(data, config, async) {},

        /**
         * Override to implement visualization resizing logic.
         *
         * This method will be called whenever the container dimensions change.
         * The current container dimensions can be obtained by measuring `this.el`.
         * This method should not be called directly by visualization code, call
         * invalidateReflow instead to notify the framework that the reflow
         * routine needs to be run again.
         *
         */
        reflow: function() {},

        /**
         * Override to perform all necessary teardown logic.
         */
        remove: function() {},

        /**
         * Call this method to update the data parameters to be used when fetching data,
         * the framework will fetch an updated data set.
         *
         * This method should be treated as final.
         *
         * @param {Object} newParams New data parameters, to be merged with the existing ones.
         *     See getInitialData above for a description of allowed inputs.
         */
        updateDataParams: function(newParams) {
            this.trigger('updateDataParams', newParams);
        },

        /**
         * Call this method to notify the framework of a drilldown interaction.
         *
         * @param payload {Object} a description of the "intention" of the drilldown interaction.
         *
         * Two different type of drilldown action are supported:
         *
         * 1) Field-value pair drilldown, where the "intention" is to filter the results by
         *    setting one or more field-value pairs as constraints, e.g.
         *
         *    this.drilldown({
         *        action: SplunkVisualizationBase.FIELD_VALUE_DRILLDOWN,
         *        data: {
         *            fieldOne: valueOne,
         *            fieldTwo: valueTwo,
         *            ...
         *        }
         *    });
         *
         * 2) Geo-spatial drilldown, where the "intention" is to filter the results to a
         *    geo-spatial region, e.g.
         *
         *    this.drilldown({
         *        action: SplunkVisualizationBase.GEOSPATIAL_DRILLDOWN,
         *        data: {
         *            lat: {
         *                name: <name of latitude field>
         *                value: <value of latitude field>
         *            },
         *            lon: {
         *                name: <name of longitude field>
         *                value: <value of longitude field>
         *            },
         *            bounds: [<south>, <west>, <north>, <east>]
         *        }
         *    });
         *
         * Additionally, the "intention" can filter the results to a specific time range.
         * The time range can be combined with any of the actions above, e.g.
         *
         *    this.drilldown({
         *        earliest: '1981-08-18T00:00:00.000-07:00',
         *        latest: '1981-08-19T00:00:00.000-07:00'
         *        // optionally an `action` and `data`
         *    });
         *
         * The `earliest` and `latest` values can be ISO timestamps in the
         * format above, or as epoch times.
         *
         * @param originalEvent {Event} (optional) the original browser event that initiated the
         *     interaction, used to support keyboard modifiers.
         *
         * This method should be treated as final.
         */

        drilldown: function(payload, originalEvent) {
            this.trigger('drilldown', payload, originalEvent);
        },

        /**
         * Call this method to notify the framework that the formatData routine needs to run again.
         *
         * The framework batches calls to this and other invalidation methods so that
         * the visualization will be updated efficiently.
         *
         * This method should be treated as final.
         */
        invalidateFormatData: function() {
            this.trigger('invalidateFormatData');
        },

        /**
         * Call this method to notify the framework that the updateView routine needs to run again.
         *
         * The framework batches calls to this and other invalidation methods so that
         * the visualization will be updated efficiently.
         *
         * This method should be treated as final.
         */
        invalidateUpdateView: function() {
            this.trigger('invalidateUpdateView');
        },

        /**
         * Call this method to notify the framework that the reflow routine needs to run again.
         *
         * The framework batches calls to this and other invalidation methods so that
         * the visualization will be updated efficiently.
         *
         * This method should be treated as final.
         */
        invalidateReflow: function() {
            this.trigger('invalidateReflow');
        },

        /**
         * Call this method to get the current data, as returned by the formatData routine.
         * Cannot be called in initialize.
         *
         * This method should be treated as final.
         *
         * @returns {*}
         */
        getCurrentData: function() {
            return this._data;
        },

        /**
         * Call this method to get the current config attributes.
         * Cannot be called in initialize.
         *
         * This method should be treated as final.
         *
         * @returns {Object}
         */
        getCurrentConfig: function() {
            return this._config;
        },

        /**
         * Call this method to get info about the viz namespace.
         *
         * This method should be treated as final.
         *
         * @returns {
         *     appName: <string>,
         *     vizName: <string>,
         *     propertyNamespace: <string>
         * }
         */
        getPropertyNamespaceInfo: function() {
            return {
                appName: this._appName,
                vizName: this._vizName,
                propertyNamespace: 'display.visualizations.custom.' + this._appName + '.' + this._vizName + '.'
            };
        },        

        /**
         * Used internally for communication between the framework and the visualization.
         *
         * This method should be treated as final, and should not be called by visualization code.
         */
        setCurrentData: function(data) {
            this._data = data;
        },

        /**
         * Used internally for communication between the framework and the visualization.
         *
         * This method should be treated as final, and should not be called by visualization code.
         */
        setCurrentConfig: function(config) {
            this._config = config;
        }

    });

    _.extend(SplunkVisualizationBase, {
        extend: Backbone.View.extend,

        COLUMN_MAJOR_OUTPUT_MODE: 'json_cols',
        ROW_MAJOR_OUTPUT_MODE: 'json_rows',
        RAW_OUTPUT_MODE: 'json',

        FIELD_VALUE_DRILLDOWN: 'fieldvalue',
        GEOSPATIAL_DRILLDOWN: 'geoviz',

        SORT_ASCENDING: 'asc',
        SORT_DESCENDING: 'desc',

        // Defines a custom error type to be thrown by sub-class in order to
        // propagate an error message up to the user of the visualization, e.g.
        //
        // if (data.columns.length < 2) {
        //     throw new SplunkVisualizationBase.VisualizationError(
        //         'This visualization requires at least two columns of data.'
        //     );
        // }
        VisualizationError: VisualizationError
    });

    return SplunkVisualizationBase;
});
