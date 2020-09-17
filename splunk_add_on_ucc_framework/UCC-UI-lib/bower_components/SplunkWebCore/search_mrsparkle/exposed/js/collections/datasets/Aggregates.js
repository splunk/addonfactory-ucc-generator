define(
    [
        'jquery',
        'collections/Base',
        'models/datasets/Aggregate'
    ],
    function (
        $,
        BaseCollection,
        AggregateModel
    ) {
        return BaseCollection.extend({
            model: AggregateModel,

            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },

            setFunctions: function(jsonPayload, options) {
                options = options || {};

                if (!options.skipClone) {
                    jsonPayload = $.extend(true, {}, jsonPayload);
                }

                if (jsonPayload) {
                    this.each(function(aggregate, index) {
                        aggregate.setFromAggregateJSON(jsonPayload[index], options);
                    }, this);
                }
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Aggregates collection');
            }
        });
    }
);