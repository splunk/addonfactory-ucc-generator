define([], function() {
    class ExpandRow {
        /**
         * Custom Row
         * @constructor
         * @param {Object} globalConfig - Global configuration.
         * @param {string} serviceName - Input service name.
         * @param {element} el - The element of the custom row.
         * @param {model} model - Splunk backbone model for the stanza.
         */
        constructor(globalConfig, serviceName, el, model) {
            this.globalConfig = globalConfig;
            this.serviceName = serviceName;
            this.el = el;
            this.model = model;
        }
        render() {
            const el = this.el.querySelector('.details');
            el.innerHTML = 'hello world for test';
            return this;
        }
    }
    return ExpandRow;
});
