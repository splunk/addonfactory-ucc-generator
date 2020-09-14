Splunk.Module.AbstractFormSettingModule = $.klass(Splunk.Module, {
    /**
     * AbstractFormSettingModule encapsulates the general pattern of
     * passing a form element's value down the module tree as
     * a Splunk.Module setting.
     *
     * Parameters not defined by Splunk.Module:
     * @param {String, Object, Function} selector can be a DOM element, a valid CSS selector string, a jQuery object or a callback function.
     *        Callbacks are provided in case the element name cannot be determined until after $super is run.
     * @param {Object} options an object literal of options which includes:
     *        'events': a string representation of the events to be used to fire the bound form element.
     */
    initialize: function($super, container, selector, options){
        if (selector == null) {
            throw new Exception('The selector parameter must be included when calling intialize on AbstractFormSettingModule.');
        }

        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;


        // Assign default options
        var defaults = {'events': 'change'};
        options = $.extend(defaults, options);

        // Allow for callbacks
        if (typeof(selector) == 'function') selector = selector();
        this._formElement = $(selector, this.container);
        this._bindEventOnFormElement(options['events']);
    },

    /**
     * Commonly overriden to change the default behavior of the bound event firing.
     * @param {Object} event event passed from firing.
     */
    onEvent: function(event) {
        this.pushContextToChildren();
    },
    
    /**
     * Returns shared settings for broadcasting.
     * @return {Object} returns a settings map used to merge settings passed on to child modules.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        context.set(this._params['settingName'], this._formElement.val());
        return context;
    },

    /**
     * Bind the 'events' defined in initialize to the form element.
     * While not commonly overridden, different behavior can be defined by
     * creating your own _bindEventOnFormElement method.
     * @param {String} events string that defines the list of events to monitor on the form element.
     */
    _bindEventOnFormElement: function(events) {
        this._formElement.bind(events, this.onEvent.bind(this));
    }
});
