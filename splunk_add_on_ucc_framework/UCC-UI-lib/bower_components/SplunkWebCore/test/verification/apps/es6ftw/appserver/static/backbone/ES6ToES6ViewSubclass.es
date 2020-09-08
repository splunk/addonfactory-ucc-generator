import ES6ViewSuperclass from './ES6ViewSuperclass';
import _ from 'underscore';

export default ES6ViewSuperclass.extend({

    tagName: 'h2',

    events: _.extend({}, ES6ViewSuperclass.prototype.events, {
        'mouseout a'(e) {
            e.preventDefault();
            this.mouseOutHandler();
        },
    }),

    constructor(options, ...rest) {
        ES6ViewSuperclass.call(this, options, ...rest);
        this.es6SubclassConstructed = options.constructorOption;
    },

    initialize(options, ...rest) {
        ES6ViewSuperclass.prototype.initialize.call(this, options, ...rest);
        this.es6SubclassInitialized = options.initializeOption;
    },

    mouseOutHandler() {},

    template: `
        <a href="#">One Link</a>\
        <a href="#">Two Links</a>\
        <a href="#">Three Links</a>\
    `,

}, {
    es6SubclassStaticProp: 'A static prop from the es6 subclass',
});
