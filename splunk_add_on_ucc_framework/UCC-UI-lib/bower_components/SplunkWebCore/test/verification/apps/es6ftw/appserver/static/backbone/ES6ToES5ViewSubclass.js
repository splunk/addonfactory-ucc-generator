define([
    'underscore',
    './ES6ViewSuperclass'
], function(
    _,
    ES6ViewSuperclass
) {

    return ES6ViewSuperclass.extend({

        tagName: 'h1',

        events: _.extend({}, ES6ViewSuperclass.prototype.events, {
            'mouseover a': function(e) {
                e.preventDefault();
                this.mouseOverHandler();
            }
        }),

        constructor: function(options) {
            ES6ViewSuperclass.apply(this, arguments);
            this.es5SubclassConstructed = options.constructorOption;
        },
        
        initialize: function(options) {
            ES6ViewSuperclass.prototype.initialize.apply(this, arguments);
            this.es5SubclassInitialized = options.initializeOption;
        },

        mouseOverHandler: function() {},

        template: '\
            <a href="#">One Link</a>\
            <a href="#">Two Links</a>\
        '

    },
    {
        es5SubclassStaticProp: 'A static prop from the es5 subclass'
    });

});