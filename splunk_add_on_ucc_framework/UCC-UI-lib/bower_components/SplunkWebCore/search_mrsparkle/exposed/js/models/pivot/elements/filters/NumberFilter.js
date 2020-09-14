/**
 * @author sfishel
 *
 * A model for an individual number filter pivot element.
 */

define([
            'jquery',
            'underscore',
            '../BaseElement',
            'util/pivot/config_form_utils'
        ],
        function(
            $,
            _,
            BaseElement,
            formElementUtils
        ) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * filterType {'match' or 'limit'} the type of filter operation
         *
         * For 'match' filter types:
         *
         * ruleComparator {String} the type of filter comparison, allowed values are: =, !=, <=, <, >=, >
         * ruleCompareTo {String} the value to compare to
         *
         * For 'limit' filter types:
         *
         * limitBy {String} the name of the attribute to limit by
         * limitByOwner {String} the owner of the attribute to limit by
         * limitByDisplayName {String} the UI display name for the attribute to limit by
         * limitType {'highest' or 'lowest'} the type of limit operation
         * limitAmount {String, should parse to an integer} the number of results to limit to
         * limitStatsFn {String} the stats function to apply before limiting, possible values depend on the data type of the "limitBy" attribute
         *     for string attributes: count, dc
         *     for numeric attributes: count, dc, sum, avg
         *     for objectCount attributes: count
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'filter',
            filterType: 'match',
            ruleComparator: '=',
            ruleCompareTo: '*',
            limitType: 'highest',
            limitAmount: 10,
            limitStatsFn: 'count'

        }),

        validation: {
            limitAmount: {
                pattern: 'digits',
                min: 1,
                required: true,
                msg: _('Limit Amount must be an integer greater than 1.').t()
            },
            ruleCompareTo: [
                {
                    required: true,
                    msg: _('Match is a required field.').t()
                },
                {
                    fn: 'validateRuleCompareTo'
                }
            ]
        },

        initialize: function() {
            BaseElement.prototype.initialize.call(this);
            if(!this.has('limitBy')) {
                this.set({
                    limitBy: this.get('fieldName'),
                    limitByDataType: this.get('type')
                });
            }
        },

        computeDefaultLabel: function(attributes) {
            if(attributes.filterType === 'match') {
                return formElementUtils.getMatchFilterLabel(attributes.displayName, attributes.ruleComparator, attributes.ruleCompareTo);
            }
            return (attributes.limitBy !== attributes.fieldName) ?
                formElementUtils.getLimitFilterLabel(attributes.displayName, attributes.limitType, attributes.limitAmount, attributes.limitByDisplayName) :
                formElementUtils.getLimitFilterLabel(attributes.displayName, attributes.limitType, attributes.limitAmount);
        },

        parse: function(response) {
            response = $.extend(true, {}, response);
            if(response.rule) {
                response.filterType = 'match';
                response.ruleComparator = response.rule.comparator;
                if(response.rule.compareTo) {
                    response.ruleCompareTo = response.rule.compareTo;
                }
                delete response.rule;
            }
            else if(response.limit) {
                response.filterType = 'limit';
                response.limitBy = response.limit.attributeName;
                response.limitByOwner = response.limit.attributeOwner;
                response.limitType = response.limit.limitType;
                response.limitAmount = response.limit.limitAmount;
                response.limitStatsFn = response.limit.statsFn;
            }
            return response;
        },

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            if(this.get('filterType') === 'match') {
                var ruleComparator = this.get('ruleComparator');
                if(ruleComparator in { isNull: true, isNotNull: true }) {
                    return $.extend(json, {
                        rule: {
                            comparator: ruleComparator
                        }
                    });
                }
                return $.extend(json, {
                    rule: {
                        comparator: ruleComparator,
                        compareTo: this.get('ruleCompareTo')
                    }
                });
            }
            return $.extend(json, {
                limit: {
                    attributeName: this.get('limitBy'),
                    attributeOwner: this.get('limitByOwner'),
                    limitType: this.get('limitType'),
                    limitAmount: this.get('limitAmount'),
                    statsFn: this.get('limitStatsFn')
                }
            });
        },

        validateRuleCompareTo: function(value, attr, computedState) {
            if(computedState.ruleComparator in { '<': true, '>': true, '<=': true, '>=': true } && _.isNaN(parseFloat(value))) {
                return 'Match must be a valid number.';
            }
        }

    });

});