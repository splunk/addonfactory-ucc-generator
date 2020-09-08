define([
            'jquery',
            './Gauge',
            '../../util/lang_utils'
        ],
        function(
            $,
            Gauge,
            langUtils
        ) {

    var MarkerGauge = function(container, properties) {
        Gauge.call(this, container, properties);
        this.bandCornerRad = 0;
        this.tickLabelPaddingRight = 10;
        this.minorsPerMajor = 5;
        this.minorTickWidth = 1;
        this.tickWidth = 1;
    };
    langUtils.inherit(MarkerGauge, Gauge);

    $.extend(MarkerGauge.prototype, {

        showValueByDefault: false,

        renderGauge: function() {
            Gauge.prototype.renderGauge.call(this);
            this.tickColor = (this.isShiny) ? 'black' : this.foregroundColor;
            this.tickFontColor = (this.isShiny) ? 'black' : this.fontColor;
            this.valueOffset = (this.isShiny) ? this.markerSideWidth + 10 : this.valueFontSize;
            this.drawBackground();
            if(this.showRangeBand) {
                this.drawBand();
            }
            this.drawTicks();
            this.drawIndicator(this.value);
            this.checkOutOfRange(this.value);
        },

        updateValueDisplay: function() {
            // no-op, value display is updated as part of drawIndicator
        }

    });

    return MarkerGauge;

});