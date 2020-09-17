define(function(require, exports, module) {
    var _ = require('underscore');
    var console = require('util/console');
    var VisualizationRegistry = require('helpers/VisualizationRegistry');
    var VisualizationView = require('./visualizationview');
    var sharedModels = require('./sharedmodels');
    
    return {
        getVisualizer: function(appName, vizName){
            if(!appName || !vizName) {
                throw new Error('app name and viz name required for getVisualizer');
            }

            var vizId = appName + '.' + vizName;

            var vizConfig = VisualizationRegistry.getVisualizationById(vizId);

            if (!vizConfig) {

                var appLocals = sharedModels.get('appLocals');
                appLocals.dfd.then(function(){
                    var appLocalModel = _.filter(appLocals.models, function(model){
                        return model.entry.get('name') === appName;
                    })[0];

                    var appBuildNumber = appLocalModel.getBuild();

                    vizConfig = VisualizationRegistry.registerExternalVisualization({
                        appName: appName, 
                        vizName: vizName,
                        appBuildNumber: appBuildNumber
                    });
                });
            }

            return VisualizationView.extend({
                initialize : function() {
                    this.options.type = vizId;
                    VisualizationView.prototype.initialize.apply(this, arguments);
                }
            });
            
        }
    };
});
