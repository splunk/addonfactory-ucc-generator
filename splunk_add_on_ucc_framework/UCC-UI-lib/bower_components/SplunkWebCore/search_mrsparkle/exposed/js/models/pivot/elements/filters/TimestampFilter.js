/**
 * @author sfishel
 *
 * A model for an individual timestamp filter pivot element.
 */

define(['jquery', '../BaseElement'], function($, BaseElement) {

    return BaseElement.extend({

        /**
         * Attributes
         *
         * (See models/pivot/elements/BaseElement.js for inherited attributes)
         *
         * earliestTime {Epoch Time Value} the earliest time in the time range
         * latestTime {Epoch Time Value} the latest time in the time range
         */

        defaults: $.extend({}, BaseElement.prototype.defaults, {

            elementType: 'filter',
            label: 'All Time'

        }),

        toJSON: function() {
            var json = BaseElement.prototype.toJSON.call(this);
            return $.extend(json, {
                label: this.getComputedLabel(),
                earliestTime: this.get('earliestTime'),
                latestTime: this.get('latestTime')
            });
        },

        setTimeRange: function(timeRangeModel, timePresets) {
            this.timePresets = timePresets;
            this.timeRange = timeRangeModel.clone();
            this.populateFromTimeRange();
            this.timeRange.on('change:earliest change:latest', this.populateFromTimeRange, this);
        },

        clone: function() {
            var clone = BaseElement.prototype.clone.apply(this, arguments);
            if(this.timeRange) {
                clone.setTimeRange(this.timeRange, this.timePresets);
            }
            return clone;
        },

        populateFromTimeRange: function() {
            this.set({
                earliestTime: this.timeRange.get('earliest'),
                latestTime: this.timeRange.get('latest') || '',
                label: this.timeRange.generateLabel(this.timePresets)
            });
        }

    });

});