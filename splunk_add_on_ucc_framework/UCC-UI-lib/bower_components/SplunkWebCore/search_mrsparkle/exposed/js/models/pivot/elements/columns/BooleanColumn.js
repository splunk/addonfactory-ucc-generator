/**
 * @author sfishel
 *
 * A model for an individual boolean column pivot element.
 */

define(['jquery', 'splunk.util', '../BaseElement', 'util/pivot/config_form_utils'], function($, splunkUtils, BaseElement, formElementUtils) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * trueLabel {String} the user-specified label to apply when the value is true
         * falseLabel {String} the user-specified label to apply when the value is false
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'column',
            trueLabel: '',
            falseLabel: ''

        }),

        /**
         * Returns the default label for when the value is true.
         *
         * @return {String}
         */

        computeDefaultTrueLabel: function(attributes) {
            return formElementUtils.booleanFieldNameLabel(attributes.displayName || attributes.fieldName, true);
        },

        /**
         * Returns the default label for when the value is false.
         *
         * @return {String}
         */

        computeDefaultFalseLabel: function(attributes) {
            return formElementUtils.booleanFieldNameLabel(attributes.displayName || attributes.fieldName, false);
        },

        refreshLabel: function(options) {
            // TODO [sff] kind of a bummer that this will set multiple times
            BaseElement.prototype.refreshLabel.apply(this, arguments);
            var setObject = {};
            if(this.get('trueLabel') === this.computeDefaultTrueLabel(this.attributes)) {
                setObject.trueLabel = '';
            }
            if(this.get('falseLabel') === this.computeDefaultFalseLabel(this.attributes)) {
                setObject.falseLabel = '';
            }
            this.set(setObject, options);
        },

        parse: function(response) {
            response = $.extend(true, {}, response);
            if(response.trueLabel === this.computeDefaultTrueLabel(response)) {
                response.trueLabel = '';
            }
            if(response.falseLabel === this.computeDefaultFalseLabel(response)) {
                response.falseLabel = '';
            }
            return response;
        },

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            return $.extend(json, {
                trueLabel: this.get('trueLabel') || this.computeDefaultTrueLabel(this.attributes),
                falseLabel: this.get('falseLabel') || this.computeDefaultFalseLabel(this.attributes)
            });
        }

    });

});