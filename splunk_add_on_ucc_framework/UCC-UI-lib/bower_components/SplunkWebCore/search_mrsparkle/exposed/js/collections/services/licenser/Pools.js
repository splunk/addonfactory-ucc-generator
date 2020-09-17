define(
    [
        "jquery",
        "underscore",
        "backbone",
        "collections/SplunkDsBase",
        'util/general_utils'
    ],
    function($, _, Backbone, SplunkDsBaseCollection, general_utils) {
        return SplunkDsBaseCollection.extend({
            url: "licenser/pools",
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);