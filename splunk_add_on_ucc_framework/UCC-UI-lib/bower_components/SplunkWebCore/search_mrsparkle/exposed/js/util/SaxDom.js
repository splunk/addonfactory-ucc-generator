define(['underscore', 'sax'], function(_, Sax) {

    // ~~ SAX Document Object Model ~~
    // 
    // Simple document object model that uses sax.js - a pure JS XML parser - to parse XML 
    // and produces a lightweight object structure representing the XML. Also retains 
    // position (line/column) information as part of DOM elements.

    /**
     * @class SaxElement represents a parsed XML element. It's primary properties are:
     * - name {String} (tag name of the element)
     * - attr {Object} key/value paris of attribute of the element
     * - children {Array} of child elements
     * - val {String} text content of the element
     */
    var SaxElement = function(saxAttrs, parent) {
        this.parent = parent;
        this.name = saxAttrs.name;
        this.attr = saxAttrs.attributes || {};
        this.children = [];
        this.firstChild = null;
        this.lastChild = null;

        this.val = null;

        this.textNodes = [];
        this.cdataNodes = [];
    };

    _.extend(SaxElement.prototype, {
        _updatePositionInfo: function(parser) {
            this.line = parser.line;
            this.column = parser.column;
            this.position = parser.position;
            this.startTagPosition = parser.startTagPosition;
        },
        _opentag: function(tag) {
            var child = new SaxElement(tag, this);
            this.children.push(child);
            this.firstChild = this.firstChild || child;
            this.lastChild = child;
            return child;
        },
        _closetag: function(tag, parser) {
            if (this.val == null && !parser.tag.isSelfClosing) {
                this.val = "";
            }
            this.endPosition = parser.position;
            this.endTagPosition = parser.startTagPosition;
            this._closed = true;
        },
        _text: function(text) {
            this.textNodes.push(text);
            this.val = (this.val || '') + text;
        },
        _cdata: function(text) {
            this.cdataNodes.push(text);
            this.val = (this.val || '') + text;
        },
        _rootDoc: function() {
            var cur = this;
            while (cur.parent) {
                cur = cur.parent;
            }
            return cur;
        },
        _documentSource: function() {
            var source = this._rootDoc().source;
            if (!source) {
                throw new SaxParserError("Cannot access raw content of node (see retainRaw option)");
            }
            return source;
        },
        /**
         * Get the raw XML representation of the XML element as it occurs in the source code originally
         * @returns {String} the raw XML source fragment defining the element
         */
        raw: function() {
            return this._documentSource().slice(this.startTagPosition - 1, this.endPosition);
        },
        /**
         * Get the raw XML content of the given XML element as it occurs in the source code originally
         * @returns {String} the raw XML source fragment of the content of this element 
         */
        rawContent: function() {
            return this._documentSource().slice(this.position, this.endTagPosition - 1);
        },
        /**
         * Iterate over each child element of this element 
         * @param {Function} iterator
         * @param {Function} context (optional)
         */
        eachChild: function(iterator, context) {
            _.each(this.children, iterator, context);
        },
        /**
         * Get the first child element with the given tag name
         * @param {String} name
         * @returns {SaxElement}
         */
        childNamed: function(name) {
            return _.findWhere(this.children, {name: name});
        },
        /**
         * Get all child elements with the given tag name
         * @param {String} name
         * @returns {Array} of elements
         */
        childrenNamed: function(name) {
            return _.where(this.children, {name: name});
        },
        /**
         * Find the first child with the given attribute (and optionally attribute value)
         * @param {String} name of the attribute
         * @param {String} value (optinally) the value of the attribute
         * @returns {SaxElement}
         */
        childWithAttribute: function(name, value) {
            return _.find(this.children, function(child) {
                return value !== undefined ? child.attr[name] === value : child.attr[name] !== undefined;
            });
        },
        toString: function(options) {
            return this.toStringWithIndent("", options);
        },
        toStringWithIndent: function(indent, options) {
            var s = indent + "<" + this.name;
            var linebreak = options && options.compressed ? "" : "\n";

            for (var name in this.attr) {
                if (Object.prototype.hasOwnProperty.call(this.attr, name)) {
                    s += " " + name + '="' + _.escape(this.attr[name]) + '"';
                }
            }

            var finalVal = _.escape((this.val || '').trim());

            if (options && options.trimmed && finalVal.length > 25) {
                finalVal = finalVal.substring(0, 25).trim() + "…";
            }

            if (this.children.length) {
                s += ">" + linebreak;

                var childIndent = indent + (options && options.compressed ? "" : "  ");

                if (finalVal.length) {
                    s += childIndent + finalVal + linebreak;
                }

                for (var i = 0, l = this.children.length; i < l; i++) {
                    s += this.children[i].toStringWithIndent(childIndent, options) + linebreak;
                }

                s += indent + "</" + this.name + ">";
            } else if (finalVal.length) {
                s += ">" + finalVal + "</" + this.name + ">";
            } else {
                s += "/>";
            }

            return s;
        }
    });

    /**
     * @class SaxDocument is a root element of an XML document
     */
    function SaxDocument(tag, raw) {
        SaxElement.call(this, tag);
        this.source = raw;
    }

    _.extend(SaxDocument.prototype, SaxElement.prototype);


    function SaxParserError(message, line, column) {
        Error.call(this, message);
        this.name = "SaxParserError";
        this.line = line;
        this.column = column;
        this.message = message;
    }


    _.extend(SaxParserError.prototype, Error.prototype);

    SaxParserError.of = function(error) {
        if (error instanceof SaxParserError) {
            return error;
        } else {
            var m = /^(.+?)\.?\nLine: ([-\d]+)\nColumn: ([-\d]+)\n/g.exec(error.message);
            return new SaxParserError(m ? m[1] : error.message, m ? +m[2] + 1 : -1, m ? +m[3] : -1);
        }
    };

    /**
     * Parse the given XML string
     * 
     * @param {String} xml
     * @param {Object} options (optional) {
     *      position: {Boolean} enable or disable the tracking of the position with the XML document
     *      retainRaw: {Boolean} true to keep a reference to the original XML source. Necessary for raw() and rawContent() to work
     *      * {*}: Any option supported by the sax.js parser
     * }
     * @returns {SaxDocument}
     */
    function parseSaxDom(xml, options) {
        options = _.extend({
            // Track and store position of nodes within the XML document
            position: true,
            // Retain the source of the XML so it can be accessed using raw() and rawContent() methods
            retainRaw: true
        }, options);
        var parser = Sax.parser(true, options);

        var document = null;
        var currentElement = null;

        parser.onopentag = function(tag) {
            var newElement;
            if (currentElement == null) {
                if (document != null) {
                    throw new SaxParserError("Unexpected element after document end", parser.line + 1, parser.column);
                }
                document = newElement = new SaxDocument(tag, options.retainRaw ? xml : null);
            } else {
                newElement = currentElement._opentag(tag);
            }
            newElement._updatePositionInfo(parser);
            currentElement = newElement;
        };
        parser.onclosetag = function(tag) {
            if (currentElement) {
                currentElement._closetag(tag, parser);
                currentElement = currentElement.parent;
            }
        };
        parser.ontext = function(text) {
            if (currentElement) {
                currentElement._text.apply(currentElement, arguments);
            }
        };
        parser.oncdata = function() {
            if (currentElement) {
                currentElement._cdata.apply(currentElement, arguments);
            }
        };
        parser.onerror = function(e) {
            throw SaxParserError.of(e);
        };

        parser.write(xml).close();

        if (!document) {
            throw new SaxParserError('No document', 1, 1);
        }

        return document;
    }

    return {
        parse: parseSaxDom,
        Document: SaxDocument,
        Element: SaxElement,
        Error: SaxParserError
    };
});