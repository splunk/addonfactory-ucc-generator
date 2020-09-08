define([
            'backbone'
        ],
        function(
            Backbone
        ) {

    var isConstructorSubclass = function(test, ctor) {
        return (test === ctor || test.prototype instanceof ctor);
    };

    return ({

        isViewConstructor: function(test) {
            return isConstructorSubclass(test, Backbone.View);
        },

        isModelConstructor: function(test) {
            return isConstructorSubclass(test, Backbone.Model);
        },

        isCollectionConstructor: function(test) {
            return isConstructorSubclass(test, Backbone.Collection);
        }

    });

});