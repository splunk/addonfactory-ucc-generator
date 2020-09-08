define([
            'jquery',
            './Gauge',
            '../../util/lang_utils',
            '../../util/math_utils',
            '../../util/color_utils'
        ], 
        function(
            $,
            Gauge,
            langUtils,
            mathUtils,
            colorUtils
        ) {

    var FillerGauge = function(container, properties) {
        Gauge.call(this, container, properties);
        this.minorsPerMajor = 5;
        this.minorTickWidth = 1;
    };
    langUtils.inherit(FillerGauge, Gauge);

    $.extend(FillerGauge.prototype, {

        processProperties: function() {
            Gauge.prototype.processProperties.call(this);
        },

        onAnimationFinished: function() {
            // no-op for filler gauges
        },

        renderGauge: function() {
            Gauge.prototype.renderGauge.call(this);
            this.tickColor = this.foregroundColor;
            this.tickFontColor = this.fontColor;
            this.defaultValueColor = (this.isShiny) ? 'black' : this.fontColor;
            this.drawBackground();
            this.drawTicks();
            this.drawIndicator(this.value);
        },

        // use the decimal precision of the old and new values to set things up for a smooth animation
        updateValue: function(oldValue, newValue) {
            var oldPrecision = mathUtils.getDecimalPrecision(oldValue, 3),
                newPrecision = mathUtils.getDecimalPrecision(newValue, 3);

            this.valueAnimationPrecision = Math.max(oldPrecision, newPrecision);
            Gauge.prototype.updateValue.call(this, oldValue, newValue);
        },

        getDisplayValue: function(rawVal) {
            // unless this we are displaying a final value, round the value to the animation precision for a smooth transition
            var multiplier = Math.pow(10, this.valueAnimationPrecision);
            return ((rawVal !== this.value) ? (Math.round(rawVal * multiplier) / multiplier) : rawVal);
        },

        updateValueDisplay: function() {
            // no-op, value display is updated as part of drawIndicator
        },

        // filler gauges animate the change in the value display,
        // so they always animate transitions, even when the values are out of range
        shouldAnimateTransition: function() {
            return true;
        },

        getFillColor: function(val) {
            var i;
            for(i = 0; i < this.ranges.length - 2; i++) {
                if(val <= this.ranges[i + 1]) {
                    break;
                }
            }
            return this.getColorByIndex(i);
        },

        // use the value to determine the fill color, then use that color's luminance determine
        // if a light or dark font color should be used
        getValueColor: function(fillColor) {
            var fillColorHex = colorUtils.hexFromColor(fillColor),
                luminanceThreshold = 128,
                darkColor = 'black',
                lightColor = 'white',
                fillLuminance = colorUtils.getLuminance(fillColorHex);

            return (fillLuminance < luminanceThreshold) ? lightColor : darkColor;
        }

    });

    return FillerGauge;
    
});