define(
        [
            'collections/Base',
            "models/shared/FlashMessage"
        ],
        function(BaseCollection, FlashMessageModel) {
            return BaseCollection.extend({
                model: FlashMessageModel,
                initialize: function() {
                    BaseCollection.prototype.initialize.apply(this, arguments);
                }
            });
        }
);
