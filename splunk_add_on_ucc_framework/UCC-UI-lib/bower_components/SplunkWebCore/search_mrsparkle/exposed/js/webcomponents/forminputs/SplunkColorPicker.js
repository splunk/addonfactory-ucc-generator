define([
    'jquery',
    'underscore',
    'backbone',
    './SplunkInputBase',
    'views/shared/controls/ColorPickerControl',
    'util/color_utils',
    'util/validation',
    'splunk/palettes/ColorCodes'
], function($, _, Backbone, InputBase, ColorPickerControl, colorUtils, validationUtils, ColorCodes) {

    var SplunkColorPickerElement = Object.create(InputBase, {

        attachedCallback: {
            value: function() {
                InputBase.attachedCallback.apply(this, arguments);

                var initialColor = colorUtils.replaceSymbols(this.model.get('value'), '0x');
                this.hexColorModel = new Backbone.Model({
                    value: initialColor || '0x000000'
                });

                // base colors from:
                // https://confluence.splunk.com/display/PROD/Color+palettes%2C+chart+lines%2C+and+spacing
                var sequentialBaseColors = [
                    '#1D92C5',
                    '#D6563C',
                    '#6A5C9E',
                    '#31A35F'
                ];

                var splunkPalettes = {
                    'splunkCategorical': ColorCodes.CATEGORICAL.slice(0, 10),
                    'splunkSemantic': ColorCodes.SEMANTIC,
                    'splunkSequential': _.flatten(_.map(sequentialBaseColors, function(startColor) {
                        return [
                            startColor,
                            colorUtils.modifyLuminosityOfHexString(startColor, 1.1),
                            colorUtils.modifyLuminosityOfHexString(startColor, 1.3),
                            colorUtils.modifyLuminosityOfHexString(startColor, 1.5),
                            colorUtils.modifyLuminosityOfHexString(startColor, 1.75)
                        ];
                    })),
                    'custom': []
                };

                var paletteType = $(this).attr('type');

                var customPaletteColors = _.filter(_($(this).find('splunk-color')).map(function(el) {
                    var text = $(el).text();
                    return validationUtils.isValidHexColorString(text) && text;
                }), function(val) {
                    // only truthy values will be included in the final array
                    return val;
                });

                if (!paletteType || !_.has(splunkPalettes, paletteType)) {
                    // non-existing types will fall back to the default type
                    paletteType = 'splunkSemantic';
                }

                this.paletteColors = splunkPalettes[paletteType].concat(customPaletteColors);

                // The color picker control expects colors in hex number format (e.g. 0xff0000),
                // but the mod viz api uses CSS format (e.g. #ff0000), so we create another
                // model and a two-way binding to mediate between the two formats.
                this.hexColorModel.on('change:value', function(model, value) {
                    this.model.set({
                        value: colorUtils.replaceSymbols(value, '#')
                    });
                }, this);

                this.model.on('change:value', function(model, value) {
                    this.hexColorModel.set({
                        value: colorUtils.replaceSymbols(value, '0x')
                    });
                }, this);

                // Assume input base has set up the model
                this.view = new ColorPickerControl({
                    el: this,
                    model: this.hexColorModel,
                    modelAttribute: 'value',
                    paletteColors: this.paletteColors
                });
                this.view.render();
            }
        },

        detachedCallback: {
            value: function() {
                InputBase.detachedCallback.apply(this, arguments);
                this.hexColorModel.off();
                if (this.view) {
                    this.view.remove();
                }
            }
        }

    });

    return document.registerElement('splunk-color-picker', {prototype: SplunkColorPickerElement});

});
