define(
    [
        'jquery',
        'models/SplunkDBase',
        'collections/SplunkDsBase'
    ],
    function($, Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: '/services/properties/limits',
            model: Model,
            sync: function(method, collection, options) {
                var defaults = {data: {fillcontents: 1}};
                $.extend(true, defaults, options);
                return Collection.prototype.sync.apply(this, [method, collection, defaults]);
            },
            getModelByName: function(modelName){
                return this.find(function(model){
                    return model.entry.get("name") === modelName;
                });                
            },
            getSearchModel: function(){
                return this.getModelByName("search");
            }
        });
    }
);
