define(['jquery', 'underscore', 'util/console', 'util/SaxDom'], function($, _, console, SaxDom) {

    var tmpDoc = _.once(function(){
        return $.parseXML('<tmp/>');
    });

    /**
     * Parse the given XML string
     * @param {String} str - the XMl string to parse 
     * @returns {jQuery} the jQuery-wrapped XML document
     */
    function parse(str) {
        return $($.parseXML(str));
    }
    
    /**
     * Create a new XML node
     * @param str {string} the XML source
     * @returns {*} the jQuery wrapped XML node
     */
    function $node(str) {
        var document = $.parseXML(str);
        return $(document.childNodes[0]);
    }

    /**
     * Create a new, empty XML node with the given tag name  
     * @param name the tag name
     * @returns {*} the jQuery wrapped XML node
     */
    function $tag(name) {
        return $node('<' + name + '/>');
    }

    /**
     * Create a new XML text node
     * @param txt {String} the text content
     * @returns {*} the XML text node
     */
    function text(txt) {
        return tmpDoc().createTextNode(txt);
    }
    
    /**
     * Clone the given XML node
     * @param node the node the clone
     * @returns the cloned node
     */
    function clone(node) {
        return $node(serialize(node));
    }

    /**
     * Create a new CDATA section from the given text
     * @param str the text
     * @returns {CDATASection} the resulting XML CDATA node
     */
    function cdata(str) {
        return tmpDoc().createCDATASection(str);
    }

    /**
     * Replaces CDATA nodes with regular text nodes in the given XML fragment
     * @param node - the node to process recursively 
     * @param deep - whether to replace cdata in nested nodes 
     */
    function replaceCdataNodes(node, deep) {
        if (node) {
            var domNode = _unwrap(node);
            var CDATA = domNode.CDATA_SECTION_NODE;
            for (var i = domNode.childNodes.length - 1; i >= 0; i--) {
                var child = domNode.childNodes[i];
                if (child.nodeType === CDATA) {
                    var txt = text(child.nodeValue);
                    domNode.insertBefore(txt, child);
                    domNode.removeChild(child);
                } else if (deep && child.nodeType === domNode.ELEMENT_NODE || child.nodeType === domNode.DOCUMENT_NODE) {
                    replaceCdataNodes(child, deep);
                }
            }
        }
        return node;
    }
    
    /**
     * Remove all empty text nodes from the given XML document or node and trim all leading and trailing whitespace
     * for all other text nodes
     * @param n the XML document or node
     * @param exceptions on object for nodes to exclude from whitespace cleanup (keys correspond to node names, values
     * should be truthy)
     */
    function stripEmptyTextNodes(n, exceptions) {
        //IE <9 does not have TEXT_NODE
        var TEXT_NODE = n.TEXT_NODE || 3,
            i, child, childNodes = n.childNodes;
        for (i = childNodes.length - 1; i >= 0; i--) {
            child = childNodes[i];
            if (child !== undefined) {
                if (child.nodeType === TEXT_NODE) {
                    if (/^\s*$/.test(child.nodeValue)) {
                        n.removeChild(child);
                    } else {
                        child.nodeValue = $.trim(child.nodeValue);
                    }
                }
            }
        }
        childNodes = n.childNodes;
        if (childNodes.length === 0) {
            n.appendChild(text(''));
        } else {
            for (i = childNodes.length - 1; i >= 0; i--) {
                child = childNodes[i];
                if (child.nodeType === n.ELEMENT_NODE || child.nodeType === n.DOCUMENT_NODE) {
                    if (exceptions == null || !exceptions[child.nodeName]) {
                        stripEmptyTextNodes(child, exceptions);
                    }
                }
            }
        }
    }

    var INDENT = '  ';

    function indentTxt(level) {
        var txt = ['\n'], x = level;
        while (x--) {
            txt.push(INDENT);
        }
        return txt.join('');
    }

    function indent(n, level) {
        //IE <9 does not have TEXT_NODE
        var TEXT_NODE = n.TEXT_NODE || 3;

        for (var i = 0; i <= n.childNodes.length; i++) {
            var child1 = n.childNodes[i - 1], child2 = n.childNodes[i];
            if (child2 && child2.nodeType !== TEXT_NODE && ((!child1) || child1.nodeType !== TEXT_NODE)) {
                n.insertBefore(text(indentTxt(level)), child2);
            }
            if (i === n.childNodes.length && child1 && child1.nodeType !== TEXT_NODE) {
                n.appendChild(text(indentTxt(level - 1)));
            }
        }
        _.chain(n.childNodes).filter(function(c) {
            return c.nodeType === n.ELEMENT_NODE;
        }).each(function(c) {
                indent(c, level + 1);
            });
    }

    /**
     * Format the given jQuery-XML document by stripping out empty text nodes and indenting XML elements
     * @param $xml the jQuery-wrapped XML document
     * @param noStrip an array of node names to exclude from whitespace cleanup
     * @returns the formatted XML document
     */
    function formatXMLDocument($xml, noStrip) {
        if (!isDocument($xml)) {
            console.warn('Called formatXMLDocument with an argument which is not a XML document');
            return formatXML($xml);
        }
        stripEmptyTextNodes($xml[0], _.object(noStrip, noStrip));
        indent($xml[0].childNodes[0], 1);
        return $xml;
    }
    
    function formatXML($xml, noStrip) {
        stripEmptyTextNodes(_unwrap($xml), _.object(noStrip, noStrip));
        indent(_unwrap(isDocument($xml) ? root($xml) : $xml), 1);
        return $xml;
    }
    
    function formatDashboardXML($xml) {
        return formatXML($xml, ['html', 'delimiter', 'prefix', 'suffix']);
    }

    function isDocument(node) {
        var n = _unwrap(node);
        return n && n.nodeType === n.DOCUMENT_NODE;
    }
    
    function _unwrap(node) {
        return node instanceof $ ? node[0] : node;
    }
    
    /**
     * Serialize the given XML document to string
     * @param xml either a plain XML document or an jQuery-wrapped XML document
     * @returns {string} the formatted XML
     */
    function serialize(xml) {
        xml = _unwrap(xml);
        return Object.prototype.hasOwnProperty.call(xml, 'xml') ? xml.xml : new XMLSerializer().serializeToString(xml);
    }

    function serializeDashboardXML(xml, indent) {
        if (indent) {
            xml = formatDashboardXML(xml);
        }
        return serialize(xml);
    }
    
    /**
     * Utility method to inject a node into a container by inserting it before or after particular child elements of a
     * container. If none of the child elements can be found then a fallback can be used to either append or prepend the
     * element or to execute a function to run arbitrary alternative injection.
     *
     * @param options {object} - {
     *      node {Element}: the node to inject
     *      container {Element}: the container where the node is to be injected into
     *      where {String}: "after" or "before" - where, relative to the selectors should the node be injected
     *      selectors {Array}: child selectors of elements where node is to be injected before or after. The first match will
     *                 be used.
     *      fallback {String|Function}:
     * }
     * @returns {boolean} true if the node has been injected, false if not
     */
    function inject(options) {
        var node = options.node;
        var where = options.where;
        var container = options.container;
        var selectors = options.selectors || [];
        var fallback = options.fallback;
        var $container = $(container);
        for (var i = 0; i < selectors.length; i++) {
            var selector = selectors[i];
            var target = $container.children(selector);
            if (target.length) {
                target[where](node);
                return true;
            }
        }
        if (_.isString(fallback)) {
            $container[fallback](node);
            return true;
        } else if (_.isFunction(fallback)) {
            fallback($container, node);
            return true;
        }
        return false;
    }

    /**
     * Replace a child element matched by a selector within a container with a new node. If the no child element
     * matches the selector, then the new node is appended to the container.
     *
     * @param options {object} - {
     *      node {Element|Array|String} the node(s) to insert into the container
     *      container {element}: the container
     *      selector {String}: the child selector to use to match the elements to replace
     * }
     */
    function replaceOrAppend(options) {
        replaceOrInject(options.node, options.selector, options.container, 'append');
    }

    /**
     * Replace a child element matched by a selector within a container with a new node. If the no child element
     * matches the selector, then the new node is prepended to the container.
     *
     * @param options {object} - {
     *      node {Element|Array|String} the node(s) to insert into the container
     *      container {element}: the container
     *      selector {String}: the child selector to use to match the elements to replace
     * }
     */
    function replaceOrPrepend(options) {
        replaceOrInject(options.node, options.selector, options.container, 'prepend');
    }

    function replaceOrInject(node, selector, container, fallback) {
        var $container = $(container);
        var existing = $container.children(selector);
        if (existing.length) {
            $(_.rest(existing)).remove();
            $(existing.first()).replaceWith(node);
        } else {
            $container[fallback](node);
        }
    }

    /**
     * Get the root node of the given XML document
     * @param doc the xml document
     * @returns {*} the jQuery wrapped root node
     */
    function root(doc) {
        var docNode = _unwrap(doc);
        var rootEl;
        for (var i = docNode.childNodes.length; i;) {
            if (docNode.childNodes[--i].nodeType === docNode.ELEMENT_NODE) {
                rootEl = docNode.childNodes[i];
                break;
            }
        }
        return $(rootEl);
    }

    /**
     * Move all children from the source node to the destination node
     * @param src {*} the source node
     * @param dst {*} the destination node
     * @returns {*} the updated destination node
     */
    function moveChildren(src, dst) {
        src = $(src)[0];
        dst = $(dst)[0];
        while (src.firstChild) {
            dst.appendChild(src.firstChild);
        }
        return $(dst);
    }
    
    function parseSaxDocument(xml) {
        return SaxDom.parse(_.isString(xml) ? xml : serialize(xml));
    }
    
    return {
        parse: parse,
        $node: $node,
        $tag: $tag,
        text: text,
        cdata: cdata,
        replaceCdataNodes: replaceCdataNodes,
        stripEmptyTextNodes: stripEmptyTextNodes,
        formatXMLDocument: formatXMLDocument,
        formatXML: formatXML,
        serialize: serialize,
        formatDashboardXML: formatDashboardXML,
        serializeDashboardXML: serializeDashboardXML,
        clone: clone,
        inject: inject,
        replaceOrAppend: replaceOrAppend,
        replaceOrPrepend: replaceOrPrepend,
        root: root,
        moveChildren: moveChildren,
        parseSaxDocument: parseSaxDocument,
        SaxParserError: SaxDom.Error
    };
});