define([], function() {
    class Hook {
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
