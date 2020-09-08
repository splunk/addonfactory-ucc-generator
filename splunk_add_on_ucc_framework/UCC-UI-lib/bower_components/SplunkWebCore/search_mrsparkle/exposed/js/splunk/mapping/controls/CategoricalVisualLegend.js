define(function(require, exports, module) {

    var $ = require('jquery');
    var Leaflet = require('leaflet');
    var Class = require('jg/Class');
    var Color = require('jg/graphics/Color');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var Legend = require('splunk/charting/Legend');
    var ControlBase = require('splunk/mapping/controls/ControlBase');
    var ColorPalette = require('splunk/palettes/ColorPalette');
    var svgUtil = require('util/svg');

    return Class(module.id, ControlBase, function(CategoricalVisualLegend, base) {

        // Private Static Constants

        var _LABEL_HEIGHT = 16;
        var _LABEL_BOTTOM_PADDING = 5;
        var _LEGEND_BOTTOM_PADDING = 15;
        var _LEGEND_LEFT_MARGIN = 12;
        var _PIXEL_PER_CHARACTER_ESTIMATE = 7;
        var _LEGEND_RIGHT_MARGIN = 12;
        var _LABEL_X = 35;
        var _SWATCH_X = 12;
        var _SWATCH_WIDTH = 16;
        var _SWATCH_LABEL_SPACE = _LABEL_X - _SWATCH_X - _SWATCH_WIDTH;
        var _SWATCH_HEIGHT = 12;
        var _LEGEND_SPACING = _LEGEND_LEFT_MARGIN + _SWATCH_WIDTH + _SWATCH_LABEL_SPACE + _LEGEND_RIGHT_MARGIN;
        var _LABEL_OFFSET_LEFT = 50;
        var _TEXT_HEIGHT = 10;
        var _INITIAL_Y = 20;
        var _LEGEND_MAX_HEIGHT = 200 - _LEGEND_BOTTOM_PADDING - _INITIAL_Y;

        // Public Properties

        this.colorPalette = new ObservableProperty('colorPalette', ColorPalette, null)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        this.legend = new ObservableProperty('legend', Legend, null)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        this.maxHeight = new ObservableProperty('maxHeight', Number, Infinity)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        this.clip = new ObservableProperty('clip', Boolean, false)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        this.selectedField = new ObservableProperty('selectedField', String, null)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        // Public Methods

        this.render = function() {
            var container = this.leafletControl.getContainer();
            $(container).empty();
            if (!this.getInternal('isVisible')) {
                return;
            }
            var legend = this.getInternal('legend'),
                labels = [];
            if (legend) {
                labels = legend.get('actualLabels');
            }
            if (labels && labels.length > 0) {
                var height = _LABEL_HEIGHT*labels.length + _INITIAL_Y - _SWATCH_HEIGHT + _LABEL_BOTTOM_PADDING;
                height = Math.min(height, this.getInternal('maxHeight') - _INITIAL_Y - _LABEL_BOTTOM_PADDING);
                this.svg = svgUtil.createElement('svg').attr('height', height);
                var labelsGroup = svgUtil.createElement('g')
                    .attr('class', 'svg-labels')
                    .attr('height', height);
                var colorsGroup = svgUtil.createElement('g')
                    .attr('class', 'svg-colors');
                var backgroundRect = svgUtil.createElement('rect')
                    .attr('class', 'background')
                    .attr('height', height)
                    .attr('fill', 'rgb(255,255,255)')
                    .attr('fill-opacity', '0.75');

                if (this.getInternal('clip')) {
                    this.svg.append('\
                        <defs>\
                            <clipPath id="choropleth-legend-clip">\
                                <rect class="clip" x="0" y="0"></rect>\
                            </clipPath>\
                        </defs>');
                    this.svg.find('.clip').attr('height', height);
                    labelsGroup.attr('clip-path', 'url(#choropleth-legend-clip)');
                    colorsGroup.attr('clip-path', 'url(#choropleth-legend-clip)');
                }

                var selectedField = this.getInternal('selectedField');
                var width = _LEGEND_LEFT_MARGIN;
                var longestLabel = '';
                for (var i = 0; i < labels.length; i++) {
                    if (i == 0) {
                        longestLabel = labels[i];
                    }
                    if (labels[i].length > longestLabel.length) {
                        longestLabel = labels[i];
                    }
                    var y =  _INITIAL_Y + i*(_LABEL_HEIGHT);
                    labelsGroup.append(this._drawRow({label: labels[i], y: y}, selectedField));
                    colorsGroup.append(this._drawColor(y - _TEXT_HEIGHT, i, labels[i], selectedField));
                }
                width += _LEGEND_SPACING + longestLabel.length* _PIXEL_PER_CHARACTER_ESTIMATE;
                $(this.svg).attr('width', width);
                $(backgroundRect).attr('width', width);
                if (height > _LEGEND_MAX_HEIGHT) {
                    $(container).css('overflow-y', 'scroll');
                    $(container).css('overflow-x', 'hidden');
                    $(container).css('height', _LEGEND_MAX_HEIGHT);
                }
                this.svg.append(backgroundRect);
                this.svg.append(labelsGroup);
                this.svg.append(colorsGroup);
                $(container).append(this.svg);
                this._adjustLegend();
            }
        };

        /*
         * only for testing
         */
        this.getContainer = function() {
            return this.leafletControl.getContainer();
        };

        // Protected Methods

        this.createLeafletControl = function() {
            return new LeafletCategoricalLegend(this.leafletOptions);
        };

        // Private Methods

        /*
         * For interoperability with the PDF renderer, all measurements must be made by
         * calling getBBox() on a <text> element.
         */
        this._adjustLegend = function() {
            var labels = $(this.svg[0]).find('.svg-label text');
            var longestLabelElem = labels[0];
            var longestLabelWidth = 0;
            for (var i = 0; i < labels.length; i++) {
                if (labels[i].getBBox().width > longestLabelWidth) {
                    longestLabelElem = labels[i];
                    longestLabelWidth = longestLabelElem.getBBox().width;
                }
            }
            if (longestLabelElem) {
                var newWidth = _LEGEND_SPACING + longestLabelWidth;
                $(this.svg).attr('width', newWidth);
                $(this.svg).find('.background').attr('width', newWidth);
                if (this.getInternal('clip')) {
                    this.svg.find('.clip').attr('width', newWidth);
                }
            }
        };

        this._drawColor = function(y, i, label, selectedField) {
            var isUnselected = ((selectedField != null) && (selectedField !== ('' + label)));
            var legend = this.getInternal('legend');
            if (!legend) {
                return;
            }
            var colorPalette = this.getInternal('colorPalette');
            var color = 'rgb(0,0,0)';
            if (colorPalette) {
                var paletteSpan = Math.max(legend.getNumLabels() - 1, 0);
                var paletteRatio = (paletteSpan > 0) ? (legend.getLabelIndex(label) / paletteSpan) : 0;
                color = (colorPalette.getItem(paletteRatio, paletteSpan, label) || new Color()).toString('rgb');
            }
            var rect = svgUtil.createElement('rect')
                .attr('height', _SWATCH_HEIGHT)
                .attr('width', _SWATCH_WIDTH)
                .attr('y', y)
                .attr('x', _SWATCH_X)
                .attr('class', 'legend-color legend-elem')
                .attr('stroke', isUnselected ? 'rgb(51,51,51)' : color)
                .attr('stroke-opacity', isUnselected ? 0.1 : 1)
                .attr('fill', isUnselected ? 'rgb(51,51,51)' : color)
                .attr('fill-opacity', isUnselected ? 0.1 : 1)
                .data('fieldName', label)
                .css('cursor', 'default');
            if (color === 'rgb(255,255,255)') {
                rect.attr('stroke', 'rgb(204,204,204)');
            }
            return rect;
        };

        this._drawRow = function(value, selectedField) {
            var isUnselected = ((selectedField != null) && (selectedField !== ('' + value.label)));
            var labelGroup,
                labelText;
            labelGroup = svgUtil.createElement('g')
                .attr('class', 'svg-label legend-label legend-elem')
                .data('fieldName', value.label);
            labelText = svgUtil.createElement('text')
                .attr({
                    y: value.y,
                    x: _LABEL_X
                })
                .attr('fill-opacity', isUnselected ? 0.3 : 1)
                .text(value.label)
                .css({
                    'font-size': '12px',
                    'fill': '#333333',
                    'font-weight': 'regular',
                    'padding-top': '12px',
                    'cursor': 'default'
                });
            labelGroup.append(labelText);
            return labelGroup;
        };

        // Private Nested Classes

        var LeafletCategoricalLegend = Leaflet.Control.extend({

            options: {
                position: 'bottomright'
            },

            initialize: function(options) {
                this.container = Leaflet.DomUtil.create('div', 'legend');
                Leaflet.DomEvent.disableClickPropagation(this.container);
                // The pointer-events style from Leaflet's CSS needs to be overridden
                // or the legend will ignore mouse events (SPL-105109).
                $(this.container).css('pointer-events', 'visiblepainted');
            },

            onAdd: function(map) {
                return this.container;
            },

            getContainer: function() {
                return this.container;
            }

        });

    });

});
