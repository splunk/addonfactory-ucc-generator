define(
[
    'models/SplunkDBase'
],
function(SplunkDBaseModel) {
    return SplunkDBaseModel.extend({
        url: 'licenser/licenses',
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        }
    });
});
