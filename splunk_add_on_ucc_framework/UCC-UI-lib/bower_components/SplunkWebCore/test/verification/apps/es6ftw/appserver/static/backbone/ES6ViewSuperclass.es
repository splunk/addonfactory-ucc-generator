import BaseView from 'views/Base';

export default BaseView.extend({

    moduleId: module.id,

    tagName: 'span',

    events: {
        'click a'(e) {
            e.preventDefault();
            this.clickHandler();
        },
    },

    constructor(options, ...rest) {
        BaseView.call(this, options, ...rest);
        this.es6SuperConstructed = options.constructorOption;
    },

    initialize(options, ...rest) {
        BaseView.prototype.initialize.call(this, options, ...rest);
        this.es6SuperInitialized = options.initializeOption;
    },

    render() {
        this.$el.html(this.compiledTemplate);
        return this;
    },

    clickHandler() {},

    template: `
        <a href="#">A link</a>
    `,

}, {
    es6staticProp: 'A static prop from es6',
});
