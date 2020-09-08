/**
 * @author sfishel
 *
 * A model for an individual timestamp column pivot element.
 */

define(['jquery', 'splunk.util', '../BaseElement'], function($, splunkUtils, BaseElement) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * period {String} the time period to use for bucketing, allowed options:
         *                     auto, year, month, day, hour, minute, second
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'column',
            period: 'auto',
            showSummary: 'false'

        }),

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            return $.extend(json, {
                period: this.get('period')
            });
        }

    });

});