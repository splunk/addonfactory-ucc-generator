/*
 * A generic job results container that supports the "json_rows", "json_cols", and "json" output mode.
 *
 * Use this model when it is not known beforehand which output mode will be needed.  If the output mode
 * is known ahead of time, use the ResultJsonRows or ResultJsonCols subclasses.
 */

define([
            'underscore',
            'models/SplunkDRaw',
            'models/shared/fetchdata/ResultsFetchData'
        ],
        function(
            _,
            SplunkDRaw,
            ResultsFetchData
        ) {

    var DATA_FIELD_REGEX = /^[^_]|^_time$|^_raw$/;

    var RESPONSE_KEY_WHITELIST = [
        'fields', 'rows', 'columns', 'results',
        'post_process_count', 'init_offset'
    ];

    return SplunkDRaw.extend({

        initialize: function(attributes, options) {
            options = options || {};
            if (_(options.fetchData).isUndefined()) {
                options.fetchData = new ResultsFetchData();
            }
            SplunkDRaw.prototype.initialize.call(this, attributes, options);
        },

        parse: function(response) {
            // Since we're storing mutable objects as model attributes, Backbone will use a reference check
            // to determine whether to fire a change event.  Instead, perform a deep equality check
            // here and bypass Backbone if there are no changes.
            var parsed = _(response).pick(RESPONSE_KEY_WHITELIST);
            if (_.isEqual(parsed, this.pick(RESPONSE_KEY_WHITELIST))) {
                return {};
            }
            return parsed;
        },

        getDataFields: function() {
            var fields = this.get('fields') || [];
            return _(fields).chain().map(this.normalizeFieldName, this).filter(this.isDataField, this).value();
        },

        isDataField: function(fieldName) {
            return DATA_FIELD_REGEX.test(fieldName);
        },

        normalizeFieldName: function(field) {
            return _.isString(field) ? field : field.name;
        }

    });

});