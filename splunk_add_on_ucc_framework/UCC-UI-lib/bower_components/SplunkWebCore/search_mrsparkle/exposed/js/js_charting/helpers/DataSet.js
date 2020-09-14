define(['jquery', 'underscore', '../util/math_utils'], function($, _, mathUtils) {

    var DataSet = function(data) {
        var fields = data.fields || {};
        var series = data.columns || {};

        this.fields = [];
        this.seriesList = [];
        this.fieldMetadata = {};

        _(fields).each(function(field, i) {
            var fieldName;
            if(_.isObject(field)) {
                fieldName = field.name;
                this.fieldMetadata[fieldName] = field;
            }
            else {
                fieldName = field;
            }
            if(this.ALLOWED_HIDDEN_FIELDS_REGEX.test(fieldName) || this.isDataField(fieldName)){
                this.fields.push(fieldName);
                this.seriesList.push($.extend([], series[i]));
            }
        }, this);
        this.length = this.fields.length;

        // create an instance-specific memoized copy of getSeriesAsFloats
        this.getSeriesAsFloats = _.memoize(this.getSeriesAsFloats, this.seriesAsFloatsMemoizeHash);
    };

    DataSet.prototype = {

        ALLOWED_HIDDEN_FIELDS_REGEX: /^(_span|_tc|_lower.*|_predicted.*|_upper.*)$/,
        DATA_FIELD_REGEX: /^[^_]|^_time$/,

        allFields: function() {
            return this.fields.slice();
        },

        allDataFields: function() {
            return _(this.fields).filter(this.isDataField, this);
        },

        isDataField: function(field){
            return this.DATA_FIELD_REGEX.test(field);
        },

        isTotalValue: function(value) {
            return (value === 'ALL');
        },

        hasField: function(name) {
            return (_(this.fields).indexOf(name) > -1);
        },

        fieldAt: function(index) {
            return this.fields[index];
        },

        fieldIsGroupby: function(name) {
            return (this.fieldMetadata[name] && this.fieldMetadata[name].hasOwnProperty('groupby_rank'));
        },

        seriesAt: function(index) {
            return this.seriesList[index];
        },

        getSeries: function(name) {
            var index = _(this.fields).indexOf(name);
            if(index === -1) {
                return [];
            }
            return _(this.seriesList[index]).map(function(value) { return value === null ? '' : value; });

        },

        getSeriesAsFloats: function(name, options) {
            options = options || {};
            var series = this.getSeries(name),
                nullsToZero = options.nullValueMode === 'zero',
                logScale = options.scale === 'log',
                asFloats = [];

            for(var i = 0; i < series.length; i++) {
                var floatVal = mathUtils.parseFloat(series[i]);
                if(_.isNaN(floatVal)) {
                    asFloats.push(nullsToZero ? 0 : null);
                    continue;
                }
                asFloats.push(logScale ? mathUtils.absLogBaseTen(floatVal) : floatVal);
            }
            return asFloats;
        },

        // this is a targeted fix for the case where the back-end adds an 'ALL' data point to the end of a time series
        // but could be expanded into a more generic handler as we grow into it
        getSeriesAsTimestamps: function(name) {
            var series = this.getSeries(name);
            if(this.isTotalValue(_(series).last())) {
                return series.slice(0, -1);
            }
            return series;
        },

        seriesAsFloatsMemoizeHash: function(name, options) {
            options = options || {};
            return name + options.scale + options.nullValueMode;
        },

        toJSON: function() {
            return ({
                fields: this.fields,
                columns: this.seriesList
            });
        }

    };

    return DataSet;

});