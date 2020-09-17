define(
    [
        'jquery',
        'underscore',
        'collections/Base',
        'models/Base'
    ],
    function(
        $,
        _,
        BaseCollection,
        BaseModel
    ) {
        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);

                this.initializeAssociated();
            },

            initializeAssociated: function() {
                var RootClass = this.constructor;
                this.associated = this.associated || {};

                this.functions = this.functions || new RootClass.Functions();
                this.associated.functions = this.functions;
            },

            parse: function(response, options) {
                response = BaseModel.prototype.parse.apply(this, arguments);

                // When Backbone collections are set, all the models are parsed and THEN initialized. In those cases,
                // we need to initializeAssociated here so that this model has a functions collection to reset.
                this.initializeAssociated();

                if (response.functions) {
                    this.functions.reset(response.functions, options);
                    delete response.functions;
                }

                return response;
            },

            setFromAggregateJSON: function(jsonPayload, options) {
                options = options || {};

                if (!options.skipClone) {
                    jsonPayload = $.extend(true, {}, jsonPayload);
                }

                if (jsonPayload) {
                    if (jsonPayload.functions) {
                        this.functions.set(jsonPayload.functions, options);
                        delete jsonPayload.functions;
                    }
                }

                return this.set(jsonPayload, options);
            },

            toJSON: function(options) {
                var baseJSON = BaseModel.prototype.toJSON.apply(this, arguments),
                    functionsJSON = this.functions.toJSON(options);

                if (!_.isEmpty(baseJSON) || !_.isEmpty(functionsJSON)) {
                    baseJSON.functions = functionsJSON;
                }

                return baseJSON;
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Aggregate model');
            }
        }, {
            Functions: BaseCollection
        });
    }
);
