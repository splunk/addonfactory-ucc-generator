define([], function() {
    class Hook {
        /**
         * From hook
         * @constructor
         * @param {object} context - {
                    displayErrorMsg,
                    component,
                    addErrorToComponent,
                    removeErrorFromComponent
                }.
         * @param {object} model - Backbone model for current form.
         * @param {object} serviceName - Service name
         */
        constructor(context, model, serviceName) {
            this.context = context;
            this.model = model;
            this.serviceName = serviceName;
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
