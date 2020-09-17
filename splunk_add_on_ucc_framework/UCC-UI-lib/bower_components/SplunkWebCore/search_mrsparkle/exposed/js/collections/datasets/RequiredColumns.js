define(
    [
        'collections/Base',
        'models/datasets/RequiredColumn'
    ],
    function (
        BaseCollection,
        RequiredColumnModel
    ) {
        return BaseCollection.extend({
            model: RequiredColumnModel,

            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Required Columns collection');
            }
        });
    }
);