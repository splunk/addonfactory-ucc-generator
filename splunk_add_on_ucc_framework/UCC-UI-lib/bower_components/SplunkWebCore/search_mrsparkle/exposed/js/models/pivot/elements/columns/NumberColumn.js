/**
 * @author sfishel
 *
 * A model for an individual number column pivot element.
 */

define([
            'jquery',
            'underscore',
            'splunk.util',
            '../BaseElement'
        ],
        function(
            $,
            _,
            splunkUtils,
            BaseElement
        ) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * display {String} the display mode, allowed options: all, ranges
         * maxNumRanges {String} the maximum number of ranges to display, must parse to a positive integer
         * rangeSize {String} the size of each range, must parse to a positive number
         * rangeStart {String} the start value for the ranges, must parse to a number
         * rangeEnd {String} the end value for the ranges, must parse to a number
         * limitAmount {String, should parse to an integer} the number of results to limit to
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'column',
            display: 'ranges'

        }),

        validation: {
            maxNumRanges: {
                pattern: 'digits',
                min: 2,
                required: false,
                msg: _('Max # of Ranges must be an integer greater than 1.').t()
            },
            rangeSize: {
                pattern: 'number',
                min: Number.MIN_VALUE,
                required: false,
                msg: _('Range Size must be a positive number.').t()
            },
            rangeStart: {
                pattern: 'number',
                required: false,
                msg: _('Range Start must be a number.').t()
            },
            rangeEnd: {
                pattern: 'number',
                required: false,
                msg: _('Range End must be a number.').t()
            }
        },

        parse: function(response) {
            response = $.extend(true, {}, response);
            var ranges = response.ranges;
            if(response.ranges) {
                response.maxNumRanges = ranges.hasOwnProperty('maxNumberOf') ? ranges.maxNumberOf.toString() : undefined;
                response.rangeSize = ranges.hasOwnProperty('size') ? ranges.size.toString() : undefined;
                response.rangeStart = ranges.hasOwnProperty('start') ? ranges.start.toString() : undefined;
                response.rangeEnd = ranges.hasOwnProperty('end') ? ranges.end.toString() : undefined;
                delete response.ranges;
            }
            return response;
        },

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            json.display = this.get('display');
            if(json.display === 'ranges') {
                json.ranges = {
                    maxNumberOf: (this.has('maxNumRanges') && this.get('maxNumRanges') !== '') ?
                            this.get('maxNumRanges') : undefined,
                    size: (this.has('rangeSize') && this.get('rangeSize') !== '') ?
                            this.get('rangeSize') : undefined,
                    start: (this.has('rangeStart') && this.get('rangeStart') !== '') ?
                            this.get('rangeStart') : undefined,
                    end: (this.has('rangeEnd') && this.get('rangeEnd') !== '') ?
                            this.get('rangeEnd') : undefined
                };
            }
            return json;
        }

    });

});
