define([
    'jquery',
    'backbone',
    'models/services/data/ui/Panel',
    'collections/SplunkDsBase'
], function ($, Backbone, PanelModel, SplunkDsBaseCollection) {

    return SplunkDsBaseCollection.extend({
        url: 'data/ui/panels',
        model: PanelModel,
        initialize: function () {
            SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
        }
    });

});
