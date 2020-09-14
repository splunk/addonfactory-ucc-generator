define(
    [
        "jquery",
        "underscore",
        "backbone",
        "collections/SplunkDsBase",
        'models/services/licenser/License',
        'util/general_utils'
    ],
    function($, _, Backbone, SplunkDsBaseCollection, LicenseModel, general_utils) {
        return SplunkDsBaseCollection.extend({
            url: "licenser/licenses",
            model: LicenseModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);