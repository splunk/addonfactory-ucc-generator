define(
    [
        "jquery",
        "underscore",
        "backbone",
        "collections/SplunkDsBase"
    ],
    function($, _, Backbone, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "licenser/localslave",
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);