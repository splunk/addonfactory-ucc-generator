define([
    'models/SplunkDBase'
],
function(SplunkDBaseModel) {
    return SplunkDBaseModel.extend({
        urlRoot: "cluster/searchhead/generation/",
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        }
    });
});