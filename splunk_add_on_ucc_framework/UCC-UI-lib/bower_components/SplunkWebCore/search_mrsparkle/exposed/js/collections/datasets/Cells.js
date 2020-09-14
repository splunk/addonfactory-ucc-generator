define(
    [
        'collections/Base',
        'models/datasets/Cell'
    ],
    function (
        BaseCollection,
        CellModel
    ) {
        return BaseCollection.extend({
            model: CellModel,

            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Cell collection');
            }
        });
    }
);