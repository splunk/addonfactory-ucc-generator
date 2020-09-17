define(['underscore', 'splunk.util'], function(_, SplunkUtil) {
    var sprintf = SplunkUtil.sprintf;

    function readOnlyWrapInstance(originalInstance, overrideMethods, errorMessage) {
        var Constructor = originalInstance.constructor;
        // Create instance of the original class so instanceof checks still work
        var wrapperInstance = new Constructor();

        var excludes = _.extend({constructor: true}, _.object(overrideMethods, overrideMethods));
        for (var name in Constructor.prototype) {
            var fn = Constructor.prototype[name];
            if (_.isFunction(fn) && !excludes[name]) {
                wrapperInstance[name] = originalInstance[name].bind(originalInstance);
            }
        }

        _(overrideMethods).each(function(blockedMethod) {
            wrapperInstance[blockedMethod] = function() {
                // Method execution is blocked on wrapper instance, since it would modify the data
                throw new Error(sprintf(errorMessage, blockedMethod));
            };
        });

        return wrapperInstance;
    }

    return {

        /**
         * Create a read-only version of the given model instance. This is pointing to the original instance and is
         * not a copy.
         *
         * @param {Backbone.Model} modelInstance
         * @returns {Backbone.Model} the read-only version of the model instance
         */
        readOnlyModel: function(modelInstance) {
            var MODEL_WRITE_METHODS = [
                'fetch',
                'set',
                'clear',
                'unset',
                'save',
                'destroy'
            ];

            return readOnlyWrapInstance(modelInstance, MODEL_WRITE_METHODS, 'Not allowed to call %s method on read-only model');
        },

        /**
         * Create a read-only version of the given collection instance. The result is pointing to the original instance
         * and is not a copy.
         *
         * @param {Backbone.Collection} collectionInstance
         * @returns {Backbone.Collection} the read-only version of the collection instance
         */
        readOnlyCollection: function(collectionInstance) {
            var COLLECTION_WRITE_METHODS = [
                'sync',
                'add',
                'create',
                'remove',
                'reset',
                'set',
                'push',
                'pop',
                'shift',
                'unshift',
                'fetch',
                'sort'
            ];
            
            return readOnlyWrapInstance(collectionInstance, COLLECTION_WRITE_METHODS, 'Not allowed to call %s method on read-only collection');
        }

    };

});