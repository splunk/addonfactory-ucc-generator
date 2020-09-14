define(function(require, exports, module) {

    var _ = require("underscore");
    var BaseCellRenderer = require("./BaseCellRenderer");
    var MPassTarget = require("jg/async/MPassTarget");
    var Pass = require("jg/async/Pass");
    var Color = require("jg/graphics/Color");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var Property = require("jg/properties/Property");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var Map = require("jg/utils/Map");
    var TrieMap = require("jg/utils/TrieMap");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var Scale = require("splunk/scales/Scale");
    var ColorUtil = require("splunk/utils/ColorUtil");

    var _tdColorMap = new TrieMap();
    var _tdColorCount = 0;

    return BaseCellRenderer.extend(_.extend({}, MPassTarget, MPropertyTarget, {

        // Public Passes

        updateScalePass: new Pass("updateScale", 0.1),
        renderColorPass: new Pass("renderColor", 0.2),

        // Public Properties

        scale: new Property("scale", Scale)
            .getter(function() {
                return this._scale;
            })
            .setter(function(value) {
                if (value !== this._scale) {
                    this._teardownScale();
                    this._scale = value;
                    if (this._tdFieldValueMapping.size() > 0) {
                        this._setupScale();
                        this.invalidate("updateScalePass");
                    }
                }
            }),

        colorPalette: new Property("colorPalette", ColorPalette)
            .getter(function() {
                return this._colorPalette;
            })
            .setter(function(value) {
                if (value !== this._colorPalette) {
                    this._teardownColorPalette();
                    this._colorPalette = value;
                    if (this._tdFieldValueMapping.size() > 0) {
                        this._setupColorPalette();
                        this.invalidate("renderColorPass");
                    }
                }
            }),

        // Private Properties

        _scale: null,
        _colorPalette: null,
        _tdFieldValueMapping: null,
        _pendingUnregisterScale: null,
        _pendingUnregisterTimeout: 0,

        // Initialize

        initialize: function(scale, colorPalette) {
            this._tdFieldValueMapping = new Map();

            if (scale != null) {
                this.set("scale", scale);
            }
            if (colorPalette != null) {
                this.set("colorPalette", colorPalette);
            }
        },

        // Public Methods

        canRender: function(cellData) {
            return true;
        },

        setup: function($td, cellData) {
            _tdColorMap.set([ $td, this ], { order: _tdColorCount++, color: null });
            if (this._tdFieldValueMapping.size() === 0) {
                this._setupScale();
                this._setupColorPalette();
            }
        },

        teardown: function($td, cellData) {
            this._tdFieldValueMapping.del($td);
            if (this._tdFieldValueMapping.size() === 0) {
                this._teardownColorPalette();
                this._teardownScale();
            }
            _tdColorMap.del([ $td, this ]);

            $td.removeClass("color-formatted");
        },

        render: function($td, cellData) {
            this._tdFieldValueMapping.set($td, cellData.value);
            this.invalidate("updateScalePass");
        },

        updateScale: function() {
            if (this._scale) {
                var fieldValues = this._tdFieldValueMapping.values();
                this._scale.setValues(this, fieldValues);
            }
            this.invalidate("renderColorPass");
        },

        renderColor: function() {
            var scale = this._scale;
            var scaleSpan = scale ? scale.discreteSpan() : -1;
            var scaleValue;
            var colorPalette = this._colorPalette;
            var color;
            var colorInfoList;
            var colorInfo;
            var tdValuePairs = this._tdFieldValueMapping.entries();
            var $td, value, i, j, l;

            for (i = 0, l = tdValuePairs.length; i < l; i++) {
                $td = tdValuePairs[i][0];
                value = tdValuePairs[i][1];
                color = null;

                // get color from colorPalette and scale
                if (colorPalette) {
                    scaleValue = scale ? scale.valueToScale(value, true) : 0;
                    if ((scaleValue >= 0) && (scaleValue <= 1)) {
                        color = colorPalette.getItem(scaleValue, scaleSpan, value);
                    }
                }

                // store color in global color map
                colorInfo = _tdColorMap.get([ $td, this ]);
                if (colorInfo) {
                    colorInfo.color = color;
                }

                // get nearest color from global color map
                color = null;
                colorInfoList = _tdColorMap.values([ $td ]);
                if (colorInfoList) {
                    colorInfoList.sort(function(info1, info2) {
                        return info1.order - info2.order;
                    });
                    for (j = colorInfoList.length - 1; j >= 0; j--) {
                        colorInfo = colorInfoList[j];
                        if (colorInfo.color) {
                            color = colorInfo.color;
                            break;
                        }
                    }
                }

                // apply color to background and contrasting color to foreground
                var backgroundColor = color;
                var foregroundColor = null;
                if (backgroundColor) {
                    foregroundColor = (ColorUtil.perceptiveLuminance(backgroundColor) < 0.5) ? Color.fromString("#000000") : Color.fromString("#FFFFFF");
                    $td.addClass("color-formatted");
                } else {
                    $td.removeClass("color-formatted");
                }

                $td.css({
                    "color": foregroundColor ? foregroundColor.toString("rgba") : "",
                    "background-color": backgroundColor ? backgroundColor.toString("rgba") : ""
                });
            }
        },

        // Private Methods

        _setupScale: function() {
            this._unregisterScale();
            if (this._scale) {
                this._scale.register(this);
                this._scale.on("change", this._scaleChangeHandler, this);
            }
        },

        _teardownScale: function() {
            this._unregisterScale();
            if (this._scale) {
                this._scale.off("change", this._scaleChangeHandler, this);
                this._pendingUnregisterScale = this._scale;
                this._pendingUnregisterTimeout = setTimeout(FunctionUtil.bind(this._unregisterScale, this, true), 1);
            }
        },

        _unregisterScale: function(force) {
            clearTimeout(this._pendingUnregisterTimeout);

            if (!this._pendingUnregisterScale) {
                return;
            }

            if ((force === true) || (this._pendingUnregisterScale !== this._scale)) {
                this._pendingUnregisterScale.unregister(this);
            }

            this._pendingUnregisterScale = null;
        },

        _setupColorPalette: function() {
            if (this._colorPalette) {
                this._colorPalette.on("change", this._colorPaletteChangeHandler, this);
            }
        },

        _teardownColorPalette: function() {
            if (this._colorPalette) {
                this._colorPalette.off("change", this._colorPaletteChangeHandler, this);
            }
        },

        _scaleChangeHandler: function(e) {
            if ((e.event === this._scale.valueMapChange) || (e.event === this._scale.scaleMapChange)) {
                this.invalidate("renderColorPass");
            }
        },

        _colorPaletteChangeHandler: function(e) {
            this.invalidate("renderColorPass");
        }

    }));

});
