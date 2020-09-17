define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base'
],
function(
    $,
    _,
    Backbone,
    module,
    Base
){
    /**
     * @constructor
     * @memberOf views
     * @name Control
     * @description The base Control class for all controls.
     * @extends {views.Base}
     */
    return Base.extend(/** @lends views.Control.prototype */{
        moduleId: module.id,
        className: 'control',
        initialize: function(){
            Base.prototype.initialize.apply(this, arguments);

            var defaults = {
                    defaultValue: '',
                    enabled: true,
                    validate: false,
                    forceUpdate: false,
                    updateModel: true,
                    size: 'default'
            };
            _.defaults(this.options, defaults);

            this._setValue(this.options.defaultValue, false);
            if (this.options.modelAttribute) {
                this.$el.attr('data-name', this.options.modelAttribute);
            }

            if (this.model) {
                this.activate({skipSetValueRender: true});
            }

            this.$el.addClass('control-' + this.options.size);

            return this;
        },
        startListening: function() {
            if (this.model) {
                this.listenTo(this.model, 'change:'+this.options.modelAttribute, this.setValueFromModel);
            }
        },
        activate: function(options) {
            options = options || {};
            if (this.active) {
                return Base.prototype.activate.apply(this, arguments);
            }
            if (this.model) {
                this.setValueFromModel(options.skipSetValueRender ? false : true);
            }
            return Base.prototype.activate.apply(this, arguments);
        },
        /**
         * Public value accessor
         */
        getValue: function(){
            return this._value;
        },
        getModelAttribute: function() {
            return this.options.modelAttribute;
        },
        /**
         * Set Value and Update Model,
         * @param {Any} value the new value to assign to the control. If the updateModel flag was
         * set to true in the constructor, then this will also update the model's value
         * @param {Boolean} render if true, then render the control to display the updated value
         * @param {Object} options additional options to control behavior
         *     @param {Boolean} [options.silent = false]  if true, then don't trigger a change event
         *     from the model or control
         */
        setValue: function(value, render, options){
            options = options || {};
            var returnValue = this._setValue(value, render, options.silent);
            if (this.options.updateModel) {
                this.updateModel(options);
            }
            return returnValue;
        },
        /**
         * Set Value. Does not update model.
         */
        _setValue: function(value, render, suppressEvent){
            value = this.normalizeValue(value);
            if (this._value !== value) {
                var oldValue = this._value;

                this._value = value;

                (render === false) || this.render(); // if render is undefined, render anyway.

                if (!suppressEvent) {
                    this.trigger('change', value, oldValue, this);
                }
            } else {
                if (render) {
                    this.render();
                }
            }
            return this;
        },
        /**
         * Override this method if the value needs to be normalized before being used. No options are passed by the base control.
         */
        normalizeValue: function(value, options) {
            return value;
        },
        /**
         * Unsets value from the model
         */
        unsetValue: function() {
            this.model.unset(this.getModelAttribute());
        },
        /**
         * Gets the value to use in the control from the model. The default behavior is to return the value
         * of the modelAttribute. Render is called except on initialize.
         */
        setValueFromModel: function(render) {
            this._setValue(this.model.get(this.options.modelAttribute), render);
            return this;
        },
        /**
         * Applies the value from the control to the model. Subclasses should call this in response to user
         * interaction
         */
        updateModel: function(options) {
            options = options || {};
            var updateOptions = {
                validate: this.options.validate,
                forceUpdate: this.options.forceUpdate
            };
            $.extend(true, updateOptions, options);

            if (this.model) {
                return (this.model[this.options.save ? 'save' : 'set']
                    (this.getUpdatedModelAttributes(), updateOptions));
            }
            return true;
        },
        /**
         * Returns a dictionary of attribute key-value pairs to apply when updating the model.
         * Can be overridden by subclasses as needed.
         */
        getUpdatedModelAttributes: function() {
            var updatedAttrs = {};
            updatedAttrs[this.options.modelAttribute] = this._value;
            return updatedAttrs;
        },
        enable: function() {
            this.$el.removeClass('disabled');
        },
        disable: function() {
            this.$el.addClass('disabled');
        }
    });

});
