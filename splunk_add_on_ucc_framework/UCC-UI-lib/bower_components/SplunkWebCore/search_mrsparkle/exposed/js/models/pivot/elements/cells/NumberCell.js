/**
 * @author sfishel
 *
 * A model for an individual number cell pivot element.
 */

define(['jquery', 'splunk.util', '../BaseElement', 'util/pivot/config_form_utils'], function($, splunkUtils, BaseElement, formElementUtils) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * value {String} the calculation used to generate the cell value, allowed options:
         *                   sum, count, avg, max, min, stdev, list, values
         * sparkline {Boolean} whether to render a sparkline
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'cell',
            value: 'sum',
            sparkline: 'false'

        }),

        computeDefaultLabel: function(attributes) {
            return formElementUtils.getCellValueLabel(attributes.displayName, attributes.value);
        },

        parse: function(response) {
            response = $.extend(true, {}, response);
            response.sparkline = response.sparkline ? response.sparkline.toString() : 'false';
            return this.parseLabel(response);
        },

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            return $.extend(json, {
                label: this.getComputedLabel(),
                value: this.get('value'),
                sparkline: splunkUtils.normalizeBoolean(this.get('sparkline'))
            });
        }

    });

});