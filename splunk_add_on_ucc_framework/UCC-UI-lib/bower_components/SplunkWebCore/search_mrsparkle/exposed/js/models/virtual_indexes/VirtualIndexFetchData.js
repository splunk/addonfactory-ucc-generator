/**
 * @author jszeto
 * @date 11/19/14
 *
 * FetchData to use for Virtual Indexes. Currently we have to pass in a search substring to filter out any indexes that
 * are archive indexes. We can only tell if we are an archive index if we have an attribute called "vix.output.buckets.from.indexes"
 */
define([
        'underscore',
        'models/shared/fetchdata/EAIFetchData'
    ],
    function(
        _,
        EAIFetchData
    ) {

        return EAIFetchData.extend({

            toJSON: function(options) {
                var json = EAIFetchData.prototype.toJSON.apply(this, arguments);

                if (_(json.search).isUndefined())
                    json.search = "NOT vix.output.buckets.from.indexes";
                else if (json.search != "")
                    json.search = json.search + " AND NOT vix.output.buckets.from.indexes";

                return json;
            }

        });

    });