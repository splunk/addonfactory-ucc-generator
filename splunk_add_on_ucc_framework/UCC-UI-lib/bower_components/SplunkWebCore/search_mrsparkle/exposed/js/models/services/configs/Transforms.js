define(
    [
        'underscore',
        'models/SplunkDBase'
    ],
    function(_, SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "configs/conf-transforms",
            urlRoot: "configs/conf-transforms",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            whiteListAttributes: function(fetchOptions) {
                return _.extend(this.entry.content.attributes, {}, fetchOptions);
            }
        });
    }
);