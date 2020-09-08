/**
 * Created by ykou on 5/21/14.
 */
define([
    'underscore',
    'models/Base',
    "models/services/cluster/master/Bucket",
    "collections/SplunkDsBase"
],
    function(_, BaseFetchDataModel, Model, SplunkDsBaseCollection) {
        // we have no choice because the /cluster/master/buckets endpoints contains too many buckets.
        // If we use 'search' as filter, splunkd will easily get Out Of Memory crash. SPL-87828
        // So that we have to re-write the toJSON() function only for this collection.
        // this endpoint accepts filter like: filter=key1=val1,key2=val2,key3=val3,...
        // refer to: https://confluence.splunk.com/display/PROD/Clustering+inspecting+cluster+state
        var FetchData = BaseFetchDataModel.extend({

            defaults: {
                filter: {}
            },

            toJSON: function(options) {
                var json = BaseFetchDataModel.prototype.toJSON.apply(this, arguments);

                if(json.sortKey) {
                    json.sort_key = json.sortKey;
                    json.sort_dir = json.sortDirection;
                }
                delete json.sortKey;
                delete json.sortDirection;

                if(_(json.filter).size() > 0) {
                    var keyValues = [];
                    _(json.filter).each(function(match, key) {
                        keyValues.push(key + '=' + match);
                    });
                    json.filter = keyValues.join(',');
                }

                return json;
            }

        });

        return SplunkDsBaseCollection.extend({
            url: 'cluster/master/buckets',
            model: Model,
            initialize: function() {
                var options = {};
                options.fetchData = new FetchData();
                SplunkDsBaseCollection.prototype.initialize.call(this, null, options);
            },
            getModel: function(bucketName) {
                return this.get('/services/cluster/master/buckets/' + bucketName);
            }
        });
    });