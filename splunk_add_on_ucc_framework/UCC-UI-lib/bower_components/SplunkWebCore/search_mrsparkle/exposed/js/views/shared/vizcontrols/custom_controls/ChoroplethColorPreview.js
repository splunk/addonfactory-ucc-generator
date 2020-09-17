define([
            'module',
            'underscore',
            'views/Base',
            'util/color_utils'
        ],
        function(
            module,
            _,
            Base,
            colorUtils
        ) {

    return Base.extend({

        moduleId: module.id,

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.$el.addClass('choropleth-color-preview');
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            var binColors;
            var colorMode = this.model.get('display.visualizations.mapping.choroplethLayer.colorMode');
            if (colorMode === 'auto') {
                colorMode = this.model.get('autoDetectedColorMode');
            }
            if (colorMode === 'categorical') {
                binColors = [0x1e93c6, 0xf2b827, 0xd6563c, 0x6a5c9e, 0x31a35f];
            } else {
                var numBins = parseInt(this.model.get('display.visualizations.mapping.choroplethLayer.colorBins'), 10);
                var maxColor = parseInt(this.model.get('display.visualizations.mapping.choroplethLayer.maximumColor'), 16);
                var minColor = parseInt(this.model.get('display.visualizations.mapping.choroplethLayer.minimumColor'), 16);
                var hasDivergentColors = (colorMode === 'divergent');
                var middleColor = 0xffffff;
                binColors = this._getBinColors(numBins, hasDivergentColors ? [minColor, middleColor, maxColor] : [middleColor, maxColor]);
            }
            this.$el.html(this.compiledTemplate({
                binColors: _(binColors).map(function(hexNum) {
                    var hexString = hexNum.toString(16);
                    while (hexString.length < 6) {
                        hexString = '0' + hexString;
                    }
                    return '#' + hexString;
                })
            }));
            return this;
        },

        // Based on the number of bins in use, and the current color palette, return a list of colors with length
        // equal to the number of bins, which serves as a preview of the color scheme that the choropleth will use.
        _getBinColors: function(numBins, colors) {
            var binColors = [];
            for(var i = 0; i < numBins; i++) {
                if (colors.length === 2) {
                    // Only two colors means a sequential color mode, so simple linear interpolation works.
                    binColors.push(colorUtils.interpolateColors(colors[0], colors[1], i / (numBins - 1)));
                } else {
                    // With three colors, a divergent color mode is in use, so bins below the middle should be interpolated
                    // between the first and second colors, and bins above the middle should be interpolated between the second
                    // and third color.
                    var middleIndex = (numBins / 2) - 0.5;
                    if (i < middleIndex) {
                        binColors.push(colorUtils.interpolateColors(colors[0], colors[1], i / Math.ceil(middleIndex)));
                    }
                    else {
                        binColors.push(colorUtils.interpolateColors(colors[1], colors[2], (i - Math.floor(middleIndex)) / Math.ceil(middleIndex)));
                    }
                }
            }
            return binColors;
        },

        template: '\
            <label class="control-label"><%- _("Preview").t() %></label>\
            <div class="color-bin-container">\
                <% _(binColors).each(function(color) { %>\
                    <% var borderColor = color === "#ffffff" ? "#cccccc": color %>\
                    <div class="color-bin" style="background-color: <%- color %>; border-color: <%- borderColor %>"></div>\
                <% }) %>\
            </div>\
        '

    });

});