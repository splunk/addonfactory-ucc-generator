 define(['underscore',
        'module',
        'views/Base',
        'views/shared/controls/TextControl'],
    function(
        _,
        module,
        BaseView,
        TextControl) {

    /**
     * @constructor
     * @memberOf views
     * @name KeyValueControl
     * @description The KeyValueControl contains two TextControls: keyTextControl and
     * valueTextControl. This control lets the user create a new attribute on a model and set its
     * value. It subclasses views/Base instead of views/shared/Controls.
     * @extends {views.Base}
     *
     * @param {Object} options
     * @param {Backbone.Model} options.model The control will set or save the key value pair to this model. The control is not populated with a value from the model
     * @param {String} options.defaultKey Initialize the keyTextControl with this value
     * @param {String} options.defaultValue Initialize the valueTextControl with this value
     * @param {Object} options.keyTextControlOptions Options for the Key {@link TextControl}
     * @param {Object} options.valueTextControlOptions Options for the Value {@link TextControl}
     * @param {Boolean} [options.save = false] If true, then save the key/value pair on the model. Otherwise use set.
     */
    return BaseView.extend(/** @lends KeyValueControl.prototype */{
        moduleId: module.id,
        _key: undefined,
        _oldKey: undefined,
        _value: undefined,
        _oldValue: undefined,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.keyTextControl = new TextControl(this.options.keyTextControlOptions);
            this.children.valueTextControl = new TextControl(this.options.valueTextControlOptions);

            this.listenTo(this.children.keyTextControl, "change", this.onKeyTextControlChange);
            this.listenTo(this.children.valueTextControl, "change", this.onValueTextControlChange);

            if (!_(this.options.defaultKey).isUndefined())
                this.setKey(this.options.defaultKey);

            if (!_(this.options.defaultValue).isUndefined())
                this.setValue(this.options.defaultValue);
        },

        /**
         * Gets the key
         */
        getKey: function() {
            return this._key;
        },

        /**
         * Updates the model with the new key/value pair. If the key changed, then delete the old key
         */
        setKey: function(newKey, ignoreControl) {
            if (this._key != newKey) {
                this._oldKey = this._key;
                if (!_(this._oldKey).isUndefined())
                    this.model.unset(this._oldKey);
                this._key = newKey == "" ? undefined : newKey;
                if (!ignoreControl)
                    this.children.keyTextControl.setValue(this._key);
                if (!_(this._key).isUndefined())
                    this.model.set(this._key, this._value);
                this.triggerChange();
            }
        },

        onKeyTextControlChange: function(newKey, oldKey) {
            this.setKey(newKey, true);
        },

        onValueTextControlChange: function(newValue, oldValue) {
            this.setValue(newValue, true);
        },


        /**
         * Returns the value
         * @return {String}
         */
        getValue: function() {
            return this._value;
        },

        /**
         * Sets the value. If the value has changed, then update the model
         * @param newValue
         */
        setValue: function(newValue, ignoreControl) {
            if (this._value != newValue) {
                this._oldValue = this._value;
                this._value = newValue;
                if (!ignoreControl)
                    this.children.valueTextControl.setValue(this._value);
                if (!_(this._key).isUndefined()) {
                    this.model.set(this._key, this._value);
                    this.triggerChange();
                }
            }
        },

        /**
         * Will remove the current key from the model
         */
        unsetKey: function() {
            this.setKey(undefined);
            this.setValue(undefined);
//            this.model.unset(this._key);
            this._key = this._oldKey = undefined;
            this._value = this._oldValue = undefined;
        },

        /**
         * Triggers a change event with the old key, old value, new key and new value as arguments
         */
        triggerChange: function() {
            this.trigger("change", this._oldKey, this._oldValue, this._key, this._value);
        },

        render: function() {
            this.$el.html(this.compiledTemplate({}));
            this.children.keyTextControl.render().appendTo(this.$(".key-text-control-placeholder"));
            this.children.valueTextControl.render().appendTo(this.$(".value-text-control-placeholder"));
        },


        template: '\
            <div class="key-text-control-placeholder"></div> \
            <div class="value-text-control-placeholder"></div> \
        '
    });
});