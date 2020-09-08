/**
 * @author jszeto
 * @date 1/20/14
 *
 * Model representing the response from a Job's results or results_preview endpoints when the search has been piped to
 * fieldSummary. (ex. index=_internal | stats count by source | fieldSummary
 *
 * This class subclasses from the Summary model since the models are very similar.
 *
 * Some differences:
 * - fields are contained in the results array instead of the fields array
 * - each field has a values array instead of a modes array
 * - values array is stringified JSON
 * - no histogram
 *
 * example response:
 *
 {
 "fields": [
   {"name": "field"},
   {"name": "count"},
   {"name": "distinct_count"},
   {"name": "is_exact"},
   {"name": "max"},
   {"name": "mean"},
   {"name": "min"},
   {"name": "numeric_count"},
   {"name": "stdev"},
   {"name": "values"}
 ],
 "results": [{
     "field": "count",
     "count": "5",
     "distinct_count": "5",
     "is_exact": "1",
     "max": "794",
     "mean": "200.000000",
     "min": "2",
     "numeric_count": "5",
     "stdev": "335.437774",
     "values": "[{\"value\":\"124\",\"count\":1}]"
   }]
 }
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'models/services/search/jobs/Summary',
        'collections/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        Summary,
        BaseCollection,
        splunkdutils
        )
    {
    /**
     * Model for each item of the results array
     */
       var Field = Backbone.Model.extend(
            {
                idAttribute: "field",
                isNumeric: function() {
                    return this.get('numeric_count') > this.get('count') / 2;
                },
                replace: function() {
                    return BaseModel.prototype.replace.apply(this, arguments);
                },
                deepOff: function() {
                    this.off();
                },
                parse: function(response, options) {
                    response = $.extend(true, {}, response);
                    response.values = JSON.parse(response.values);
                    return response;
                }
            }
        );
        /**
         * Collection for the results array
         */
        var Fields = BaseCollection.extend({
            model: Field
        });

        /**
         * Main model
         */
        var ResultSummary = Summary.extend({
                url: '',
                initialize: function(data, options) {
                    options = options || {};
                    options.fetchData = new BaseModel({ output_mode: 'json'});
                    Summary.prototype.initialize.call(this, data, options);
                },

                initializeAssociated: function() {
                    // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                    var RootClass = this.constructor;
                    this.associated = this.associated || {};
                    //instance level models
                    this.results = this.results || new RootClass.Fields();
                    this.associated.results = this.results;
                },
                clear: function(options) {
                    delete this.eventCount;
                    return Summary.prototype.clear.apply(this, arguments);
                },
                /**
                 * Override helper function to convert the JSON response into the results collection
                 * @param data
                 * @private
                 */
                _fields: function(data) {
                    return data;
                },
                parseAssociated: function(response, options) {
                    var result = Summary.prototype.parseAssociated.apply(this, arguments);
                    this.eventCount = result.fields ? result.fields.length : 0; // Get event count from the fields array
                    return result;
                },
                getEventCount: function() {
                    return this.eventCount;
                },
                /**
                 * Accessor function to get the collection of fields. Subclasses can override
                 * @return {Collection} collection of fields
                 */
                getFields: function() {
                    return this.results;
                },
                /**
                 * Accessor function to get the fields from a response object. Subclasses can override
                 * @param response
                 * @return {Array} array of the fields in the response
                 */
                getFieldsFromResponse: function(response) {
                    return response.results;
                },
                deleteFieldsFromResponse: function(response) {
                    delete response.results;
                },
                // Distribution
                distribution: function(fieldName) {
                    throw new Error("Distribution not supported in ResultSummary model");
                }
            },
            {
                Fields: Fields,
                Field: Field
            });

        return ResultSummary;
    }
);
