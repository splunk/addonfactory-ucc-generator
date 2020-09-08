define([
    'underscore',
    'module',
    'views/shared/controls/Control',
    'util/dom_utils',
    'views/shared/delegates/StopScrollPropagation'
], function(_,
            module,
            Control,
            dom_utils,
            StopScrollPropagation) {

    var ENTER_KEY = 13;

    /**
     * @constructor
     * @memberOf views
     * @name TextareaControl
     * @description Textarea with Bootstrap markup
     * @extends {views.Control}
     *  
     * @param {Object} options
     * @param {String} options.modelAttribute The attribute on the model to observe and update on selection
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} [options.textareaClassName] Class attribute for the textarea
     * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
     * @param {String} [options.size] size of the control and it's text, currently only supports 'default' and 'small'.
     * @param {String} [options.updateOnInput] update the model when user types in characters. This is different from
     * updating the model when textarea loses focus, which is the default behavior.
     * @param {Boolean} [options.propagateScrollEvents] false to stop propagating scroll events from the textarea DOM element. Default is true.
     */
    return Control.extend(/** @lends views.TextareaControl.prototype */{
        moduleId: module.id,
        initialize: function() {
            var defaults = {
                    textareaClassName: '',
                    placeholder: '',
                    useSyntheticPlaceholder: false,
                    trimLeadingSpace: true,
                    trimTrailingSpace: true,
                    spellcheck: true,
                    updateOnInput: false,
                    propagateScrollEvents: true
            };
            _.defaults(this.options, defaults);
           
            if (this.options.placeholder && !dom_utils.supportsNativePlaceholder()) {
                this.options.useSyntheticPlaceholder = true;
            }
            
            Control.prototype.initialize.apply(this, arguments);
        },
        events: {
            'input textarea': function(e) {
                if (this.options.updateOnInput) {
                    this.onInputChange(e);
                }
            },
            'change textarea': 'onInputChange',
            'click .placeholder': function(e) {
                if (this.options.enabled)
                    this.$textarea.focus();
            },
            'keyup textarea': function(e) {
                this.updatePlaceholder();
            },
            'mouseup textarea': function(e) { //could result in pasted text
                this.updatePlaceholder();
            },
            'keypress textarea': function(e) {
                // Eat the Enter event since the textarea input handles this event. Ideally we'd call preventDefault
                // and listen for defaultPrevented, but this isn't
                if (e.which == ENTER_KEY) {
                    e.stopPropagation();
                }
            }
        },
        onInputChange: function(e) {
            if (this.options.enabled) {
                this.setValue(this.getTrimmedValue(this.$('textarea').val()), false);
                this.updatePlaceholder();
           }
        },
        getTrimmedValue: function(originalValue) {
            var trimmedValue = originalValue;
            if(this.options.trimLeadingSpace) {
                trimmedValue = trimmedValue.replace(/^\s+/g, '');
            }
            if(this.options.trimTrailingSpace) {
                trimmedValue = trimmedValue.replace(/\s+$/g, '');
            }

            return trimmedValue;
        },
        updatePlaceholder: function() {
           if (this.options.useSyntheticPlaceholder) {
                this.$placeholder[this.$textarea.val() === '' ? 'show' : 'hide']();
           }
        },
        disable: function(){
            this.options.enabled = false;
            this.$textarea.hide();
            this.$disabledTextarea.show();
        },
        enable: function(){
            this.options.enabled = true;
            this.$textarea.show();
            this.$disabledTextarea.hide();
        },
        render: function() {
            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                        options: this.options,
                        value: (_.isUndefined(this._value) || _.isNull(this._value)) ? '' : this._value
                    });
                this.$el.html(template);
                this.$textarea = this.$('textarea');
                this.$disabledTextarea = this.$('.uneditable-input');
                if (this.options.useSyntheticPlaceholder) {
                    this.$placeholder = this.$('.placeholder');
                }
                if (!this.options.propagateScrollEvents) {
                    this.children.stopScrollPropagation = new StopScrollPropagation({ el: this.$el, selector: 'textarea' });
                }
            } else {
                if (this.getTrimmedValue(this.$textarea.val()) !== this._value) {
                    this.$textarea.val(this._value);
                }
                this.$disabledTextarea.text(this._value);
            }
            this.updatePlaceholder();
            
            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }

            return this;
        },
        template: '\
            <span class="uneditable-input uneditable-input-multiline \
                        <%= options.textareaClassName %>" \
                    <% if(options.enabled){ %>\
                        style="display:none"\
                    <%}%>><%- value %></span>\
            <textarea type="text" \
                        name="<%- options.modelAttribute || "" %>" \
                        class="<%= options.textareaClassName %>" \
                        <% if(options.placeholder && !options.useSyntheticPlaceholder){ %>\
                           placeholder="<%- options.placeholder %>"\
                        <%}%> \
                        <% if(!options.enabled){ %>\
                            style="display:none"\
                        <%}%>\
                        <% if(!options.spellcheck){ %>\
                            spellcheck="false"\
                        <%}%>\
            ><%- value %></textarea>\
            <% if (options.useSyntheticPlaceholder) { %> \
                <span class="placeholder"><%- options.placeholder %></span>\
            <% } %>\
        '
    });
});
