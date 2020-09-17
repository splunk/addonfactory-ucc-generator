define([
            'underscore',
            'module',
            'views/shared/controls/Control',
            'views/shared/Icon',
            './TextControl.pcssm',
            'util/keyboard',
            'helpers/user_agent'
        ],
        function(
            _,
            module,
            Control,
            IconView,
            css,
            keyboardUtil,
            userAgent
        ) {
    /**
     * @constructor
     * @memberOf views
     * @name TextControl
     * @description Text Input with Bootstrap markup
     * @extends {views.Control}
     *
     * @param {Object} options Hash of options
     * @param {String} options.modelAttribute The attribute on the model to observe and update on selection
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} [options.inputClassName] Class attribute for the input
     * @param {String} [options.placeholder] Placeholder text to display in the input if browser supports
     * @param {String} [options.useSyntheticPlaceholder] If true, use the placeholder value
     * @param {Object} [options.defaultValue] If the modelAttribute in the model is undefined, then
     *                                        use this value to populate the text input
     * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
     * @param {Boolean} [options.updateOnKeyUp] Update the model with the value on any key-up event
     * @param {Boolean} [options.canClear] show a clear button
     * @param {Boolean} [options.autocomplete] the input allows native autocomplete,
     * @param {Boolean} [options.updateOnAutofill] Should the input update the model in response to browser autofill events,
     *                                             used for username/password inputs, default is false
     * @param {String} [options.elementId] Element id attribute(s) to add to control input
     * @param {String} [options.size] size of the control and it's text, currently only supports 'default' and 'small'.
     * @param {Boolean} [options.useLocalClassNames] enable css modules and hashed classnames
     *
     * @todo [JCS] Do we use prepend and append?
     */
    return Control.extend(/** @lends views.TextControl.prototype */{
        moduleId: module.id,
        useLocalClassNames: false,
        constructor: function(options) {
            _.extend(this, _.pick(options || {}, 'useLocalClassNames'));

            // switch out the global classnames for local ones if it hasn't already been overridden.
            if (this.useLocalClassNames && this.css === undefined) {
                this.css = css;
            } else if (!this.css) {
                this.css = this.defaultCSS;
            }

            // remove inheritted 'control' className
            if (this.useLocalClassNames) {
                this.className = '';
            }

            Control.apply(this, arguments);
        },
        initialize: function() {
            var defaults = {
                inputClassName: '',
                placeholder: '',
                prepend: false,
                append: false,
                useSyntheticPlaceholder: false,
                trimLeadingSpace: true,
                trimTrailingSpace: true,
                password: false,
                updateOnKeyUp: false,
                canClear: false,
                autocomplete: false,
                style: 'default',
                elementId: '',
                clearOnEsc: true
            };
            _.defaults(this.options, defaults);

            if (this.options.placeholder && !this.supportsNativePlaceholder()) {
                this.options.useSyntheticPlaceholder = true;
            }

            if (this.options.canClear && this.useLocalClassNames) {
                this.children.clearIcon = new IconView({icon: 'xCircle'});
            }

            Control.prototype.initialize.apply(this, arguments);
        },
        events: {
            'change input[type=password], input[type=text]': function(e) {
                this.updateClear();
                this.onInputChange();
            },
            'click [data-role=placeholder]': function(e) {
                this.$input.focus();
            },
            'keyup input[type=password], input[type=text]': function(e) {
                if (e.which === keyboardUtil.KEYS["ESCAPE"] && 
                    this.options.clearOnEsc) {
                    
                    this.clear();
                }
                this.updateClear();
                this.updatePlaceholder();
                this.trigger("keyup", e, this.$input.val());
                if (this.options.updateOnKeyUp || e.keyCode === keyboardUtil.KEYS['ENTER']) {
                    this.onInputChange();
                }
            },
            
            // SPL-104353 in IE11 and IE10 the text area does not get focus when clicked with a popdown open.
            // This forces the focus. 
            'mousedown input[type=password], input[type=text]': function(e) {
                if (userAgent.isIE()) {
                    this.$input.focus();
                }
            },

            'mouseup input[type=password], input[type=text]': function(e) { //could result in pasted text
                this.updateClear();
                this.updatePlaceholder();
            },
            'click [data-role=clear]': function(e) {
                e.preventDefault();
                this.clear();
                this.updateClear();
                this.updatePlaceholder();
            },
            // The input event is fired by Firefox when auto-filling a text box.
            // This is also fired whenever you right-click and paste text
            'input input': function() {
                if (this.options.updateOnAutofill) {
                    this.updateClear();
                    this.onInputChange();
                }
            }
        },
        focus: function() {
            this.$("input").focus();
        },
        onInputChange: function() {
            var inputValue = this.$input.val();
            if(this.options.trimLeadingSpace) {
                inputValue = inputValue.replace(/^\s+/g, '');
            }
            if(this.options.trimTrailingSpace) {
                inputValue = inputValue.replace(/\s+$/g, '');
            }
            this.setValue(inputValue, false);
            this.updatePlaceholder();
        },

        updatePlaceholder: function() {
           if (this.options.useSyntheticPlaceholder)
               this.$placeholder[this.$input.val() === '' ? 'show' : 'hide']();
        },
        supportsNativePlaceholder: function() {
            return ('placeholder' in document.createElement('input'));
        },
        disable: function(){
            if (this.$input) {
                this.$input.hide();
            }
            if (this.$disabledInput) {
                this.$disabledInput.css('display', 'inline-block');
            }
        },
        enable: function(){
            if (this.$input) {
                this.$input.show();
            }
            if (this.$disabledInput) {
                this.$disabledInput.hide();
            }
        },
        updateClear: function(){
            this.$clear[this.$input.val() ? 'show' : 'hide']();
        },
        clear: function(){
            this.$input.val('');
            this.setValue('');
        },
        render: function() {
            this.useLocalClassNames && this.$el.attr('class', this.css.view);

            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                        options: this.options,
                        value: (_.isUndefined(this._value) || _.isNull(this._value)) ? '' : this._value,
                        css: this.css
                    });

                this.$el.html(template);
                this.$input = this.$('input');
                this.$disabledInput = this.$('[data-role=uneditable-input]');
                if (this.options.useSyntheticPlaceholder)
                    this.$placeholder = this.$('[data-role=placeholder]');
                if (this.options.prepend)
                    this.$el.addClass(this.css.prepend).prepend(this.options.prepend);
                if (this.options.append)
                    this.$el.addClass(this.css.append).append(this.options.append);

                // Black magic to listen for changes due to auto-filling of the text input by the browser.
                // In IE, the "change" and "input" events are not fired in this case.
                if (this.options.updateOnAutofill && userAgent.isIE()) {
                    this.$input[0].onpropertychange = _.debounce(function() {
                        if (this.$clear) {
                            this.updateClear();
                        }
                        this.onInputChange();
                    }.bind(this), 50);
                }

                if (this.options.canClear && this.useLocalClassNames) {
                    this.children.clearIcon.render().replaceAll(this.$('.icon-x-circle'));
                }
            } else {
                if (this.$input.val() !== this._value) {
                    this.$input.val(this._value);
                }
                this.$disabledInput.text(this._value);
            }
            this.updatePlaceholder();

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }

            this.$clear = this.$('[data-role=clear]');
            this.updateClear();

            return this;
        },
        remove: function() {
            if (this.$input && this.$input.length > 0) {
                this.$input[0].onpropertychange = null;
            }
            return Control.prototype.remove.apply(this, arguments);
        },
        defaultCSS: {
            uneditableInput: 'uneditable-input',
            input: '',
            inputCanClear: 'text-clear',
            inputSearch: 'search-query',
            prepend: 'input-prepend',
            append: 'input-append',
            clear: 'control-clear',
            placeholder: 'placeholder'
        },
        // TODO: the `for` control-controlCid needs to be hooked up to the input with same `id`
        template: '\
        <span class="<%- css.uneditableInput %> <%= options.inputClassName %>" data-role="uneditable-input" \
            <% if(options.enabled){ %>style="display:none"<%}%>><%- value %></span>\
        <input type="<% if (options.password){%>password<%}else{%>text<%}%>" \
               name="<%- options.modelAttribute || "" %>" \
               class="<%- options.style == "search" ? css.inputSearch : css.input %> <%- options.canClear ? css.inputCanClear : "" %> <%- options.inputClassName%>"\
               value="<%- value %>" \
               autocomplete="<% if (options.autocomplete){ %>on<% } else { %>off<% } %>" \
               <% if(options.elementId){ %>id="<%- options.elementId %>"<%}%> \
               <% if(options.placeholder && !options.useSyntheticPlaceholder){ %>placeholder="<%- options.placeholder %>"<%}%> \
               <% if(!options.enabled){ %>style="display:none"<%}%>>\
            <% if (options.useSyntheticPlaceholder) { %> <span class="<%- css.placeholder %>" data-role="placeholder"><%- options.placeholder %></span><% } %>\
            <% if (options.canClear) { %><a href="#" class="<%- css.clear %>" data-role="clear" style="display:none"><i class="icon-x-circle"></i></a><% } %>\
        '
    });
});
