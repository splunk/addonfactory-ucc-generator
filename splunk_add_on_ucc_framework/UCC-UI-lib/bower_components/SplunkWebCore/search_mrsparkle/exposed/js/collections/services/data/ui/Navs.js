define(
    [
        "models/services/data/ui/Nav",
        "collections/SplunkDsBase"
    ],
    function(NavModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "data/ui/nav",
            model: NavModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            findByAppName: function(name) {
                for (var i = 0; i < this.length; i++){
                    var model = this.at(i);
                    if (name === model.entry.content.get('eai:appName')) {
                        return model;
                    }
                }
            }
        });
    }
);