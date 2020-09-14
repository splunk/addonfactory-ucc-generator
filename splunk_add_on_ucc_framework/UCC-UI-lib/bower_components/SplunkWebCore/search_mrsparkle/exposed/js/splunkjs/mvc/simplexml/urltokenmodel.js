define(function(require, exports, module) {
    var BaseTokenModel = require('../basetokenmodel');
    var urlModel = require('models/url');
    var DashboardController = require("./controller");
    var general_utils = require('util/general_utils');

    /**
     * Automatically mirrors the current URL query parameters.
     */
    var UrlTokenModel = BaseTokenModel.extend({
        moduleId: module.id,
        initialize: function() {
            urlModel.on('change', function(model, options) {
                this.setFromClassicUrl();
            }, this);

            this.setFromClassicUrl();

            DashboardController.router.on('route', function() {
                this.trigger("url:navigate");
            }, this);
        },
        /** Saves this model's current attributes to the URL. */
        save: function(attributes, options) {
            this.set(attributes);
            this.saveClassicUrl(options);
        },
        saveOnlyWithPrefix: function(prefix, attributes, options){
            var filter =["^"+prefix+".*", "^earliest$", "^latest$"];
            this.save(general_utils.filterObjectByRegexes(attributes, filter,  { allowEmpty: true, allowObject: true } ), options);
        },
        saveClassicUrl: function(options){
            urlModel.save(this.toJSON(), options);
        },
        setFromClassicUrl: function(){
            this.set(urlModel.toJSON());
        }
    });

    return UrlTokenModel;
});
