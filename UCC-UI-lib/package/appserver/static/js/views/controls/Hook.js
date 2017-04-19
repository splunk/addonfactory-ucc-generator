define([], function() {
    class Hook {
        constructor() {

        }
        onCreate() {
            console.log('in Hook: onCreate');
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
