define([
            'underscore',
            'models/services/search/jobs/GenericResultJson',
            'models/shared/fetchdata/ResultsFetchData'
        ],
        function(
            _,
            GenericResultJson,
            ResultsFetchData
        ) {

    return GenericResultJson.extend({

        initialize: function(attributes, options) {
            options = options || {};
            if (_(options.fetchData).isUndefined()) {
                options.fetchData = new ResultsFetchData({ output_mode: 'json_cols', show_metadata: true });
            }
            GenericResultJson.prototype.initialize.call(this, attributes, options);
        }

    });

});