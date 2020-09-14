define(['underscore', 'jquery', 'util/general_utils'], function(_, $, GeneralUtils) {
    "use strict";

    /* Generic utility to read and write values to and from a HTML form */

    var CUSTOM_FORM_ELEMENT_SELECTOR = 'splunk-select, splunk-text-input, splunk-text-area, splunk-radio-input, splunk-color-picker, splunk-search-dropdown';

    function getFormElements(formEl) {
        return $(formEl).find(CUSTOM_FORM_ELEMENT_SELECTOR).add($(formEl).prop('elements'));
    }

    var defaultOptions = {
        /**
         * Option to auto-detect and handle checkboxes with boolean values and have them return '0' or '1'
         */
        autoBooleanCheckbox: true
    };

    /**
     * Read the current state of the HTML form and return an object containing key-value pairs of HTML input controls
     * (from name attribute) and their corresponding value.
     *
     * This roughly follows the browser data binding/serialization semantics of browsers when submitting regular
     * HTML forms.
     *
     * @param formEl - the HTML form DOM node
     * @param {Object} options - control certain aspects of reading the input values
     * @returns {Object} data
     */
    function readFormValues(formEl, options) {
        options = _.extend({}, defaultOptions, options);
        var data = {};

        _(getFormElements(formEl)).each(function(input) {
            var $input = $(input);
            var name = $input.attr('name');
            if (name != null) {
                var type = $input.attr('type');
                var value;
                if (/checkbox/i.test(type)) {
                    var checkboxValue = $input.attr('value');
                    if (options.autoBooleanCheckbox && GeneralUtils.normalizeBoolean(checkboxValue) === true) {
                        // If the checkbox value is a boolean-equivalent value (1, true, yes, on), the we're 
                        // reading/writing the value as 1/0; otherwise we apply the actual value if the checkbox 
                        // is checked and remove the value altogether if the
                        value = input.checked ? '1' : '0';
                    } else {
                        value = input.checked ? checkboxValue : undefined;
                    }
                } else if (/radio/i.test(type)) {
                    if (input.checked) {
                        value = $input.attr('value');
                    }
                } else if ($input.is(CUSTOM_FORM_ELEMENT_SELECTOR)) {
                    value = $input.attr('value');
                } else {
                    value = $input.val();
                }
                if (value !== undefined) {
                    data[name] = value;
                }
            }
        });
        return data;
    }

    /**
     * Apply the given data (object containing key-value pairs) to the HTML input controls in the given form.
     *
     * @param formEl - the HTML form DOM node
     * @param {Object} data - data to apply, keys and values are supposed to be strings
     * @param {Object} options - control certain aspects of applying the input values
     */
    function applyFormValues(formEl, data, options) {
        options = _.extend({}, defaultOptions, options || {});

        _(getFormElements(formEl)).each(function(input) {
            var $input = $(input);
            var name = $input.attr('name');
            var value = data[name];
            if (value !== undefined) {
                var type = $input.attr('type');
                if (/checkbox/i.test(type)) {
                    var checkboxValue = $input.attr('value');
                    // If the checkbox value is a boolean-equivalent value (1, true, yes, on), the we're 
                    // reading/writing the value as 1/0; otherwise we apply the actual value if the checkbox 
                    // is checked and remove the value altogether if the
                    if (options.autoBooleanCheckbox && GeneralUtils.normalizeBoolean(checkboxValue) === true) {
                        input.checked = GeneralUtils.normalizeBoolean(value);
                    } else {
                        input.checked = value == checkboxValue;
                    }
                } else if (/radio/i.test(type)) {
                    input.checked = value == $input.attr('value');
                } else if ($input.is(CUSTOM_FORM_ELEMENT_SELECTOR)) {
                    $input.attr('value', value);
                } else {
                    $input.val(value);
                }
            }
        });
    }


    return {
        readFormValues: readFormValues,
        applyFormValues: applyFormValues
    };
});