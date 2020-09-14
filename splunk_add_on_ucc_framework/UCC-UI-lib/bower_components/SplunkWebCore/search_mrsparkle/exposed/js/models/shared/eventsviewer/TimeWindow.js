define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'splunk.util',
        'util/math_utils',
        'util/time',
        'strftime'
    ],
    function($, _, BaseModel, splunkUtil, mathUtils, timeutils, strftime) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            defaults: {
                type: 'plusminus',
                amount: 5,
                unit: 's'
            },
            validation: {
                amount: {
                    fn: 'validateAmount'
                } 
            },
            validateAmount: function(value, attr, computedState){
                if (!mathUtils.isInteger(value) || parseFloat(value) <= 0 ) {
                    return _('Value must be an integer greater than 0').t();
                }
            },
            getRanges: function(iso) {
                var ranges = timeutils.rangeFromIsoAndOffset(
                    iso,
                    this.get('unit'),
                    this.get('amount'),
                    this.get('type')
                );
                
                return {
                    //SPL-83689 - must return float to force change of timerange
                    earliestTime: parseFloat(ranges.lowerRange.strftime("%s.%Q")),
                    latestTime: Math.round((parseFloat(ranges.upperRange.strftime("%s.%Q")) + 0.001) * 1000) / 1000
                };
            }
        });
    }
);