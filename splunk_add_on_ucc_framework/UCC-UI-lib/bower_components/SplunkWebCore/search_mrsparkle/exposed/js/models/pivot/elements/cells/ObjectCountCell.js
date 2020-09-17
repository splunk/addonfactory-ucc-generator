/**
 * @author sfishel
 *
 * A model for an individual objectCount cell pivot element.
 */

define(['jquery', 'splunk.util', '../BaseElement', 'util/pivot/config_form_utils'], function($, splunkUtils, BaseElement, formElementUtils) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * sparkline {Boolean} whether to render a sparkline
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'cell',
            sparkline: 'false'

        }),

        computeDefaultLabel: function(attributes) {
            return attributes.displayName;
        },

        parse: function(response) {
            response = $.extend(true, {}, response);
            response.sparkline = response.sparkline ? response.sparkline.toString() : 'false';
            delete response.value;
            return this.parseLabel(response);
        },

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            return $.extend(json, {
                label: this.getComputedLabel(),
                value: 'count',
                sparkline: splunkUtils.normalizeBoolean(this.get('sparkline'))
            });
        }

    });

});