define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var ArrayParser = require("splunk/parsers/ArrayParser");
    var AttributeParser = require("splunk/parsers/AttributeParser");
    var BooleanParser = require("splunk/parsers/BooleanParser");
    var ColorPaletteParser = require("splunk/parsers/ColorPaletteParser");
    var NumberParser = require("splunk/parsers/NumberParser");
    var ParseUtils = require("splunk/parsers/ParseUtils");
    var ScaleParser = require("splunk/parsers/ScaleParser");
    var StringParser = require("splunk/parsers/StringParser");
    var ColorCellRenderer = require("views/shared/results_table/renderers/ColorCellRenderer");
    var FieldCellRenderer = require("views/shared/results_table/renderers/FieldCellRenderer");
    var MultiFieldCellRenderer = require("views/shared/results_table/renderers/MultiFieldCellRenderer");
    var NumberFormatCellRenderer = require("views/shared/results_table/renderers/NumberFormatCellRenderer");

    return Class(module.id, AttributeParser, function(CellRendererParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        CellRendererParser.getInstance = function() {
            if (!_instance) {
                _instance = new CellRendererParser();
            }
            return _instance;
        };

        // Protected Properties

        this.numberParser = null;
        this.booleanParser = null;
        this.stringParser = null;
        this.scaleParser = null;
        this.colorPaletteParser = null;
        this.stringArrayParser = null;

        // Constructor

        this.constructor = function() {
            this.numberParser = NumberParser.getInstance();
            this.booleanParser = BooleanParser.getInstance();
            this.stringParser = StringParser.getInstance();
            this.scaleParser = ScaleParser.getInstance();
            this.colorPaletteParser = ColorPaletteParser.getInstance();
            this.stringArrayParser = ArrayParser.getInstance(this.stringParser);
        };

        // Public Methods

        this.deserialize = function(attributes) {
            var value = base.deserialize.call(this, attributes);
            if (value == null) {
                return value;
            }

            var fields = ObjectUtil.get(attributes, "fields");
            if (fields != null) {
                fields = this.stringArrayParser.stringToValue("" + fields);
                if (fields != null) {
                    return new MultiFieldCellRenderer(fields, value);
                }
            }

            var field = ObjectUtil.get(attributes, "field");
            if (field != null) {
                field = this.stringParser.stringToValue("" + field);
                if (field != null) {
                    return new FieldCellRenderer(field, value);
                }
            }

            return value;
        };

        this.serialize = function(value) {
            var fieldCellRenderer = (value instanceof FieldCellRenderer) ? value : null;
            var multiFieldCellRenderer = (value instanceof MultiFieldCellRenderer) ? value : null;
            if (fieldCellRenderer || multiFieldCellRenderer) {
                value = value.cellRenderer;
            }

            var attributes = base.serialize.call(this, value);
            if (attributes) {
                if (fieldCellRenderer) {
                    attributes["field"] = this.stringParser.valueToString(fieldCellRenderer.field);
                } else if (multiFieldCellRenderer) {
                    attributes["fields"] = this.stringArrayParser.valueToString(multiFieldCellRenderer.fields);
                }
            }

            return attributes;
        };

        this.stringToValue = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            switch (str) {
                case "color":
                    return new ColorCellRenderer();
                case "number":
                    return new NumberFormatCellRenderer();
                default:
                    return null;
            }
        };

        this.valueToString = function(value) {
            var type = (value != null) ? value.constructor : null;
            switch (type) {
                case ColorCellRenderer:
                    return "color";
                case NumberFormatCellRenderer:
                    return "number";
                default:
                    return null;
            }
        };

        this.getAttributeParsers = function(value) {
            if ((value instanceof FieldCellRenderer) || (value instanceof MultiFieldCellRenderer)) {
                value = value.cellRenderer;
            }

            var type = (value != null) ? value.constructor : null;
            switch (type) {
                case ColorCellRenderer:
                    return {
                        scale: this.scaleParser,
                        colorPalette: this.colorPaletteParser
                    };
                case NumberFormatCellRenderer:
                    return {
                        precision: this.numberParser,
                        useThousandSeparators: this.booleanParser,
                        unit: this.stringParser,
                        unitPosition: this.stringParser
                    };
                default:
                    return null;
            }
        };

        this.getAttribute = function(value, attributeName) {
            if ((value instanceof FieldCellRenderer) || (value instanceof MultiFieldCellRenderer)) {
                value = value.cellRenderer;
            }

            return base.getAttribute.call(this, value, attributeName);
        };

        this.setAttribute = function(value, attributeName, attributeValue) {
            if ((value instanceof FieldCellRenderer) || (value instanceof MultiFieldCellRenderer)) {
                value = value.cellRenderer;
            }

            base.setAttribute.call(this, value, attributeName, attributeValue);
        };

    });

});
