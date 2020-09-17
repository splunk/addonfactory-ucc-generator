define([
            'underscore',
            'backbone'
        ],
        function(
            _,
            Backbone
        ) {

    return function(Target) {

        return Target.extend({

            initialize: function() {
                if (this.options.apiResources) {
                    if (this.model instanceof Backbone.Model) {
                        throw new Error('Declarative Dependency views only accept dictionaries as their `model` constructor option');
                    }
                    if (this.collection instanceof Backbone.Collection) {
                        throw new Error('Declarative Dependency views only accept dictionaries as their `collection` constructor option');
                    }
                    this.apiResources = this.options.apiResources;
                    this.deferreds = this.options.apiResources.deferreds;
                    this.model = this.model || {};
                    this.collection = this.collection || {};
                    _(this.apiResources).each(function(resource, name) {
                        if (resource instanceof Backbone.Model) {
                            if (this.model[name]) {
                                throw new Error('Api Resource ' + name + ' collides with a model constructor option');
                            }
                            this.model[name] = resource;
                        }
                        if (resource instanceof Backbone.Collection) {
                            if (this.collection[name]) {
                                throw new Error('Api Resource ' + name + ' collides with a collection constructor option');
                            }
                            this.collection[name] = resource;
                        }
                    }, this);
                }
                Target.prototype.initialize.call(this, this.options);
            }

        },
        {
            apiDependencies: Target.apiDependencies || {}
        });
    };

});