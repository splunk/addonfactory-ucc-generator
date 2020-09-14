Splunk.Module.TextSetting = $.klass(Splunk.Module.AbstractFormSettingModule, {

    /**
     * The time in ms to wait between sending the value of the text field
     * to child modules.
     */
    TYPING_INTERVAL_TIMEOUT: 300,

    initialize: function($super, container) {
        $super(container,
            function() {
                return 'input[name='+this._params['elementName']+']';
            }.bind(this),
            {'events': 'keyup change'}
        );
        
        // Stores the timeout function for passing settings.
        this._eventTimer = null;

        // Cache of the last value to eliminate redundant settings pushes.
        this._lastValue = '';
    },

    /**
     * Attempts to reduce the number of settings dispatched by introducing
     * a brief lag via TYPING_INTERVAL_TIMEOUT, and by checking if the value
     * is the same as the previous value.
     */
    onEvent: function($super, event) {
        if (this._eventTimer) clearTimeout(this._eventTimer);
        if (this._lastValue && this._lastValue == this._formElement.val()) return;
        this._eventTimer = setTimeout(function() {
            this._lastValue = this._formElement.val();
            this.pushContextToChildren();
        }.bind(this), this.TYPING_INTERVAL_TIMEOUT);
    }
});
