/**
 * @author sfishel
 *
 * A model for an individual timestamp cell pivot element.
 */

define(['jquery', '../BaseElement', 'util/pivot/config_form_utils'], function($, BaseElement, formElementUtils) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * value {String} the calculation used to generate the cell value, allowed options:
         *                   duration, earliest, latest, list, listDistinct
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'cell',
            value: 'duration'

        }),

        computeDefaultLabel: function(attributes) {
            if(attributes.value === 'earliest') {
                return 'earliest_time';
            }
            if(attributes.value === 'latest') {
                return 'latest_time';
            }
            return formElementUtils.getCellValueLabel(attributes.displayName, attributes.value);
        },

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            return $.extend(json, {
                label: this.getComputedLabel(),
                value: this.get('value')
            });
        }

    });

});