define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var console = require('util/console');
    var BaseInputView = require("./baseinputview");
    var Messages = require("./messages");
    var Tooltip = require("bootstrap.tooltip");

    require("css!../css/choice.css");

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name BaseChoiceView
     * @private
     * @description The **BaseChoiceView** base class is a 
     * private abstract base class for form input views that 
     * present static and dynamic choices. 
     *
     * This class presents choices, which consist of a value 
     * and an optional label to display.  If the label is not
     * provided, the value will be displayed.
     * This class is not designed to be instantiated directly.
     * 
     * @extends splunkjs.mvc.BaseInputView
     *
     * @param {Object} choices - An array of choices.
     * @param {Object} options
     * @param {*} options.valueField - Field to use for the option value (and 
     * optionally, the option label).
     * @param {String} options.labelField - Field to use for option label, 
     * defaults to **valueField** if not provided.
     */
    var BaseChoiceView = BaseInputView.extend(/** @lends splunkjs.mvc.BaseChoiceView.prototype */{
        options: {
            choices: [],
            /**
             * If true then choice view defaults its value to the first
             * available choice.
             * 
             * This setting does not apply to BaseMultiChoiceView subclasses.
             */
            selectFirstChoice: false
        },

        initialize: function() {
            this._baseChoiceViewInitialized = false;
            
            this._$messageEl = this.$(".splunk-choice-input-message span");

            this.options = _.extend({}, BaseInputView.prototype.options, this.options);
            BaseInputView.prototype.initialize.apply(this, arguments);

            this.manager = null;
            this.resultsModel = null;

            this.settings.on("change:value", this._onValueChange, this);
            this.settings.on("change:choices change:valueField change:labelField change:default",
                             _.debounce(this.render, 0), this);

            this.settings.enablePush("selectedLabel");
            this.settings.on("change:value change:choices", this.updateSelectedLabel, this);

            this._displayedChoices = [];

            this._baseChoiceViewInitialized = true;
            this._hasUserInput = false;
            // a flag that check whether this input has initial value, selectFirstChoice will be skipped if it's true
            this._hasInitialValue = !_.isUndefined(this.settings.get('value')) || !_.isUndefined(this.settings.get('default'));
            this.updateSelectedLabel();
        },

        onUserInput: function() {
            this._hasUserInput = true;
        },

        updateDomVal: function(value) {
            // Given the value passed in, change the HTML of this
            // control to reflect the current value.
            throw new Error("Abstract method.  Must override");
        },

        updateSelectedLabel: function() {
            // If this method will try to set selectedLabel when push is not  
            // enabled yet (see initialize method) - this will clear all bindings.
            // Property _baseChoiceViewInitialized helps us to synchronize initialization.
            if (this._baseChoiceViewInitialized) {
                var choice = this._findDisplayedChoice(this.val());
                if (choice) {
                    this.settings.set('selectedLabel', choice.label);
                } else {
                    this.settings.unset('selectedLabel');
                }
            }
        },

        _onSearchStart: function() {
            this._hasUserInput = false;
            BaseInputView.prototype._onSearchStart.apply(this, arguments);
        },

        _onValueChange: function(ctx, value, options) {
            this.updateDomVal(value);
            this.updateSelectedLabel(value);
            this.trigger('change', this.val(), this);
        },
        
        _displayMessage: function(messageName) {
            var info = messageName;
            if (_.isString(messageName)) {
                info = Messages.resolve(messageName);
            }

            // For the choice views, we have very limited space to render
            // messages, and so we render them to a specific message container
            // created in _updateView. We also replace the original message with
            // one that is more appropriate for the choice view.
            var message = "";
            var originalMessage = "";
            switch (messageName) {
                case "no-events":
                case "no-results":
                case "no-stats": {
                    message = _("Search produced no results.").t();
                    originalMessage = "";
                    
                    // We need to update the view with the empty search results,
                    // otherwise we may end up displaying stale data.
                    this._updateView(this._viz, []);
                    break;
                }
                case "waiting":
                case "waiting-queued":
                case "waiting-preparing": {
                    message = _("Populating...").t();
                    originalMessage = "";
                    break;
                }
                case "duplicate": {
                    message = _("Duplicate values causing conflict").t();
                    break;
                }
                default: {
                    if (info.level === "error") {
                        message = _("Could not create search.").t();
                        originalMessage = info.message || "";
                    }
                    else {
                        message = "";
                        originalMessage = "";
                    }
                    
                    // We need to update the view with the empty search results,
                    // otherwise we may end up displaying stale data.
                    this._updateView(this._viz, []);
                    break;
                }
            }
            
            // Put the message as the text, but also put the original message
            // as the tooltip.
            this._$messageEl.text(message);
            this._$messageEl.attr("title", originalMessage);
            try {
                this._$messageEl.tooltip('destroy');
                this._$messageEl.tooltip({animation: false});
            } catch (e) {
                // DVPL-3306: Avoid manipulating tooltip if it isn't ready.
                // Unfortunately I can't reproduce the problem consistently
                // enough to identify a better fix.
                var tooltipIsNotReady = (e && e.message && e.message.indexOf(
                    'cannot call methods on tooltip prior to initialization') >= 0);
                if (!tooltipIsNotReady) {
                    throw e;
                } // else ignore and continue
            }
        },

        convertDataToChoices: function(data) {
            // Given a new set of dynamic data, transforms all sources
            // of choices into a value/label pair suitable for DOM
            // rendering.  Merges static and dynamic data into a
            // single array.
            data = data || this._data;
            var valueField = this.settings.get("valueField") || 'value';
            var labelField = this.settings.get("labelField") || valueField;
            var choices = Array.prototype.slice.call(this.settings.get('choices') || []);

            choices = choices.concat(_.map((data || []), function(row) {
                return {
                    label: row[labelField],
                    value: row[valueField]
                };
            }));

            // De-duplicate values list, as HTML controls don't handle
            // them well.
            var originalChoicesLength = choices.length;
            choices = _.uniq(choices, false, function(i) { return i.value; });
            if (originalChoicesLength != choices.length) {
                this._displayMessage('duplicate');
                console.log("Choice control received search result with duplicate values. Recommend dedupe of data source.");
            }
            return choices;
        },

        _getSelectedData: function() {
            return _.extend(
                BaseInputView.prototype._getSelectedData.call(this), 
                this._selectedDataForValue(this.val())
            );
        },
        
        _selectedDataForValue: function(value){
            var valueField = this.settings.get('valueField') || 'value';
            var selected = _(this._data || []).find(function(d) { return d[valueField] === value; });
            if (selected) {
                var result = {};
                _(selected).each(function(val, key){ result['row.' + key] = val; });
                selected = result;
            }
            return selected;
        },

        _updateView: function(viz, data) {
            if (!this._viz) {
                this._createView(this._displayedChoices); 
                if (!this._viz) {
                    return; 
                }
            }            
            // Create the message area if one does not exist, and clear it.
            if (!this._$messageEl.length) {
                var $messageContainer = $("<div class='splunk-choice-input-message'></div>").appendTo(this.el);
                this._$messageEl = $("<span></span>").appendTo($messageContainer);
            }
            this._$messageEl.text('');
            this._displayedChoices = this.convertDataToChoices(data);
            this.updateView(this._viz, this._displayedChoices);

            // We need to cover two cases, one where value is set first and 
            // choices later, and second when choices are set first and value later.
            // This call covers first case, subscription on value change 
            // in initialize covers second case.
            this.updateSelectedLabel();
            if (!this._hasUserInput && !this._isMultiChoiceView && this.settings.get('selectFirstChoice') && !this._hasInitialValue) {
                var currentVal = this.val();
                var firstValue = _(this._displayedChoices).chain().pluck('value').first().value();
                if (currentVal != firstValue) {
                    this.val(firstValue);
                }
            }
            
            // If there is no data, we disable the input, but if there is,
            // we may still need to disable it.
            if (!this._displayedChoices || this._displayedChoices.length === 0) {
                // We use the raw disable mechanism, because we don't want to
                // change our disabled state.
                this._disable(true);
            }
            else {
                this._onDisable();    
            }
        },

        _findDisplayedChoice: function(value) {
            return _.find(
                this._displayedChoices, 
                function(ch) { return ch.value === value; });
        },

        val: function(newValue) {
            if (arguments.length === 0) {
                return this.settings.get("value");
            }

            if (newValue !== this.settings.get("value")) {
                this.settings.set('value', newValue);
            }
            
            return this.settings.get('value');
        },
        
        /**
         * @returns displayedChoices
         * Retrieves an array of the selected choices and their values in the following format:
         *
         * @example
         *  [
         *      {value: 'val1', label: 'Value 1'},
         *      {value: 'val2', label: 'Value 2'},
         *      ...
         *  ]
         */
        getDisplayedChoices: function() {
            return this._displayedChoices || [];
        }
    });
    
    return BaseChoiceView;
});
