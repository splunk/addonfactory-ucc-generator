/**
 * @author jszeto
 * @date 11/11/14
 *
 * Working model used to store the value for throttling an archive.
 *
 * Attributes:
 * enableThrottling {Boolean} - if true, then show the throttling control
 * maxBandwidth {Number} - number of bits / second of max bandwidth
 *
 */
define([
        'jquery',
        'underscore',
        'models/Base'
    ],
    function(
        $,
        _,
        BaseModel
    ) {

        var MAX_BANDWIDTH = "vix.output.buckets.max.network.bandwidth";

        return BaseModel.extend({

            defaults: {
                "maxBandwidth": undefined,
                "enableThrottling": false
            },

            validation: {
                "maxBandwidth" : 'validateMaxBandwidth'
            },

            validateMaxBandwidth: function(value, attr, computedState) {
                if (computedState.enableThrottling) {
                    if (!_.isNumber(value) || isNaN(value) || value <= 0) {
                        return _("Max Archiving Bandwidth must be a positive number.").t();
                    }
                }
            },

            initializeAttributesFromProvider: function(providerModel) {
                var bandwidthValue = Number(providerModel.get(MAX_BANDWIDTH));
                if (isNaN(bandwidthValue))
                    bandwidthValue = 0;
                var enableThrottling = bandwidthValue != 0;

                this.set({enableThrottling: enableThrottling, maxBandwidth: bandwidthValue});
            },

            getAttributesForProvider: function() {
                var bandwidth = 0;
                if (this.get("enableThrottling")) {
                    bandwidth = this.get("maxBandwidth");
                }

                var returnVal = {};
                returnVal[MAX_BANDWIDTH] = bandwidth;
                return returnVal;
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.call(this, attrs, options);
            }

        });
    });


