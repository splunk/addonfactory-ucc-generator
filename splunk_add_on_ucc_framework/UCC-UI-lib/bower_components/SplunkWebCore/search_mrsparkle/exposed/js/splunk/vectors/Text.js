define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Rectangle = require("jg/geom/Rectangle");
    var Shape = require("splunk/vectors/Shape");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, Shape, function(Text, base) {

        // Constructor

        this.constructor = function(x, y, text) {
            base.constructor.call(this);
        };

        // Public Methods

        this.x = function(value) {
            return this;
        };

        this.y = function(value) {
            return this;
        };

        this.text = function(value) {
            return this;
        };

        this.alignmentBaseline = function(value) {
            return this;
        };

        this.baselineShift = function(value) {
            return this;
        };

        this.direction = function(value) {
            return this;
        };

        this.dominantBaseline = function(value) {
            return this;
        };

        this.fontFamily = function(value) {
            return this;
        };

        this.fontSize = function(value) {
            return this;
        };

        this.fontSizeAdjust = function(value) {
            return this;
        };

        this.fontStretch = function(value) {
            return this;
        };

        this.fontStyle = function(value) {
            return this;
        };

        this.fontVariant = function(value) {
            return this;
        };

        this.fontWeight = function(value) {
            return this;
        };

        this.glyphOrientationHorizontal = function(value) {
            return this;
        };

        this.glyphOrientationVertical = function(value) {
            return this;
        };

        this.kerning = function(value) {
            return this;
        };

        this.letterSpacing = function(value) {
            return this;
        };

        this.textAnchor = function(value) {
            return this;
        };

        this.textDecoration = function(value) {
            return this;
        };

        this.textRendering = function(value) {
            return this;
        };

        this.unicodeBidi = function(value) {
            return this;
        };

        this.wordSpacing = function(value) {
            return this;
        };

        this.writingMode = function(value) {
            return this;
        };

        this.getBounds = function() {
            return new Rectangle();
        };

        // Private Nested Classes

        var SVGText = Class(function(SVGText) {

            // Constructor

            this.constructor = function(x, y, text) {
                base.constructor.call(this, "text");

                this.fillColor(0x000000);
                if (x != null) {
                    this.x(x);
                }
                if (y != null) {
                    this.y(y);
                }
                if (text != null) {
                    this.text(text);
                }
            };

            // Public Methods

            this.x = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.setAttribute("x", value);
                } else {
                    this.element.removeAttribute("x");
                }

                return this;
            };

            this.y = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.setAttribute("y", value);
                } else {
                    this.element.removeAttribute("y");
                }

                return this;
            };

            this.text = function(value) {
                this.element.textContent = value ? value : "";

                return this;
            };

            this.alignmentBaseline = function(value) {
                if (value) {
                    this.element.setAttribute("alignment-baseline", value);
                } else {
                    this.element.removeAttribute("alignment-baseline");
                }

                return this;
            };

            this.baselineShift = function(value) {
                if (value) {
                    this.element.setAttribute("baseline-shift", value);
                } else {
                    this.element.removeAttribute("baseline-shift");
                }

                return this;
            };

            this.direction = function(value) {
                if (value) {
                    this.element.setAttribute("direction", value);
                } else {
                    this.element.removeAttribute("direction");
                }

                return this;
            };

            this.dominantBaseline = function(value) {
                if (value) {
                    this.element.setAttribute("dominant-baseline", value);
                } else {
                    this.element.removeAttribute("dominant-baseline");
                }

                return this;
            };

            this.fontFamily = function(value) {
                if (value) {
                    this.element.setAttribute("font-family", value);
                } else {
                    this.element.removeAttribute("font-family");
                }

                return this;
            };

            this.fontSize = function(value) {
                if (value) {
                    this.element.setAttribute("font-size", value);
                } else {
                    this.element.removeAttribute("font-size");
                }

                return this;
            };

            this.fontSizeAdjust = function(value) {
                if (value) {
                    this.element.setAttribute("font-size-adjust", value);
                } else {
                    this.element.removeAttribute("font-size-adjust");
                }

                return this;
            };

            this.fontStretch = function(value) {
                if (value) {
                    this.element.setAttribute("font-stretch", value);
                } else {
                    this.element.removeAttribute("font-stretch");
                }

                return this;
            };

            this.fontStyle = function(value) {
                if (value) {
                    this.element.setAttribute("font-style", value);
                } else {
                    this.element.removeAttribute("font-style");
                }

                return this;
            };

            this.fontVariant = function(value) {
                if (value) {
                    this.element.setAttribute("font-variant", value);
                } else {
                    this.element.removeAttribute("font-variant");
                }

                return this;
            };

            this.fontWeight = function(value) {
                if (value) {
                    this.element.setAttribute("font-weight", value);
                } else {
                    this.element.removeAttribute("font-weight");
                }

                return this;
            };

            this.glyphOrientationHorizontal = function(value) {
                if (value) {
                    this.element.setAttribute("glyph-orientation-horizontal", value);
                } else {
                    this.element.removeAttribute("glyph-orientation-horizontal");
                }

                return this;
            };

            this.glyphOrientationVertical = function(value) {
                if (value) {
                    this.element.setAttribute("glyph-orientation-vertical", value);
                } else {
                    this.element.removeAttribute("glyph-orientation-vertical");
                }

                return this;
            };

            this.kerning = function(value) {
                if (value) {
                    this.element.setAttribute("kerning", value);
                } else {
                    this.element.removeAttribute("kerning");
                }

                return this;
            };

            this.letterSpacing = function(value) {
                if (value) {
                    this.element.setAttribute("letter-spacing", value);
                } else {
                    this.element.removeAttribute("letter-spacing");
                }

                return this;
            };

            this.textAnchor = function(value) {
                if (value) {
                    this.element.setAttribute("text-anchor", value);
                } else {
                    this.element.removeAttribute("text-anchor");
                }

                return this;
            };

            this.textDecoration = function(value) {
                if (value) {
                    this.element.setAttribute("text-decoration", value);
                } else {
                    this.element.removeAttribute("text-decoration");
                }

                return this;
            };

            this.textRendering = function(value) {
                if (value) {
                    this.element.setAttribute("text-rendering", value);
                } else {
                    this.element.removeAttribute("text-rendering");
                }

                return this;
            };

            this.unicodeBidi = function(value) {
                if (value) {
                    this.element.setAttribute("unicode-bidi", value);
                } else {
                    this.element.removeAttribute("unicode-bidi");
                }

                return this;
            };

            this.wordSpacing = function(value) {
                if (value) {
                    this.element.setAttribute("word-spacing", value);
                } else {
                    this.element.removeAttribute("word-spacing");
                }

                return this;
            };

            this.writingMode = function(value) {
                if (value) {
                    this.element.setAttribute("writing-mode", value);
                } else {
                    this.element.removeAttribute("writing-mode");
                }

                return this;
            };

            this.getBounds = function() {
                try {
                    var box = this.element.getBBox();
                    return new Rectangle(box.x, box.y, box.width, box.height);
                } catch (e) {
                    return new Rectangle();
                }
            };

        });

        var VMLText = Class(function(VMLText) {
        });

        VectorElement.mixin(this, SVGText, VMLText);

    });

});
