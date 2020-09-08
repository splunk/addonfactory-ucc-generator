define(
    [
        'jquery',
        'underscore',
        'models/Base'
    ],
    function(
        $,
        _,
        BaseModel
    ) {
        // Please do not add values to required columns.  But if necessary, whitelist them here :)
        var _whiteList = [
            "id",
            "order",
            "columnToJoinWith"
        ];
        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);

                this.on('add', function(model, collection, options) {
                    if (!this.hasValidAttributes(model)) {
                        throw new Error('not allowed to add with any values on required columns other than ID');
                    }
                }.bind(this));

                this.on('change', function(model, options) {
                    if (!this.hasValidAttributes(model)) {
                        throw new Error('not allowed to set any values on required columns other than ID');
                    }
                }.bind(this));
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Required Column model');
            },

            hasValidAttributes: function(model) {
                var attrs = _.reject(_.keys(model.attributes), function(key) {
                    return _.contains(_whiteList, key);
                });
                return !attrs.length;
            }
        });
    }
);
