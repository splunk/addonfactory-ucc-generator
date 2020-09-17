define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/Bundle',
    'collections/managementconsole/Configurations'
], function($,
            _,
            Backbone,
            BundleModel,
            ConfigurationsCollection
) {
    return ConfigurationsCollection.extend({
        model: BundleModel,

        parse: function(response) {
            var newResponse = {};
            newResponse.entry = [];
            newResponse.paging = {};

            _.each(response, function(value, key) {
                var bundleJson = this.wrapBundleJson(value, key);
                newResponse.entry.push(bundleJson);
            }.bind(this));

            newResponse.paging.total = newResponse.entry.length;
            return ConfigurationsCollection.prototype.parse.call(this, newResponse);
        },

        wrapBundleJson: function(value, key) {
            return {
                name: key,
                content: value
            };
        },

        clone: function() {
            var cloned = ConfigurationsCollection.prototype.clone.call(this);
            cloned.paging = this.paging.clone();
            return cloned;
        }
    });
});