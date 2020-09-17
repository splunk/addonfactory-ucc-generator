define([
            'underscore',
            'module',
            'views/shared/controls/Control',
            'util/keyboard',
            'helpers/user_agent'
        ],
        function(
            _,
            module,
            Control,
            keyboardUtil,
            userAgent
        ) {
    /**
     * Text Input with Bootstrap markup
     *
     * @param {Object} options
     *                        {String} modelAttribute The attribute on the model to observe and update on selection
     *                        {Object} model The model to operate on
     *                        {Boolean} outputString (Optional) When set to true, a string will be written to the model, instead of a number. Default false.
     *                        {Boolean} integerOnly (Optional) When set to true, does not allow floats.
     *                        {Number} min (Optional) When set does not allow numbers lower than this value.
     *                        {Number} max (Optional) When set does not allow numbers higher than this value.
     *                        {Number} step (Optional) the amount of change when the user clicks the plus or minus incrementers.
     *                        {String} inputClassName (Optional) Class attribute for the input
     *                        {String} placeholder (Optional) Placeholder text to display in the input if browser supports
     *                        {String} useSyntheticPlaceholder (Optional) If true, use the placeholder value
     *                        {Object} defaultValue (Optional) If the modelAttribute in the model is undefined, then
     *                                 use this value to populate the text input
     *                        {String} additionalClassNames (Optional) Class attribute(s) to add to control
     *                        {Boolean} updateOnKeyUp (Optional) Update the model with the value on any key-up event. Not supported for floats or negative numbers.
     *                        {Boolean} autocomplete (Optional) the input allows native autocomplete,
     *                        {Boolean} updateOnAutofill (Optional) Should the input update the model in response to browser autofill events,
     *                                  used for username/password inputs, default is false
     *                        {String} elementId (Optional) Element id attribute(s) to add to control input
     */

    return Control.extend({
        moduleId: module.id,
        initialize: function() {
            var defaults = {
                outputString: false,
                integerOnly: false,
                inputClassName: '',
                step: 1,
                placeholder: '',
                prepend: false,
                append: false,
                useSyntheticPlaceholder: false,
                updateOnKeyUp: false,
                autocomplete: false,
                enabled: true,
                elementId: ''
            };
            _.defaults(this.options, defaults);

            if (this.options.placeholder && !this.supportsNativePlaceholder()) {
                this.options.useSyntheticPlaceholder = true;
            }
            
            this.allowNegativeNumbers = _.isUndefined(this.options.min) ? true : this.options.min < 0;
            this.normalizeInputDebounced = _.debounce(this.normalizeInput,300);

            Control.prototype.initialize.apply(this, arguments);
        },
        events: {
            'change input[type=text]': function(e) {
                this.onInputChange();
            },
            
            'click .placeholder': function(e) {
                this.$input.focus();
            },
            
            'keydown input[type=text]': function(e) {
                // keypress would make some of the detection easier, but returning false on keypress doesn't always prevent the character from being entered.
                
                var keyCode = e.which;
                
                //cleanse on keyup will also remove invalid input, but this is better as it doesn't show then remove the character
                if (!e.metaKey && !e.ctrlKey && !e.altKey && keyboardUtil.addsText(keyCode)) {
                    //only allow numbers, negative and decimals
                    if (!keyboardUtil.isNumeric(keyCode) || (keyboardUtil.isNumber(keyCode) && e.shiftKey)) {
                        e.preventDefault();
                        this.notifyCorrection();
                    }
                    
                    //if decimal is not allowed or there is already one, return false
                    if (keyboardUtil.isMinus(keyCode) && (this.allowNegativeNumbers === false || this.$input.val().indexOf('-') >= 0)) {
                        e.preventDefault();
                        this.notifyCorrection();
                    }
                    
                    //if decimal is not allowed or there is already one, return false
                    if (keyboardUtil.isDecimal(keyCode) && (this.options.integerOnly === true || this.$input.val().indexOf('.') >= 0)) {
                        e.preventDefault();
                        this.notifyCorrection();
                    }
                }

                //Arrow up and down will increment
                if (keyboardUtil.KEYS.UP_ARROW === keyCode) {
                    this.increment(this.options.step);
                    return false;
                } else if (keyboardUtil.KEYS.DOWN_ARROW === keyCode) {
                    this.increment(-this.options.step);
                    return false;
                }
            },
            
            'keyup input[type=text]': function(e) {                
                this.trigger("keyup", e, this.$input.val());
                if (this.options.updateOnKeyUp || e.keyCode === keyboardUtil.KEYS['ENTER']) {
                    this.onInputChange();
                } else {
                    this.normalizeInputDebounced({allowIncompleteValues: true});
                }
                
                this.updateIncrementers();
            },
            
            'blur input[type=text]': function(e) {
                this.normalizeInput();
            },

            'click .increment-up:not(.disabled)': function(e) {
                e.preventDefault();
                this.increment(this.options.step);
            },

            'click .increment-down:not(.disabled)': function(e) {
                e.preventDefault();
                this.increment(-this.options.step);
            },

            'mouseup input[type=text]': function(e) { //could result in pasted text
                this.normalizeInput();
            },

            'paste input[type=text]': function(e) { //could result in pasted text
                this.normalizeInput();
            },
            
            // The input event is fired by Firefox when auto-filling a text box.
            'input input': function() {
                if (this.options.updateOnAutofill) {
                    this.onInputChange();
                }
            }
        },
        
        _setValue: function(value, render, suppressEvent){
            value = this.normalizeValue(value);
             
            Control.prototype._setValue.apply(this, arguments);

            return this;
        },
        
        focus: function() {
            this.$("input").focus();
        },
        
        onInputChange: function() {
            this.setValue(this.$input.val(), false);
        },
        
        notifyCorrection: function() {
            this.$("input").hide().addClass('corrected-value').width();
            this.$("input").show().width();
            this.$("input").removeClass('corrected-value');
        },
        
        increment: function(amount) {
            var valNumeric = parseFloat(this.$input.val(), 10),
                targetValNumeric;

            // increment appropriate number
            if (!_.isNaN(valNumeric)) {  // increment the entered value
                targetValNumeric = valNumeric + amount;
            } else if (this.options.defaultValue !== '') { // increment the defaultValue
                targetValNumeric = parseFloat(this.options.defaultValue, 10) + amount;
            } else if (amount > 0) { // increment up to max or step value
                targetValNumeric =  this.options.max || this.options.step;
            } else {// increment down to min or 0
                targetValNumeric =  this.options.min || 0; // set to min or 0
            } 

            // keep in bounds
            if (!_.isUndefined(this.options.min)) {
                targetValNumeric = Math.max(targetValNumeric, this.options.min);
            }
            if (!_.isUndefined(this.options.max)) {
                targetValNumeric = Math.min(targetValNumeric, this.options.max);
            }

            this.setValue(targetValNumeric + '');
            this.updateIncrementers();
        },
        
        normalizeInput: function(options) {
            var initial = this.$input.val(),
                cleaned = this.normalizeValue(initial, options),
                cleanedString = _.isUndefined(cleaned) ? '' : cleaned + '';
                
            if (cleanedString !== initial) {
                this.$input.val(cleanedString);
                this.notifyCorrection();
                this.updateIncrementers();
                this.updatePlaceholder();
            }
        },
        
        normalizeValue: function(val, options) { 
            // allowIncompleteValues allows partly complete numbers, specifically '-', '.' or '-.'
            options = _.defaults(options || {}, {allowIncompleteValues: false}); 
            
            var valNumeric;
                          
            if (_.isUndefined(val) || val === '') {
                return this.options.outputString ? '' : undefined;
            }
            
            val = val + '';

            val = val.replace(/[^\d\.\-]/g,''); //remove any disallowed characters.
            
            if (this.options.integerOnly === true) {
                val = val.replace(/[\.]/g,''); //remove all '.'
            } else if ((val.match(/[\.]/g) || []).length > 1) {
                var index = val.indexOf('.') +1;
                val = val.substr(0,index) + val.substr(index).replace(/[\.]/g,''); //remove second or later '.'
            }
            if (this.allowNegativeNumbers === false) {
                val = val.replace(/[\-]/g,''); //remove all '-'
            } else {
                val = val.substr(0,1) + val.substr(1).replace(/[\-]/g,''); //remove '-' from second or later characters
            }
             
            valNumeric = parseFloat(val, 10);
            if (!_.isUndefined(this.options.min) && !_.isNaN(valNumeric)) {
                var max = Math.max(val, this.options.min);
                
                if (valNumeric !== max) {
                    val = max + ''; //cast it back to a string
                }
            }
             
            valNumeric = parseFloat(val, 10);
            if (!_.isUndefined(this.options.max) && !_.isNaN(valNumeric)) {
                var min = Math.min(val, this.options.max);
                
                if (valNumeric !== min) {
                    val = min + ''; //cast it back to a string
                }
            }
             
            valNumeric = parseFloat(val, 10);
            if (!this.options.outputString && !options.allowIncompleteValues) {
                if (!_.isNaN(valNumeric)){
                    val = this.options.integerOnly ? parseInt(val, 10) : parseFloat(val, 10);
                } else {
                    val = undefined;
                }
            }
        
            return val;  
        },
        
        supportsNativePlaceholder: function() {
            return ('placeholder' in document.createElement('input'));
        },
        
        updatePlaceholder: function() {
           if (this.options.useSyntheticPlaceholder) {
               this.$placeholder[this.$input.val() === '' ? 'show' : 'hide']();
           }
        },
        
        updateIncrementers: function(test){
            var val = parseFloat(this.$input.val());
            
            if (!_.isUndefined(this.options.min)){
                this.$incrementDown[val <= this.options.min && !_.isNull(this._value) && !this._value !== '' ? 'addClass' : 'removeClass']('disabled');
            }
            if (!_.isUndefined(this.options.max)){
                this.$incrementUp[val >= this.options.max  && !_.isNull(this._value) && !this._value !== '' ? 'addClass' : 'removeClass']('disabled');
            }
        },
        
        disable: function(){
            if (this.el.innerHTML) {
                this.$input.hide();
                this.$incrementDown.hide();
                this.$incrementUp.hide();
                this.$disabledInput.css('display', 'inline-block');
            }
        },
        
        enable: function(){
            if (this.el.innerHTML) {
                this.$input.add(this.$incrementDown).add(this.$incrementUp).css('display', '');
                this.$disabledInput.hide();
            }
        },
        
        render: function() {
            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                        options: this.options,
                        value: (_.isUndefined(this._value) || _.isNull(this._value)) ? '' : this._value
                    });

                this.$el.html(template);
                this.$input = this.$('input');
                this.$disabledInput = this.$('.uneditable-input');
                if (this.options.useSyntheticPlaceholder)
                    this.$placeholder = this.$('.placeholder');
                if (this.options.prepend)
                    this.$el.addClass('input-prepend').prepend(this.options.prepend);
                if (this.options.append)
                    this.$el.addClass('input-append').append(this.options.append);

                // Black magic to listen for changes due to auto-filling of the text input by the browser.
                // In IE, the "change" and "input" events are not fired in this case.
                if (this.options.updateOnAutofill && userAgent.isIE()) {
                    this.$input[0].onpropertychange = _.debounce(function() {
                        this.onInputChange();
                    }.bind(this), 50);
                }
            } else {
                if (this.$input.val() !== String(this._value)) {
                    this.$input.val(this._value);
                }
                this.$disabledInput.text(this._value);
            }
            this.updatePlaceholder();

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }

            this.$incrementDown = this.$('.increment-down');
            this.$incrementUp = this.$('.increment-up');
            this.updateIncrementers();

            return this;
        },
        
        remove: function() {
            if (this.$input && this.$input.length > 0) {
                this.$input[0].onpropertychange = null;
            }
            return Control.prototype.remove.apply(this, arguments);
        },
        
        template: '\
            <span class="uneditable-input <%= options.inputClassName %>" \
                <% if(options.enabled){ %>style="display:none"<%}%>><%- value %></span>\
            <a href="#" class="increment-down" \
                <% if(!options.enabled){ %>style="display:none"<%}%>><i class="icon-minus"></i></a>\
            <input type="text" \
               name="<%- options.modelAttribute || "" %>" \
               class="<%- options.canClear ? "text-clear " : "" %><%- options.inputClassName%>"\
               value="<%- value %>" \
               autocomplete="<% if (options.autocomplete){ %>on<% } else { %>off<% } %>" \
               <% if(options.elementId){ %>id="<%- options.elementId %>"<%}%> \
               <% if(options.placeholder && !options.useSyntheticPlaceholder){ %>placeholder="<%- options.placeholder %>"<%}%> \
               <% if(!options.enabled){ %>style="display:none"<%}%>>\
            <% if (options.useSyntheticPlaceholder) { %> <span class="placeholder"><%- options.placeholder %></span><% } %>\
            <a href="#" class="increment-up" \
                <% if(!options.enabled){ %>style="display:none"<%}%>><i class="icon-plus"></i></a>\
        '
    });
});
