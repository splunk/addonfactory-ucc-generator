define([window.Lodash], function(Lodash) {
    class CustomComponent {
        /**
         * Custom Component
         * @constructor
         * @param {Object} context - {displayErrorMsg, navigator}.
         * @param {element} el - The element of the custom component.
         * @param {model} model - Backbone model for current form.
         * @param {string} serviceName - Input service name.
         */
        constructor(context, el, field, model, serviceName) {
            this.context = context;
            this.el = el;
            this.field = field;
            this.model = model;
            this.serviceName = serviceName;
        }
        render() {
            console.log('render is called');
            console.log(window.Lodash.now());
            this.el.innerHTML = '<input id="mytext" type="text"></text>';
            var el = this.el.querySelector('#mytext');
            el.addEventListener('change', () => {
                this.model.set(this.field, el.value);
                console.log(`Set ${this.field} to ${el.value}`);
                // this.context.displayErrorMsg(this.context.selector, el.value);
            });
            return this;
        }
    }

    return CustomComponent;
});
