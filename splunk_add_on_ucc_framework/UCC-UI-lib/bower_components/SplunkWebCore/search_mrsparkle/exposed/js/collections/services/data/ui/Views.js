define(
    [
        'jquery',
        'backbone',
        'models/services/data/ui/View',
        'collections/SplunkDsBase',
        'splunk.util'
    ],
    function($, Backbone, ViewModel, SplunkDsBaseCollection, splunk_utils) {
        return SplunkDsBaseCollection.extend({
            url: 'data/ui/views',
            model: ViewModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
