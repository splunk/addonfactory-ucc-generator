define(
    [
        'models/services/data/ui/Time',
        'collections/SplunkDsBase'
    ],
    function(TimeModel, SplunkDsBaseCollection) {
        var TimesCollection = SplunkDsBaseCollection.extend({
            url: 'data/ui/times',
            model: TimeModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            filterToRealTime: function(type) {
                return this.filter(function(model) {
                    return model.isRealTime();
                });
            },
            filterToPeriod: function(type) {
                return this.filter(function(model) {
                    return model.isPeriod();
                });
            },
            filterToLast: function(type) {
                return this.filter(function(model) {
                    return model.isLast();
                });
            },
            filterToOther: function(type) {
                return this.filter(function(model) {
                    return model.isOther();
                });
            },
            comparator: function(model) {
                return parseInt(model.entry.content.get('order'), 10);
            }
        });

        return TimesCollection;
    }
);