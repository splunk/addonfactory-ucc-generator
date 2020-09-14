define(['./ItemState'], function(ItemState) {

    return ItemState.extend({
        stateIdPrefix: 'fieldset_',
        initState: {submitButton: false},
        setState: function(fieldset) {
            var newState = {
                submitButton: fieldset.settings.get('submitButton'),
                autoRun: fieldset.settings.get('autoRun') 
            };
            ItemState.prototype.setState.call(this, newState);
        }
    });

});