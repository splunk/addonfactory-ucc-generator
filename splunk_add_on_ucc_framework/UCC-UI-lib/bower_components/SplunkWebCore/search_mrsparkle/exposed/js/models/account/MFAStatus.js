define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            hasError: function() {
                return !!this.entry.content.get("mfaError");
            },
            getErrorMessage: function() {
                return this.entry.content.get("mfaError") || '';
            },
            sync: function(){
                throw new Error('Sync method not supported on MFAStatus Model');
            }
        });
    }
);