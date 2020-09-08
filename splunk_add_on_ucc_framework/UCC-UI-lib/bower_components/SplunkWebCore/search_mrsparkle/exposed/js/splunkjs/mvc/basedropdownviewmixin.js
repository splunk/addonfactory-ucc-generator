define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Select2 = require("select2/select2");
    var userAgent = require("helpers/user_agent");

    // 1. Cannot be empty due to bug in select2-3.4.6:
    //    https://github.com/ivaynberg/select2/pull/2225
    // 2. Should be only whitespace characters to avoid being displayed.
    var PLACEHOLDER_VALUE = ' ';

    var BaseDropdownViewMixin = {
        options: {
            choices: [],
            selectFirstChoice: false,
            width: 200,
            minimumResultsForSearch: 8,
            showClearButton: true, // allow a selection to be cleared from the dropdown itself
            disabled: false,
            allowCustomValues: false
        },

        events: {
            "change input": "onDomChange"
        },

        _setSelect2Value: function(value) {
            // We need to update the select2 control, but to do that
            // properly and handle the cases of value="", we need to compute
            // {id: value, text: label} objects.
            // First, we create these objects for any selected value
            var valueAsArray = this.valueIsList ? value : [value];
            var selectedObject = {};
            _.each(this._vizData, function(row) {
                if (_.contains(valueAsArray, row.value)) {
                    selectedObject[row.value] = $.trim(row.label) || row.value;
                }
            });
            var selectedValues = _(valueAsArray).map(function(val) {
                return {
                    id: val,
                    text: _(selectedObject[val] || val || '').t()
                };
            });

            // Now, we set the value appropriately.
            if (this.valueIsList) {
                this._viz.select2('data', selectedValues);
            }
            else if (!this.valueIsList && selectedValues.length > 0) {
                this._viz.select2('data', selectedValues[0]);
            }
            else {
                this._viz.select2('val', undefined);
            }
        },

        updateDomVal: function() {
            if (this.$('.select2-container.placeholder').length == 0) {
                var value = this.val();

                // Update the raw DOM
                this.$('option:selected').prop('selected', false);
                this._viz.data(value);

                // Update select2
                this._setSelect2Value(value);
                if (this.settings.get('showClearButton')){
                    if (value === undefined){
                        this.$('.select2-container').removeClass('select2-allowclear');
                    } else {
                        this.$('.select2-container').addClass('select2-allowclear');
                    }
                }
            }
        },
        remove: function(){
            $(this._viz).select2("destroy");
        },

        _domVal: function() {
            var value = undefined;
            var valueObject = this._viz.select2('data');

            if(!valueObject) {
                return undefined;
            }

            if (this.valueIsList) {
                if(this.settings.get('allowCustomValues')) {
                    // Find values that have been added to the select but are not in the data and add them
                    var newValues = _.difference(_.pluck(valueObject, 'id'), _.pluck(this._vizData, 'value'));
                    _.each(newValues, function(newVal){
                        this._vizData.push({label: newVal, value: newVal});
                    }, this);
                }

                // Filter out selected choices that aren't valid.
                var valueObjectValid = _.filter(valueObject, function(item) {
                    return item.text !== undefined;
                });
                value = _.pluck(valueObjectValid, 'id');
            }
            else {
                if(this.settings.get('allowCustomValues')) {
                    // Add the value if it is not in the data list
                    if (!_.contains(_.pluck(this._vizData, 'value'), valueObject.id)) {
                        this._vizData.push({label: valueObject.id, value: valueObject.id});
                    }
                }
                // NOTE: (valueObject.text === undefined) detects
                //       a selected choice that isn't in the list of
                //       valid choices.
                value = (valueObject === null || valueObject.text === undefined)
                    ? undefined
                    : valueObject.id;
            }
            return value;
        },

        onDomChange: function(e) {
            this.onUserInput();
            this.val(this._domVal());
        },

        _onDisable: function(e) {
            if (!this._viz) {
                return;
            }

            this._disable(this.settings.get("disabled"));
        },

        _disable: function(state) {
            $(this._viz).select2(state ? "disable" : "enable", true);
        },

        _select2: function(item, options) {
            var that = this;
            var allowCustomValues = that.settings.get('allowCustomValues');
            var selectOptions = _.extend({
                minimumResultsForSearch: parseInt(that.settings.get('minimumResultsForSearch'), 10),
                allowClear: that.settings.get('showClearButton'),
                multiple: that.valueIsList,
                placeholder: PLACEHOLDER_VALUE,
                placeholderOption: 'first', // force first <option/> to be placeholder
                formatResult: function(item, el) {
                    if (item) {
                        var text = _(item.text).t();
                        // Update each row in the open dropdown to have a tooltip
                        el.attr('title', text);
                        text = _.escape(text);
                        // IE-11 crashes when dropdown option ends with - value. Displaying <sup>_</sup> instead of -
                        if (userAgent.isIE11() && text) {
                            text = text.replace(/-$/, "<sup>_</sup>");
                        }
                        return text;
                    } else {
                        return item;
                    }
                },
                formatSelection: function(item, el) {
                    if (item) {
                        // Update the select box itself to have a tooltip
                        el.attr('title', _(item.text).t());
                        return _.escape(_(item.text).t());
                    } else {
                        return item;
                    }
                },
                createSearchChoice: function(term) {
                    return allowCustomValues ? {id: term, text: term} : null;
                },
                data: function() {
                    var results = _.map(that._vizData, function(datum) {
                        return {id:datum.value, text: $.trim(datum.label) || datum.value};
                    });
                    return { results: results };
                }
            }, options || {});
            item.select2("close");
            item.select2(selectOptions);
        },

        createView: function() {
            var select = $(this.selectRoot);
            this.$el.html(select);
            select.width(this.settings.get('width'));
            this._select2(select);
            return select;
        },

        updateView: function(viz, data) {
            viz.empty();
            this._vizData = data;

            if (data.length === 0) {
                this._select2(viz, {placeholder: PLACEHOLDER_VALUE});
                return this;
            }

            var hasOptionMatchingPlaceholder = _.any(data, function(d) {
                return (d.value === PLACEHOLDER_VALUE);
            });

            // Select2 requires an <option/> element to be present
            // if the 'placeholder' and 'allowClear' options are set. We don't
            // want it to clash with any user-specified options, so we give it
            // an alternate value (but no label, so it is still empty from
            // Select2's point of view) if we already have an option that
            // matches the usual placeholder value.
            viz.append($("<option/>").attr("value",
                hasOptionMatchingPlaceholder ? "__placeholder" : PLACEHOLDER_VALUE));

            // Get the actual value of the control
            var controlValue = this.valueIsList ? this.settings.get("value") : [this.settings.get("value")];

            _.each(data, function(row) {
                // Create the <option> tag for this entry and ensure we sync
                // up the display value if it is the currently selected one.
                var option = $("<option/>").text($.trim(row.label) || row.value).attr('value', row.value);
                if (_.contains(controlValue, row.value)) {
                    option.attr('selected', 'selected');
                }
                viz.append(option);
            });

            this.updateDomVal();

            return this;
        }
    };
    return BaseDropdownViewMixin;
});
