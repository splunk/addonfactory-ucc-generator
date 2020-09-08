define([
            'jquery',
            'underscore',
            'models/services/search/IntentionsParser',
            'splunk.util',
            'util/console'
        ],
        function(
            $,
            _,
            IntentionsParser,
            splunkUtil,
            console
        ) {

    var computeModifierKey = function(clickInfo) {
        var event = clickInfo.originalEvent || clickInfo;
        return !!(event.ctrlKey || event.metaKey);
    };

    var computeAltKey = function(clickInfo) {
        var event = clickInfo.originalEvent || clickInfo;
        return !!event.altKey;
    };

    var convertRowDrilldownToIntentions = function(clickInfo, metadata) {
        var rowContext = _(clickInfo.rowContext).omit('row._time'),
            field = _(rowContext).chain().keys().map(function(f) { return f.replace('row.', ''); }).value();
        
        var isGroupbyField = function(fieldName) {
            return metadata[fieldName] && metadata[fieldName].hasOwnProperty('groupby_rank');
        };

        var isSplitbyField = function(fieldName) {
            return _.any(metadata, function(meta) { return meta['splitby_field'] === fieldName; });
        };

        // If any field in the metadata is the result of a group-by operation, then filter arguments to the inentionsparser
        // to only include groub-by and split-by fields.
        if (metadata && _.any(metadata, function(meta, fieldName) { return isGroupbyField(fieldName); })) {
            field = _(field).filter(function(f) {
                return isGroupbyField(f) || isSplitbyField(f);
            });
        }
        return ({
            action: 'fieldvalue',
            field: field,
            value: _(field).map(function(f) { return rowContext['row.' + f]; })
        });
    };

    var convertCellDrilldownToIntentions = function(clickInfo) {
        var field, value;
        if (clickInfo.name === '_time') {
            field = _.compact([clickInfo.name2]);
            value = _.compact([clickInfo.value2]);
        } else {
            if (clickInfo.name && clickInfo.name2) {
                field = [clickInfo.name, clickInfo.name2];
                value = [clickInfo.value, clickInfo.value2];
            } else if (clickInfo.name) {
                field = [clickInfo.name];
                value = [clickInfo.value];
            } else {
                field = [clickInfo.name2];
                value = [clickInfo.value2];
            }
        }
        return ({
            action: 'fieldvalue',
            field: field,
            value: value
        });
    };

    var convertColumnDrilldownToIntentions = function(clickInfo) {
        return ({
            action: 'keyword',
            field: clickInfo.name2
        });
    };

    var convertAddTermDrilldownToIntentions = function(clickInfo) {
        return ({
            action: 'addterm',
            value: clickInfo.name2
        });
    };

    // normalize data for drilldown event to handle a map click
    var convertGeovizDrilldownToIntentions = function(clickInfo) {
        var latLonFields, latLonValues, params,
            DRILLDOWN_PROPERTIES = {
                _geo_lat_field: '_geo_lat_field',
                _geo_lon_field: '_geo_long_field',
                _geo_bounds_south: '_geo_bounds_south',
                _geo_bounds_west: '_geo_bounds_west',
                _geo_bounds_north: '_geo_bounds_north',
                _geo_bounds_east: '_geo_bounds_east'
            };

        if (!_.all(DRILLDOWN_PROPERTIES, function(srcKey) { return !!clickInfo.data[srcKey]; })) {
            // The search results did not contain bound information for the marker. This happens when the
            // results have not been produced by the geostats command. In this case we fall back
            // to a 'fieldvalue' action with the first two fields, which should be latitude and longitude.
            latLonFields = clickInfo.fields.slice(0, 2);
            latLonValues = _(latLonFields).map(function(f) { return clickInfo.data[f]; });
            return ({
                action: 'fieldvalue',
                field: latLonFields,
                value: latLonValues
            });
        }
        params = _(DRILLDOWN_PROPERTIES).chain().map(function(srcKey, prop) {
            return [prop, clickInfo.data[srcKey]];
        }).object().value();
        return (_.extend({ action: 'geoviz' }, params));
    };

    var Drilldown = {};

    /**
     * Calls the intentions parser which then generates a new search string and time range based on the original
     * search string of the manager and the click information.
     *
     * @param clickInfo {Object} - {
     *      name/value, name2/value2 {String}
     *      _span {Number}
     *      type {String}
     *      rowContext {Object} map of all key-value pairs in the row
     *      originalEvent {jQuery Event} the original browser event
     *  }
     * @param query {Object} - the properties of the current query - {
     *     search {String} the current search string
     *     earliest {String} the current earliest time
     *     latest {String} the current latest time
     * }
     * @param metadata - the current field metadata
     * @param applicationModel - the current application model
     * @param options {Object} - {
     *      negate {Boolean} - Invert the drilldown intention
     *      stripReportsSearch {Boolean} - default true, strip of all reporting commands, drill down into events
     *      newSearch {Boolean} - default false, drill down into all events, ignores current search string
     *      drilldownNewTab {Boolean} - whether to open a new tab for the drilldown action,
     *                                  default is to inspect the clickInfo for a modifier key
     *      fields {Array} - list of additional field constraints to apply to cell drilldown
     *      values {Array} - list of additional value constraints (1 to 1 correspondence with "fields" above)
     *  }
     *
     * @returns A promise for the result of the intentions parser - which is an object containing the search
     *              string (q) and the time range (earliest and latest)
     */
    Drilldown.applyDrilldownIntention = function(clickInfo, query, metadata, applicationModel, options) {
        options || (options = {});
        var search = options.newSearch ? '*' : query.search,
            newTab = Drilldown.shouldDrilldownInNewTab(clickInfo, options),
            intentionsParser = new IntentionsParser();

        if (clickInfo.name === '_time') {
            intentionsParser.set({
                'dispatch.earliest_time': clickInfo.value
            }, { silent: true });
        }
        if (clickInfo._span) {
            intentionsParser.set({
                'dispatch.latest_time': JSON.stringify(Math.round((parseFloat(clickInfo.value) + clickInfo._span) * 1000) / 1000)
            }, { silent: true });
        }

        var intentionParams = {
            negate: options.hasOwnProperty('negate') ? options.negate : computeAltKey(clickInfo),
            stripReportsSearch: options.hasOwnProperty('stripReportsSearch') ? options.stripReportsSearch : true
        };
        if (options.fields && options.fields.length > 0) {
            _.extend(intentionParams, { action: 'fieldvalue', field: options.fields, value: options.values });
        }
        else if (clickInfo.type === 'geoviz') {
            _.extend(intentionParams, convertGeovizDrilldownToIntentions(clickInfo));
        } else if (clickInfo.type === 'column') {
            _.extend(intentionParams, convertColumnDrilldownToIntentions(clickInfo));
        } else if (clickInfo.type === 'row') {
            _.extend(intentionParams, convertRowDrilldownToIntentions(clickInfo, metadata));
        } else if (clickInfo.type === 'addterm') {
            _.extend(intentionParams, convertAddTermDrilldownToIntentions(clickInfo));
        } else {
            _.extend(intentionParams, convertCellDrilldownToIntentions(clickInfo));
        }

        console.info('Applying drilldown intention', intentionParams);
        var dfd = $.Deferred();
        intentionsParser.fetch({
            data: _.extend({
                q: search,
                fieldMetaData: JSON.stringify(metadata),
                app: applicationModel.get('app'),
                owner: applicationModel.get('owner'),
                parse_only: true
            }, intentionParams)
        }).done(function() {
            dfd.resolve({
                'q': splunkUtil.stripLeadingSearchCommand(intentionsParser.get('fullSearch')),
                'earliest': intentionsParser.get('dispatch.earliest_time') || query.earliest || 0,
                'latest': intentionsParser.get('dispatch.latest_time') || query.latest || ''
            }, newTab);
        }).fail(function() {
            dfd.reject.apply(dfd, arguments);
        });

        return dfd.promise();
    };

    /*
     * Returns whether or not the drilldown should be in a new tab.
     *
     * @param clickInfo {Object} (see applyDrilldownIntention above)
     * @param options {Object} (see applyDrilldownIntention above)
     */
    Drilldown.shouldDrilldownInNewTab = function(clickInfo, options) {
        options = options || {};
        var modifierKey = clickInfo.hasOwnProperty('modifierKey') ? clickInfo.modifierKey : computeModifierKey(clickInfo);
        return options.hasOwnProperty('drilldownNewTab') ? options.drilldownNewTab : modifierKey;
    };

    // we want those functions to be testable
    Drilldown._convertRowDrilldownToIntentions = convertRowDrilldownToIntentions;
    Drilldown._convertCellDrilldownToIntentions = convertCellDrilldownToIntentions;
    Drilldown._convertColumnDrilldownToIntentions = convertColumnDrilldownToIntentions;
    Drilldown._convertAddTermDrilldownToIntentions = convertAddTermDrilldownToIntentions;
    Drilldown._convertGeovizDrilldownToIntentions = convertGeovizDrilldownToIntentions;

    return Drilldown;

});