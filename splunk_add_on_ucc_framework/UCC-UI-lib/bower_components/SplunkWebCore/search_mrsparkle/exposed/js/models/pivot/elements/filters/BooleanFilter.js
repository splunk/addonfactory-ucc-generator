/**
 * @author sfishel
 *
 * A model for an individual boolean filter pivot element.
 */

define(['jquery', '../BaseElement', 'util/pivot/config_form_utils'], function($, BaseElement, formElementUtils) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * ruleCompareTo {String} the value to compare to, allowed values are: 'true', 'false', 'isNull', and 'isNotNull'
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'filter',
            ruleCompareTo: 'true',
            filterType: 'match'

        }),

        computeDefaultLabel: function(attributes) {
            return formElementUtils.getMatchFilterLabel(attributes.displayName, attributes.ruleCompareTo);
        },

        parse: function(response) {
            response = $.extend(true, {}, response);
            if(response.rule) {
                response.ruleCompareTo = response.rule.compareTo || response.rule.comparator;
                delete response.rule;
            }
            return response;
        },

        // TODO [sff] this is a little weird
        // in the back end comparator / compareTo are mutually exclusive so we are mapping them to one single attribute
        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this),
                compareTo = this.get('ruleCompareTo');

            if(compareTo in { isNull: true, isNotNull: true }) {
                return $.extend(json, { rule: { comparator: compareTo } });
            }
            return $.extend(json, { rule: { comparator: '=', compareTo: compareTo } });
        }

    });

});