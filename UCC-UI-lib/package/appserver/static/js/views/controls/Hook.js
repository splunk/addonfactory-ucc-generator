define([], function() {
    class Hook {
        /**
         * Form hook
         * @constructor
         * @param {Object} globalConfig - Global configuration.
         * @param {object} serviceName - Service name
         * @param {object} model - Backbone model for form, not Splunk model
         * @param {object} util - {
                    displayErrorMsg,
                    addErrorToComponent,
                    removeErrorFromComponent
                }.
         */
        constructor(globalConfig, serviceName, model, util) {
            this.globalConfig = globalConfig;
            this.serviceName = serviceName;
            this.model = model;
            this.util = util;
        }
        onCreate() {
            console.log('in Hook: onCreate');
        }
        onRender() {
            console.log('in Hook: onRender');
        }
        onSave() {
            console.log('in Hook: onSave');
        }
        onSaveSuccess() {
            console.log('in Hook: onSaveSuccess');
        }
        onSaveFail() {
            console.log('in Hook: onSaveFail');
        }
    }
    return Hook;
});
