define([
    'lodash',
    'jquery',
    'views/shared/controls/Control',
    'select2/select2'
], function (
    _,
    $,
    Control
) {
    return Control.extend({
        /**
         * @constructor
         * @param {Object} options {
         *     {String, required} modelAttribute The attribute on the model to observe and update on selection
         *     {Model, required} model The model to operate on
         *     {String, optional} placeholder The placeholder text for an empty input
         *     {Array<String>, optional} autoCompleteFields A list of fields to use for auto-complete,
         *     {Array<String>, optional} unselectableFields A list of disabled fields
         *     {String, optional} inputClassName A class name to apply to the input element
         *     {Function, optional} tooltip A function to add tooltip on items based on rules
         */
        initialize: function (options) {
            Control.prototype.initialize.apply(this, arguments);

            this.options.placeholder = options.placeholder || "Select a value";
            this.placeholder = this.options.placeholder;
            this.modelAttribute = options.modelAttribute;
            this.allowClear = options.allowClear ? true : false;
            if (options.allowClear === undefined || !!options.allowClear) {
                this.allowClear = true;
            } else {
                this.allowClear = false;
            }
        },

        render: function () {
            var data, options, $input, tooltipFun;
            if (this.$('input')) {
                this.$('input').select2('destroy');
            }

            this.$el.html(this.compiledTemplate({options: this.options}));
            $input = this.$('input');

            if (this.options.unselectableFields) {
                _.each(this.options.autoCompleteFields, field => {
                    if (_.find(this.options.unselectableFields, unselectable => {
                            return (unselectable.value === field.value) &&
                                (unselectable.label === field.label);
                        })) {
                        field.disabled = true;
                    } else {
                        field.disabled = false;
                    }
                });
            }

            data = [];
            _.each(this.options.autoCompleteFields, field => {
                if (field.children && field.label) {
                    data.push({
                        text : _(field.label).t(),
                        children : _.map(field.children, child => ({
                            id : child.value,
                            text : _(child.label).t()
                        }))
                    });
                }
                if (field.value && field.label){
                    data.push({
                        id: field.value,
                        text: _(field.label).t(),
                        disabled: field.disabled
                    });
                }
            });

            options = {
                placeholder: this.options.placeholder,
                data: data,
                formatNoMatches: function () {
                    return '&nbsp;';
                },
                dropdownCssClass: 'empty-results-allowed',
                // SPL-77050, this needs to be false for use inside popdowns/modals
                openOnEnter: false,
                multiple: false,
                combobox: true,
                allowClear: this.allowClear
            };
            if (this.options.createSearchChoice) {
                $.extend(options, {
                    createSearchChoice: function (term, data) {
                        if ($(data).filter(function () {
                                return this.text.localeCompare(term) === 0;
                            }).length === 0) {
                            return {id: term, text: term};
                        }
                    }
                });
            }

            if (this.options.disableSearch) {
                $.extend(options, {minimumResultsForSearch: Infinity});
            }
            $input.select2(options).select2('val', this._value || '');
            if (this.options.disabled) {
                this.disable();
            }

            // add tooltip in case
            if (typeof this.options.tooltip === "function") {
                tooltipFun = this.options.tooltip;
                $input.on("select2-open", function () {
                    _.each($('li.select2-result'), function (ele) {
                        tooltipFun(ele);
                    });
                });
            }

            // Add id attribute to select2 control
            if (this.options.elementId) {
                this.$(".select2-choice").attr("id", this.options.elementId);
            }

            $input.on("change", function (e) {
                if (this.options.model && this.options.modelAttribute) {
                    if (!this.options.autoCompleteFields.some((field) => {
                        if (field.children) {
                            return field.children.some((child) => {
                                return child.value === e.val;
                            });
                        }
                        return field.value === e.val;
                    })) {
                        this.options.autoCompleteFields.push({
                            label: e.val,
                            value: e.val
                        });
                    }
                    this.setValue(e.val, false);
                }
            }.bind(this));
            return this;
        },

        setAutoCompleteFields: function (fields, render, unselectableFields) {
            render = render !== null ? render : true;
            if (fields !== null) {
                this.options.autoCompleteFields = fields;
            }

            // Peter: add unselectable fields support. This parameter can be null
            // when it is set, all matched item in autoCompleteFields will be disabled
            if (unselectableFields) {
                this.options.unselectableFields = unselectableFields;
            }

            if (render) {
                // enable and render
                this.enable(false);
                this.render();
            }
        },

        remove: function () {
            this.$('input').select2('close').select2('destroy');
            return Control.prototype.remove.apply(this, arguments);
        },

        validate: function () {
            return this.getValue() !== null &&
                this.$('input').select2('val').length > 0 &&
                this.getValue() === this.$('input').select2('val') &&
                !this.options.disabled;
        },

        disable: function () {
            this.options.disabled = true;
            this.$('input').prop('disabled', true);
        },

        startLoading: function () {
            this.options.placeholder = 'Loading ...';
            this.disable();
            this.render();
        },

        enable: function (render) {
            if (this.options.placeholder !== this.placeholder) {
                this.options.placeholder = this.placeholder;
                if (render) {
                    this.render();
                }
            }
            this.options.disabled = false;
            this.$('input').prop('disabled', false);
        },

        template: '<input type="hidden" class="<%- options.inputClassName %>">'
    });
});
