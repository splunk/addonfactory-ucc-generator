define(function(require, exports, module) {

    var $ = require('jquery');
    var _ = require('underscore');
    var i18n = require('splunk.i18n');
    var Leaflet = require('leaflet');
    var Class = require('jg/Class');
    var Pass = require('jg/async/Pass');
    var Color = require('jg/graphics/Color');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var BaseAxis = require('splunk/mapping/axis/BaseAxis');
    var ControlBase = require('splunk/mapping/controls/ControlBase');
    var ColorPalette = require('splunk/palettes/ColorPalette');
    var ListColorPalette = require('splunk/palettes/ListColorPalette');
    var MathUtils = require('util/math_utils');
    var svgUtil = require('util/svg');

    return Class(module.id, ControlBase, function(NumericalLegend, base) {

        // Private Static Constants

        var _LABEL_OFFSET_LEFT = 35;
        var _LABEL_BOTTOM_PADDING = 5;
        var _LABEL_HEIGHT = 16;
        var _LEGEND_LEFT_MARGIN = 12;
        var _PIXEL_PER_CHARACTER_ESTIMATE = 7;
        var _LEGEND_RIGHT_MARGIN = 12;
        var _LABEL_X = 35;
        var _SWATCH_X = 12;
        var _SWATCH_WIDTH = 16;
        var _SWATCH_LABEL_SPACE = _LABEL_X - _SWATCH_X - _SWATCH_WIDTH;
        var _SWATCH_HEIGHT = 12;
        var _LEGEND_SPACING = _LEGEND_LEFT_MARGIN + _SWATCH_WIDTH + _SWATCH_LABEL_SPACE + _LEGEND_RIGHT_MARGIN;
        var _TEXT_HEIGHT = 10;
        var _INITIAL_Y = 20;

        // Public Passes

        this.computeExtendedPass = new Pass('computeExtended', 0.121);

        // Public Properties

        this.axis = new ObservableProperty('axis', BaseAxis, null)
            .onChange(function(e) {
                if (e.target === this) {
                    if (e.oldValue) {
                        e.oldValue.unregister(this);
                    }
                    if (e.newValue) {
                        e.newValue.register(this);
                        this.invalidate('computeExtendedPass');
                    }
                    this.invalidate('renderPass');
                } else if (e.property && (e.property === e.target.containedMinimum || e.property === e.target.containedMaximum)) {
                        this.invalidate('computeExtendedPass');
                } else if (e.property && (e.property === e.target.extendedMinimum || e.property === e.target.extendedMaximum)) {
                        this.invalidate('renderPass');
                }
            });

        this.bins = new ObservableProperty('bins', Number, 5)
            .writeFilter(function(value) {
                return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 1), 9) : 5;
            })
            .onChange(function(e) {
                this.invalidate('computeExtendedPass');
                this.invalidate('renderPass');
            });

        this.neutralPoint = new ObservableProperty('neutralPoint', Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate('computeExtendedPass');
                this.invalidate('renderPass');
            });

        this.colorPalette = new ObservableProperty('colorPalette', ColorPalette, null)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        this.selectedField = new ObservableProperty('selectedField', String, null)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        // Constructor

        this.constructor = function(options) {
            this.leafletOptions = options ? options : {};
            base.constructor.call(this);
        };

        // Public Methods

        this.computeExtended = function() {
            var axis = this.get('axis');
            if (!axis) {
                return;
            }

            var containedMinimum = axis.get('containedMinimum');
            var containedMaximum = axis.get('containedMaximum');
            if (!_.isFinite(containedMinimum) || !_.isFinite(containedMaximum)) {
                axis.provideExtendedRange(this, NaN, NaN);
                return;
            }

            var bins = this.getInternal('bins');
            var neutralPoint = this.getInternal('neutralPoint');
            var useNeutralPoint = !_.isNaN(neutralPoint);
            var axisHasRange = containedMaximum > containedMinimum;
            var containedRange = containedMaximum - containedMinimum;

            var allowedMultipliers = [1, 2, 2.5, 3, 4, 5, 6, 7, 7.5, 8, 9, 10];
            var nearestPowerOfTen, extendedBinSize, bestFitMultiplier;
            if (!axisHasRange) {
                // If the axis has no range (e.g. only one data point), create an artificial bin size based on the
                // nearest power of ten to the data point, unless it's a zero in which case default to 1.
                extendedBinSize = MathUtils.nearestPowerOfTen(containedMinimum || 1);
            } else {
                var rawBinSize = containedRange / bins;
                // Calculate the nearest power of ten that is less than the raw bin size.
                nearestPowerOfTen = MathUtils.nearestPowerOfTen(rawBinSize);
                bestFitMultiplier = _(allowedMultipliers).find(function(multiplier) {
                    return (multiplier * nearestPowerOfTen) >= rawBinSize;
                });
                // Set the extended bin size to the next greatest multiple of that power of ten, starting at the raw bins size.
                extendedBinSize = bestFitMultiplier * nearestPowerOfTen;
            }

            var extendedMinimum, extendedMaximum, halfRange;
            if (!axisHasRange) {
                // If the axis has no range (e.g. only one data point), create an artificial bin size based on the
                // nearest power of ten to the data point, unless it's a zero in which case default to 1.
                halfRange = extendedBinSize * (bins / 2);
                extendedMinimum = containedMinimum - halfRange;
                extendedMaximum = containedMinimum + halfRange;
            } else if (!useNeutralPoint) {
                // Set the extended min to the next lowest multiple of the nearest power of ten, then extrapolate to find the extended max.
                extendedMinimum = Math.floor(containedMinimum / nearestPowerOfTen) * nearestPowerOfTen;
                extendedMaximum = extendedMinimum + (bins * extendedBinSize);

                // By shifting the minimum downward, we might have caused the contained maximum to no longer be in the range.
                // If that is the case, increase the best fit multiplier until the maximum is contained.
                while (extendedMaximum < containedMaximum) {
                    bestFitMultiplier = allowedMultipliers[_(allowedMultipliers).indexOf(bestFitMultiplier) + 1] || bestFitMultiplier + 1;
                    extendedBinSize = bestFitMultiplier * nearestPowerOfTen;
                    extendedMaximum = extendedMinimum + (bins * extendedBinSize);
                }
            } else {
                // Assume here that the choropleth layer's axis range handling routine will have placed the neutral point in the middle of the axis range,
                // this routine needs to make sure that does not change (i.e. if the range is to be extended it should be done symmetrically).
                halfRange = extendedBinSize * (bins / 2);
                extendedMinimum = neutralPoint - halfRange;
                extendedMaximum = neutralPoint + halfRange;
            }
            axis.provideExtendedRange(this, extendedMinimum, extendedMaximum);
        };

        this.render = function() {
            var container = this.leafletControl.getContainer();
            $(container).empty();
            if (!this.getInternal('isVisible')) {
                return;
            }
            var axis = this.get('axis');
            if (axis) {
                var minimum = axis.get('extendedMinimum');
                var maximum = axis.get('extendedMaximum');
                if (minimum !== Infinity && maximum !== -Infinity) {
                    var bins = this.getInternal('bins');
                    var height = _LABEL_HEIGHT*bins + _INITIAL_Y - _SWATCH_HEIGHT + _LABEL_BOTTOM_PADDING;
                    var width = _LEGEND_LEFT_MARGIN;
                    this.svg = svgUtil.createElement('svg').attr('height', height).attr('fill', 'rgba(0,0,0,1)');
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

                    // this is where you take the min and max, divide by the number of bins
                    var binSize = (maximum - minimum)/bins;
                    var colorPalette = this.getInternal('colorPalette');
                    var selectedField = this.getInternal('selectedField');
                    var y, swatchColor, swatchLabel, lower, upper;
                    var longestLabel = '';
                    var paletteSpan = Math.max(bins - 1, 0);
                    var paletteRatio;
                    for (var i = 0; i < bins; i++) {
                        y = _INITIAL_Y + (i*_LABEL_HEIGHT);
                        lower = MathUtils.stripFloatingPointErrors(minimum + i*binSize);
                        upper = MathUtils.stripFloatingPointErrors(lower + binSize);
                        swatchLabel = i18n.format_decimal(lower) + ' - ' + i18n.format_decimal(upper);
                        if (!colorPalette) {
                            swatchColor = new Color();
                        } else {
                            paletteRatio = (paletteSpan > 0) ? (i / paletteSpan) : 0;
                            swatchColor = colorPalette.getItem(paletteRatio, paletteSpan) || new Color();
                        }
                        labelsGroup.append(this._drawRow({ label: swatchLabel, y: y, lower: lower}, selectedField));
                        colorsGroup.append(this._drawColor(y - _TEXT_HEIGHT, swatchColor, lower, selectedField));
                        if (swatchLabel.length > longestLabel.length) {
                            longestLabel = swatchLabel;
                        }
                    }
                    width += _LEGEND_SPACING + longestLabel.length*_PIXEL_PER_CHARACTER_ESTIMATE;
                     $(this.svg).attr('width', width);
                    $(backgroundRect).attr('width', width);
                    this.svg.append(backgroundRect);
                    this.svg.append(labelsGroup);
                    this.svg.append(colorsGroup);
                    $(container).append(this.svg);
                    this._adjustLegend(width);
                }
            }
        };

        /*
         * Only use for testing purposes
         */
        this.getContainer = function() {
            return this.leafletControl.getContainer();
        };

        // Protected Methods

        this.createLeafletControl = function() {
            return new LeafletNumericalLegend(this.leafletOptions);
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
            }
        };

        this._drawRow = function(value, selectedField) {
            var isUnselected = ((selectedField != null) && (selectedField !== ('' + value.lower)));
            var labelGroup,
                labelText;
            labelGroup = svgUtil.createElement('g')
                .attr('class', 'svg-label legend-label legend-elem')
                .data('fieldName', value.lower);
            labelText = svgUtil.createElement('text')
                .attr({
                    y: value.y,
                    x: _LABEL_X
                })
                .attr('fill-opacity', isUnselected ? 0.3 : 1)
                .text(value.label)
                .css({
                    'font-size': '12px',
                    'font-weight': 'regular',
                    'fill': '#333333',
                    'padding-top': '12px',
                    'cursor': 'default'
                });
            labelGroup.append(labelText);
            return labelGroup;
        };

        this._drawColor = function(y, color, fieldName, selectedField) {
            var isUnselected = ((selectedField != null) && (selectedField !== ('' + fieldName)));
            var fillColor = color.toString('rgb');
            var rect = svgUtil.createElement('rect')
                .attr('height', _SWATCH_HEIGHT)
                .attr('width', _SWATCH_WIDTH)
                .attr('y', y)
                .attr('x', _SWATCH_X)
                .attr('fill', isUnselected ? 'rgb(51,51,51)' : fillColor)
                .attr('fill-opacity', isUnselected ? 0.1 : 1)
                .attr('class', 'legend-color legend-elem')
                .data('fieldName', fieldName)
                .attr('stroke', isUnselected ? 'rgb(51,51,51)' : fillColor)
                .attr('stroke-opacity', isUnselected ? 0.1 : 1)
                .css('cursor', 'default');

            if (fillColor === 'rgb(255,255,255)') {
                rect.attr('stroke', 'rgb(204,204,204)');
            }
            return rect;
        };

        // Private Nested Classes

        var LeafletNumericalLegend = Leaflet.Control.extend({

            options: {
                position: 'bottomright'
            },

            initialize: function(options) {
                this.container = Leaflet.DomUtil.create('div', 'legend');
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
