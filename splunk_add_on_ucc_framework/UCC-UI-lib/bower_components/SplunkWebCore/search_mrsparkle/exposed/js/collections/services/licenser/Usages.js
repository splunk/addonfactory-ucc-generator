define(
    [
        "jquery",
        "underscore",
        "backbone",
        "collections/SplunkDsBase"
    ],
    function($, _, Backbone, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "licenser/usage",
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);