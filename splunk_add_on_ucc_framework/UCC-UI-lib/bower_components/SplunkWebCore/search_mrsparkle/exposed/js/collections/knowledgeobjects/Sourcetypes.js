define(
    [
    	"jquery",
    	"underscore",
        "models/knowledgeobjects/Sourcetype",
        "collections/SplunkDsBase"
    ],
    function($, _, Model, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "saved/sourcetypes",
            model: Model,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            getCategories: function(){
                //TODO this could probably be a little more efficient (a lot of loops). ideally backend would give us a cached list of categories.
                var categories = [{value: 'Custom',label: _('Custom').t()}];
                var byId = {'custom':true};

                this.each(function(model){
                    var name = model.entry.content.get('category');
                    if(!name){return;}

                    if(byId[name.toLowerCase()]){return;}
                    byId[name.toLowerCase()] = true;

                    categories.push({
                        value: name,
                        label: _(name).t()
                    });
                });

                return _.sortBy(categories, function(item) {
                    return (item.label||'').toLowerCase();
                });

            }
        });
    }
);