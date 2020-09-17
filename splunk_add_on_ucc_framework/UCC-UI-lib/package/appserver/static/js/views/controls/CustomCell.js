define([], function() {
    class CustomCell {
        /**
         * Custom Row Cell
         * @constructor
         * @param {Object} globalConfig - Global configuration.
         * @param {string} serviceName - Input service name.
         * @param {element} el - The element of the custom cell.
         * @param {string} field - The cell field name.
         * @param {model} model - Splunk backbone model for the stanza.
         */
        constructor(globalConfig, serviceName, el, field, model) {
            this.globalConfig = globalConfig;
            this.serviceName = serviceName;
            this.el = el;
            this.field = field;
            this.model = model;
        }
        render() {
            this.el.innerHTML = 'test custom cell';
            return this;
        }
    }
    return CustomCell;
});
