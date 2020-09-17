define(function(require, exports, module) {

    var _ = require("underscore");
    var Class = require("jg/Class");
    var CSS = require("jg/CSS");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Map = require("jg/utils/Map");
    var BooleanEditor = require("splunk/editors/BooleanEditor");
    var ColorScaleMapEditor = require("splunk/editors/ColorScaleMapEditor");
    var ColorScaleMinMidMaxEditor = require("splunk/editors/ColorScaleMinMidMaxEditor");
    var ColorScaleThresholdEditor = require("splunk/editors/ColorScaleThresholdEditor");
    var Editor = require("splunk/editors/Editor");
    var EnumEditor = require("splunk/editors/EnumEditor");
    var ColorCodes = require("splunk/palettes/ColorCodes");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");
    var MapColorPalette = require("splunk/palettes/MapColorPalette");
    var MinMidMaxColorPalette = require("splunk/palettes/MinMidMaxColorPalette");
    var SharedListColorPalette = require("splunk/palettes/SharedListColorPalette");
    var HStackPanel = require("splunk/panels/HStackPanel");
    var MinMidMaxScale = require("splunk/scales/MinMidMaxScale");
    var Scale = require("splunk/scales/Scale");
    var SharedCategoryScale = require("splunk/scales/SharedCategoryScale");
    var ThresholdScale = require("splunk/scales/ThresholdScale");

    require("./ColorScaleEditor.pcss");

    return Class(module.id, Editor, function(ColorScaleEditor, base) {

        // Public Static Methods

        ColorScaleEditor.canEdit = function(scale, colorPalette) {
            if ((scale != null) && !(scale instanceof Scale)) {
                throw new Error("Parameter scale must be of type " + Class.getName(Scale) + ".");
            } else if ((colorPalette != null) && !(colorPalette instanceof ColorPalette)) {
                throw new Error("Parameter colorPalette must be of type " + Class.getName(ColorPalette) + ".");
            }

            return (((scale == null) && (colorPalette == null)) || (_getColorMode(scale, colorPalette) != null));
        };

        // Private Static Methods

        var _getColorMode = function(scale, colorPalette) {
            var scaleType = (scale != null) ? scale.constructor : null;
            var colorPaletteType = (colorPalette != null) ? colorPalette.constructor : null;

            if ((scaleType === MinMidMaxScale) && (colorPaletteType === MinMidMaxColorPalette)) {
                return "minMidMax";
            } else if ((scaleType === ThresholdScale) && (colorPaletteType === ListColorPalette) && (colorPalette.get("interpolate") === false) && (colorPalette.get("colors").length === (scale.get("thresholds").length + 1))) {
                return "threshold";
            } else if ((scaleType === SharedCategoryScale) && (colorPaletteType === SharedListColorPalette)) {
                return "category";
            } else if ((scale == null) && (colorPaletteType === MapColorPalette)) {
                return "map";
            } else {
                return null;
            }
        };

        // Public Properties

        this.scale = new ObservableProperty("scale", Scale, null)
            .onChange(function(e) {
                if ((e.event !== e.target.valueMapChange) && (e.event !== e.target.scaleMapChange)) {
                    this.invalidate("renderInputPass");
                }
            });

        this.colorPalette = new ObservableProperty("colorPalette", ColorPalette, null)
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        // Private Properties

        this._cachedColorScales = null;
        this._enumEditor = null;
        this._booleanEditor = null;
        this._subEditor = null;

        // Protected Methods

        this.setupOverride = function() {
            this._cachedColorScales = new Map();

            this._enumEditor = new EnumEditor()
                .addOption(null, _("None").t())
                .addOption("scale", _("Scale").t())
                .addOption("ranges", _("Ranges").t())
                .addOption("values", _("Values").t())
                .set("defaultLabel", _("Custom").t())
                .on("value.change", this.onInputChange, this)
                .addClass('color-enum-editor');

            this._booleanEditor = new BooleanEditor()
                .set("trueLabel", _("Automatic").t())
                .set("falseLabel", _("Define rules").t())
                .on("value.change", this.onInputChange, this);

            this.addChild(this._enumEditor);
            this.addChild(this._booleanEditor);
        };

        this.renderInputOverride = function() {
            var scale = this.getInternal("scale");
            var colorPalette = this.getInternal("colorPalette");
            var colorMode = _getColorMode(scale, colorPalette);

            var enumValue = null;
            var booleanValue = true;
            var subEditorType = null;

            if (scale || colorPalette) {
                switch (colorMode) {
                    case "minMidMax":
                        enumValue = "scale";
                        subEditorType = ColorScaleMinMidMaxEditor;
                        break;
                    case "threshold":
                        enumValue = "ranges";
                        subEditorType = ColorScaleThresholdEditor;
                        break;
                    case "category":
                        enumValue = "values";
                        break;
                    case "map":
                        enumValue = "values";
                        booleanValue = false;
                        subEditorType = ColorScaleMapEditor;
                        break;
                    default:
                        enumValue = "UNKNOWN";
                        break;
                }

                if (colorMode && !this._cachedColorScales.has(colorMode)) {
                    this._cachedColorScales.set(colorMode, { scale: scale, colorPalette: colorPalette });
                }
            }

            this._enumEditor
                .set("value", enumValue)
                .renderInput();

            this._booleanEditor
                .set("value", booleanValue)
                .set("visibility", (enumValue === "values") ? "visible" : "collapsed")
                .renderInput();

            if (this._subEditor && (this._subEditor.constructor !== subEditorType)) {
                this._subEditor.remove();
                this._subEditor = null;
            }

            if (subEditorType && !this._subEditor) {
                this._subEditor = new subEditorType();
                if (this._subEditor.scale) {
                    this._subEditor.set("scale", scale);
                }
                if (this._subEditor.colorPalette) {
                    this._subEditor.set("colorPalette", colorPalette);
                }
                this._subEditor.renderInput();
                this.addChild(this._subEditor);
            }
        };

        this.processInputOverride = function() {
            var colorMode = null;
            var scale = null;
            var colorPalette = null;

            switch (this._enumEditor.get("value")) {
                case "scale":
                    colorMode = "minMidMax";
                    break;
                case "ranges":
                    colorMode = "threshold";
                    break;
                case "values":
                    colorMode = this._booleanEditor.get("value") ? "category" : "map";
                    break;
            }

            var cachedColorScale = this._cachedColorScales.get(colorMode);
            if (!cachedColorScale) {
                switch (colorMode) {
                    case "minMidMax":
                        scale = new MinMidMaxScale();
                        colorPalette = new MinMidMaxColorPalette()
                            .set("minColor", Color.fromString("#FFFFFF"))
                            .set("maxColor", Color.fromString("#31A35F"));
                        break;
                    case "threshold":
                        scale = new ThresholdScale()
                            .set("thresholds", [ 0, 30, 70, 100 ]);
                        colorPalette = new ListColorPalette()
                            .set("colors", ColorCodes.toColors(ColorCodes.SEMANTIC.slice(0, 5)));
                        break;
                    case "category":
                        scale = new SharedCategoryScale();
                        colorPalette = new SharedListColorPalette();
                        break;
                    case "map":
                        colorPalette = new MapColorPalette();
                        break;
                }
                this._cachedColorScales.set(colorMode, { scale: scale, colorPalette: colorPalette });
            } else {
                scale = cachedColorScale.scale;
                colorPalette = cachedColorScale.colorPalette;
            }

            this.setInternal("scale", scale);
            this.setInternal("colorPalette", colorPalette);
        };

    });

});
