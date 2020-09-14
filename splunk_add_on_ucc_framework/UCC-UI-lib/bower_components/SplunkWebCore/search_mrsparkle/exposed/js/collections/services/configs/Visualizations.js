define(
    [   
        'jquery',
        'underscore',
        'module',
        'models/services/configs/Visualization',
        'collections/SplunkDsBase',
        'util/console'
    ],
    function(
        $,
        _,
        module,
        VisualizationModel, 
        SplunkDsBaseCollection,
        console
    ) {

        return SplunkDsBaseCollection.extend({
            moduleId: module.id,
            url: 'configs/conf-visualizations',
            model: VisualizationModel,
            fetch: function(options){
                options = options || {};

                var includeFormatter = options.includeFormatter !== false;
                var appLocalsCollection = options.appLocalsCollection;
                var allDfd = $.Deferred();
                var baseOptions = _.extend({}, options, {
                    success: function(collection, response, opts) {
                        if (options.success) {
                            allDfd.then(function() {
                                options.success(collection, response, opts);
                            });
                        }
                    }
                });
                var fetchDfd = SplunkDsBaseCollection.prototype.fetch.call(this, baseOptions);
                fetchDfd.done(function(response, status, options){
                    this._addVisualizations(includeFormatter, appLocalsCollection).then(function() {
                        allDfd.resolve(response, status, options);
                    });
                }.bind(this));
                fetchDfd.fail(function(){
                    console.log('component load fail');
                });
                return allDfd;
            },

            _addVisualizations: function(includeFormatter, appLocalsCollection) {

                var requireDfds = this.models.map(function(viz) {

                    return viz.addToRegistry({ 
                        loadFormatterHtml: includeFormatter, 
                        appLocalsCollection: appLocalsCollection  
                    });
                });
                return $.when.apply($, requireDfds);
            }
        });
    }
);
