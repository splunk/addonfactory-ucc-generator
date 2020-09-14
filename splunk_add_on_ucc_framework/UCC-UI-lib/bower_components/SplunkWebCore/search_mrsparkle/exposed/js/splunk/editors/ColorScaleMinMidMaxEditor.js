define(function(require, exports, module) {

    var $ = require('jquery');
    var _ = require("underscore");
    var Class = require("jg/Class");
    var CSS = require("jg/CSS");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var StringUtil = require("jg/utils/StringUtil");
    var Element = require("splunk/display/Element");
    var ColorEditor = require("splunk/editors/ColorEditor");
    var Editor = require("splunk/editors/Editor");
    var EditorAlert = require("splunk/editors/EditorAlert");
    var EditorLabel = require("splunk/editors/EditorLabel");
    var EnumEditor = require("splunk/editors/EnumEditor");
    var SimpleTypeEditor = require("splunk/editors/SimpleTypeEditor");
    var MinMidMaxColorPalette = require("splunk/palettes/MinMidMaxColorPalette");
    var HStackPanel = require("splunk/panels/HStackPanel");
    var MinMidMaxScale = require("splunk/scales/MinMidMaxScale");
    var SVGUtils = require("svg/SVGUtils");
    var PopTart = require("views/shared/PopTart");

    var SEQUENTIAL1SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/sequential-1.svg"));
    var SEQUENTIAL2SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/sequential-2.svg"));
    var SEQUENTIAL3SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/sequential-3.svg"));
    var SEQUENTIAL4SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/sequential-4.svg"));
    var SEQUENTIAL5SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/sequential-5.svg"));
    var SEQUENTIAL6SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/sequential-6.svg"));
    var DIVERGENT1SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/divergent-1.svg"));
    var DIVERGENT2SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/divergent-2.svg"));
    var DIVERGENT3SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/divergent-3.svg"));
    var DIVERGENT4SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/divergent-4.svg"));
    var DIVERGENT5SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/divergent-5.svg"));
    var DIVERGENT6SVG = SVGUtils.strip(require("contrib/text!splunk/editors/assets/divergent-6.svg"));

    require("./ColorScaleMinMidMaxEditor.pcss");

    return Class(module.id, Editor, function(ColorScaleMinMidMaxEditor, base) {

        // Private Static Properties

        var _PRESETS_MAP = {
            'sequential1': {
                minColor: Color.fromString('#ffffff'),
                maxColor: Color.fromString('#31a35f'),
                svg: SEQUENTIAL1SVG
            },
            'sequential2': {
                minColor: Color.fromString('#31a35f'),
                maxColor: Color.fromString('#ffffff'),
                svg: SEQUENTIAL2SVG
            },
            'sequential3': {
                minColor: Color.fromString('#ffffff'),
                maxColor: Color.fromString('#d6563c'),
                svg: SEQUENTIAL3SVG
            },
            'sequential4': {
                minColor: Color.fromString('#d6563c'),
                maxColor: Color.fromString('#ffffff'),
                svg: SEQUENTIAL4SVG
            },
            'sequential5': {
                minColor: Color.fromString('#ffffff'),
                maxColor: Color.fromString('#1e93c6'),
                svg: SEQUENTIAL5SVG
            },
            'sequential6': {
                minColor: Color.fromString('#1e93c6'),
                maxColor: Color.fromString('#ffffff'),
                svg: SEQUENTIAL6SVG
            },
            'divergent1': {
                minColor: Color.fromString('#1e93c6'),
                maxColor: Color.fromString('#d6563c'),
                svg: DIVERGENT1SVG
            },
            'divergent2': {
                minColor: Color.fromString('#31a35f'),
                maxColor: Color.fromString('#d6563c'),
                svg: DIVERGENT2SVG
            },
            'divergent3': {
                minColor: Color.fromString('#cc5068'),
                maxColor: Color.fromString('#f2b827'),
                svg: DIVERGENT3SVG
            },
            'divergent4': {
                minColor: Color.fromString('#49443b'),
                maxColor: Color.fromString('#31a35f'),
                svg: DIVERGENT4SVG
            },
            'divergent5': {
                minColor: Color.fromString('#ed8440'),
                maxColor: Color.fromString('#6a5c9e'),
                svg: DIVERGENT5SVG
            },
            'divergent6': {
                minColor: Color.fromString('#3863a0'),
                maxColor: Color.fromString('#a2cc3e'),
                svg: DIVERGENT6SVG
            }
        };

        // Public Properties

        this.scale = new ObservableProperty("scale", MinMidMaxScale, null)
            .onChange(function(e) {
                if ((e.event !== e.target.valueMapChange) && (e.event !== e.target.scaleMapChange)) {
                    this.invalidate("renderInputPass");
                }
            });

        this.colorPalette = new ObservableProperty("colorPalette", MinMidMaxColorPalette, null)
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        // Private Properties

        this._errorMessage = null;
        this._presetsRow = null;
        this._minRow = null;
        this._midRow = null;
        this._maxRow = null;
        //this._binRow = null;

        // Protected Methods

        this.setupOverride = function() {

            this._presetsRow = new PresetsRow(this);
            this._minRow = new ColorRow(this, "min", _("Minimum").t(), _("Lowest Value").t());
            this._midRow = new ColorRow(this, "mid", _("Midpoint").t(), _("None").t());
            this._maxRow = new ColorRow(this, "max", _("Maximum").t(), _("Highest Value").t());
            //this._binRow = new BinRow(this);

            this.addChild(this._presetsRow);
            this.addChild(this._minRow);
            this.addChild(this._midRow);
            this.addChild(this._maxRow);
            //this.addChild(this._binRow);
        };

        this.renderInputOverride = function() {
            var scale = this.getInternal("scale");
            var colorPalette = this.getInternal("colorPalette");

            this._presetsRow.renderInput(scale, colorPalette);
            this._minRow.renderInput(scale, colorPalette);
            this._midRow.renderInput(scale, colorPalette);
            this._maxRow.renderInput(scale, colorPalette);
            //this._binRow.renderInput(colorPalette);

            var hasError = this._minRow.hasError() || this._midRow.hasError() || this._maxRow.hasError();
            if (hasError && !this._errorMessage) {
                this._errorMessage = new EditorAlert("error", _("Scale values must be entered from lowest to highest.").t());
                this.addChildAt(this._errorMessage, 0);
            } else if (!hasError && this._errorMessage) {
                this._errorMessage.remove();
                this._errorMessage = null;
            }
        };

        this.processInputOverride = function() {
            var scale = this.getInternal("scale");
            var colorPalette = this.getInternal("colorPalette");

            this._minRow.processInput(scale, colorPalette);
            this._midRow.processInput(scale, colorPalette);
            this._maxRow.processInput(scale, colorPalette);
            //this._binRow.processInput(colorPalette);
        };

        // Private Nested Classes

        var Row = Class(HStackPanel, function(Row, base) {

            // Constructor

            this.constructor = function() {
                base.constructor.call(this);

                this.addClass(CSS.formatClassName(module.id, "row"));
            };

        });

        var ColorRow = Class(Row, function(ColorRow, base) {

            // Private Static Methods

            var _hasError = function(scale, attr) {
                if (!scale || (attr === "min")) {
                    return false;
                }

                var minValue = scale.get("minValue");
                var midValue = scale.get("midValue");
                var maxValue = scale.get("maxValue");

                var minType = !isNaN(minValue) ? scale.get("minType") : "auto";
                var midType = !isNaN(midValue) ? scale.get("midType") : "auto";
                var maxType = !isNaN(maxValue) ? scale.get("maxType") : "auto";

                minValue = ((minType === "percent") || (minType === "percentile")) ? NumberUtil.minMax(minValue, 0, 100) : minValue;
                midValue = ((midType === "percent") || (midType === "percentile")) ? NumberUtil.minMax(midValue, 0, 100) : midValue;
                maxValue = ((maxType === "percent") || (maxType === "percentile")) ? NumberUtil.minMax(maxValue, 0, 100) : maxValue;

                var min = -Infinity;
                if (attr === "mid") {
                    if ((minType === midType) && (minValue > min)) {
                        min = minValue;
                    }
                    return (midValue < min);
                } else {
                    if ((minType === maxType) && (minValue > min)) {
                        min = minValue;
                    }
                    if ((midType === maxType) && (midValue > min)) {
                        min = midValue;
                    }
                    return (maxValue < min);
                }
            };

            // Private Properties

            this._attribute = null;
            this._label = null;
            this._typeEditor = null;
            this._valueEditor = null;
            this._colorEditor = null;

            // Constructor

            this.constructor = function(editor, attribute, label, autoLabel) {
                base.constructor.call(this);

                this._attribute = attribute;

                this._label = new EditorLabel()
                    .set("text", label);

                this._typeEditor = new EnumEditor()
                    .addOption("auto", autoLabel)
                    .addOption("number", _("Number").t())
                    .addOption("percent", _("Percent").t())
                    .addOption("percentile", _("Percentile").t())
                    .set("menuWidth", "narrow")
                    .set("value", "auto")
                    .on("value.change", editor.onInputChange, editor);

                this._valueEditor = new SimpleTypeEditor(Number)
                    .on("value.change", editor.onInputChange, editor);

                this._colorEditor = new ColorEditor()
                    .on("value.change", editor.onInputChange, editor);

                this.addChild(this._label);
                this.addChild(this._typeEditor);
                this.addChild(this._valueEditor);
                this.addChild(this._colorEditor);
            };

            // Public Accessor Methods

            this.hasError = function() {
                return this._valueEditor.get("hasError");
            };

            // Public Methods

            this.renderInput = function(scale, colorPalette) {
                var attr = this._attribute;
                var color = colorPalette ? colorPalette.get(attr + "Color") : null;
                var value = scale ? scale.get(attr + "Value") : NaN;
                var type = (scale && !isNaN(value)) ? scale.get(attr + "Type") : "auto";

                if ((type === "percent") || (type === "percentile")) {
                    value = NumberUtil.minMax(value, 0, 100);
                }

                this._typeEditor
                    .set("value", type)
                    .renderInput();

                this._valueEditor
                    .set("value", value)
                    .set("hasError", _hasError(scale, attr))
                    .set("enabled", !(type === "auto"))
                    .renderInput();

                this._colorEditor
                    .set("value", color || Color.fromString("#FFFFFF"))
                    .set("enabled", !((attr === "mid") && (type === "auto")))
                    .renderInput();
            };

            this.processInput = function(scale, colorPalette) {
                var attr = this._attribute;
                var type = this._typeEditor.get("value");
                var value = this._valueEditor.get("value");
                var color = ((attr === "mid") && (type === "auto")) ? null : this._colorEditor.get("value");

                if (type === "auto") {
                    value = NaN;
                } else {
                    var needsDefault = false;
                    if ((value > -Infinity) && (value < Infinity)) {
                        var oldType = scale ? scale.get(attr + "Type") : "auto";
                        needsDefault = (oldType.indexOf("percent") !== type.indexOf("percent"));
                    } else {
                        needsDefault = true;
                    }

                    if (needsDefault) {
                        if (type === "number") {
                            value = scale ? scale.get("actual" + attr.replace("m", "M") + "Value") : 0;
                        } else if (attr === "min") {
                            value = 0;
                        } else if (attr === "mid") {
                            value = 50;
                        } else {
                            value = 100;
                        }
                    }
                }

                if (scale) {
                    scale.set(attr + "Type", type);
                    scale.set(attr + "Value", value);
                }
                if (colorPalette) {
                    colorPalette.set(attr + "Color", color);
                }
            };

        });

        var BinRow = Class(Row, function(BinRow, base) {

            // Private Properties

            this._label = null;
            this._binEditor = null;

            // Constructor

            this.constructor = function(editor) {
                base.constructor.call(this);

                this._label = new EditorLabel()
                    .set("text", _("Fixed number of color bins").t());

                this._binEditor = new EnumEditor()
                    .set("values", [ Infinity, 3, 4, 5, 6, 7, 8, 9 ])
                    .set("labels", [ _("Off").t() ])
                    .set("defaultLabel", _("Other").t())
                    .set("menuWidth", "narrow")
                    .set("value", Infinity)
                    .on("value.change", editor.onInputChange, editor);

                this.addChild(this._label);
                this.addChild(this._binEditor);
            };

            // Public Methods

            this.renderInput = function(colorPalette) {
                this._binEditor
                    .set("value", colorPalette ? colorPalette.get("interpolationSteps") : Infinity)
                    .renderInput();
            };

            this.processInput = function(colorPalette) {
                if (colorPalette) {
                    colorPalette.set("interpolationSteps", this._binEditor.get("value"));
                }
            };

        });

        var PresetsRow = Class(Row, function(PresetsRow, base) {

            // Private Properties

            this._minMidMaxEditor = null;
            this._presetsButton = null;
            this._isRendering = false;

            // Constructor

            this.constructor = function(minMidMaxEditor) {
                base.constructor.call(this);

                this._minMidMaxEditor = minMidMaxEditor;
                this._presetsButton = new PresetsButton()
                    .on('selection.change', this.processInput, this);

                this.addChild(new EditorLabel(_('Presets').t()));
                this.addChild(this._presetsButton);
            };

            // Public Methods

            this.renderInput = function(scale, colorPalette) {
                if (!scale || !colorPalette || this._isRendering) {
                    return;
                }

                try {
                    this._isRendering = true;

                    var presetsButton = this._presetsButton;
                    var minType = scale.get('minType');
                    var midType = scale.get('midType');
                    var maxType = scale.get('maxType');
                    var minValue = scale.get('minValue');
                    var midValue = scale.get('midValue');
                    var maxValue = scale.get('maxValue');
                    var minColor = colorPalette.get('minColor');
                    var midColor = colorPalette.get('midColor');
                    var maxColor = colorPalette.get('maxColor');
                    var isPresetPrecondition = (minType === 'number') && isNaN(minValue) && (maxType === 'number') && isNaN(maxValue);
                    var isSequentialPrecondition = isPresetPrecondition && (midType === 'number') && isNaN(midValue) && (midColor === null);
                    var isDivergentPrecondition = isPresetPrecondition && (midType === 'percentile') && (midValue === 50) && midColor && midColor.equals(Color.fromString('#ffffff'));

                    if (isSequentialPrecondition || isDivergentPrecondition) {
                        var i;
                        var l;
                        var key;
                        var currentMinColor;
                        var currentMaxColor;
                        var keys = ObjectUtil.keys(_PRESETS_MAP);

                        for (i = 0, l = keys.length; i < l; i++) {
                            key = keys[i];
                            if ((isSequentialPrecondition && (key.indexOf('sequential') === 0)) || (isDivergentPrecondition && (key.indexOf('divergent') === 0))) {
                                currentMinColor = _PRESETS_MAP[key].minColor;
                                currentMaxColor = _PRESETS_MAP[key].maxColor;

                                if (minColor.equals(currentMinColor) && maxColor.equals(currentMaxColor)) {
                                    presetsButton.set('selection', key);
                                    return;
                                }
                            }
                        }
                    }

                    presetsButton.set('selection', null);
                } finally {
                    this._isRendering = false;
                }
            };

            this.processInput = function() {
                var minMidMaxEditor = this._minMidMaxEditor;
                var scale = minMidMaxEditor.get('scale');
                var colorPalette = minMidMaxEditor.get('colorPalette');
                var selectedPreset = this._presetsButton.get('selection');

                if (!scale || !colorPalette || !selectedPreset || this._isRendering) {
                    return;
                }

                var isSequential = selectedPreset.indexOf('sequential') === 0;
                var minColor = _PRESETS_MAP[selectedPreset].minColor;
                var maxColor = _PRESETS_MAP[selectedPreset].maxColor;

                scale.set('minType', 'number')
                    .set('minValue', NaN)
                    .set('midType', isSequential ? 'number' : 'percentile')
                    .set('midValue', isSequential ? NaN : 50)
                    .set('maxType', 'number')
                    .set('maxValue', NaN);

                colorPalette.set('minColor', minColor)
                    .set('midColor', isSequential ? null : Color.fromString('#ffffff'))
                    .set('maxColor', maxColor);
            };
                
        });

        var PresetsButton = Class(Element, function(PresetsButton, base) {

            // Public Properties

            this.selection = new ObservableProperty('selection', String, null)
                .setter(function(value) {
                    if (_PRESETS_MAP.hasOwnProperty(value)) {
                        this._presetsButtonContent.element.innerHTML = _PRESETS_MAP[value].svg;
                    } else {
                        this._presetsButtonContent.element.innerHTML = StringUtil.escapeHTML(_('Custom').t());
                    }
                });

            // Private Properties

            this._presetsButtonContent = null;
            this._presetsPopTart = null;

            // Constructor

            this.constructor = function() {
                base.constructor.call(this, 'a');

                var presetsButtonContent = this._presetsButtonContent = new Element('span')
                    .addClass('presets-button-content');
                var presetsButtonCaret = new Element('span')
                    .addClass('caret');

                this.element.href = '#';
                presetsButtonContent.element.innerHTML = StringUtil.escapeHTML(_('Custom').t());

                this
                    .addChild(presetsButtonContent)
                    .addChild(presetsButtonCaret)
                    .addClass('dropdown-toggle btn presets-button')
                    .on('click', function (e) {
                        e.preventDefault();

                        this._presetsPopTart = new PresetsPopTart({
                            onHiddenRemove: true,
                            presetsButton: this
                        });

                        this._presetsPopTart.render().appendTo($('body'));

                        if (this.get('selection')) {
                            this._presetsPopTart['$onOpenFocus'] = this._presetsPopTart.$el.find('.' + this.get('selection'));
                        }

                        this._presetsPopTart.show($(this.element));

                    }, this);
            };

        });

        var PresetsPopTart = PopTart.extend({
            events: {
                'click .item': function(e) {
                    e.preventDefault();
                    var presetsButton = this.options.presetsButton;
                    var selection = (e.currentTarget.className).match(/(sequential|divergent)\d+/g)[0];

                    presetsButton.set('selection', selection);
                    this.hide();
                }
            },

            render: function() {
                this.el.innerHTML = "";
                this.$el.append(_.template(this.template, _PRESETS_MAP));

                return this;
            },

            template: '\
                <div class="arrow"></div>\
                <div class="popdown-dialog-body presets-popdown">\
                    <div class="sequential-list">\
                        <div class="title"><%- _("Sequential").t() %></div>\
                        <a class="item sequential1" href="#"> <%= sequential1.svg %> </a>\
                        <a class="item sequential2" href="#"> <%= sequential2.svg %> </a>\
                        <a class="item sequential3" href="#"> <%= sequential3.svg %> </a>\
                        <a class="item sequential4" href="#"> <%= sequential4.svg %> </a>\
                        <a class="item sequential5" href="#"> <%= sequential5.svg %> </a>\
                        <a class="item sequential6" href="#"> <%= sequential6.svg %> </a>\
                    </div>\
                    <div class="divergent-list">\
                        <div class="title"><%- _("Divergent").t() %></div>\
                        <a class="item divergent1" href="#"> <%= divergent1.svg %> </a>\
                        <a class="item divergent2" href="#"> <%= divergent2.svg %> </a>\
                        <a class="item divergent3" href="#"> <%= divergent3.svg %> </a>\
                        <a class="item divergent4" href="#"> <%= divergent4.svg %> </a>\
                        <a class="item divergent5" href="#"> <%= divergent5.svg %> </a>\
                        <a class="item divergent6" href="#"> <%= divergent6.svg %> </a>\
                    </div>\
                </div>'
        });

    });

});
