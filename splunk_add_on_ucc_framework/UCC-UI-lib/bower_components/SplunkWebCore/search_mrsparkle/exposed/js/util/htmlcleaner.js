define(['underscore', 'jquery'], function (_, $) {

    var HTML_COMMENTS_PATTERN = /<!--.+?-->/gmi;
    var BAD_NODE_SELECTOR = 'script,link,meta,head,*[type="text/javascript"]';
    //var ALLOWED_URLS = /^(?:\/[^\/]|https?:|#)/g;
    var BAD_URL_SCHEMES = /^(?:javascript|jscript|livescript|vbscript|data|about|mocha):/i;
    var EVENT_HANDLER_ATTRIBUTE_PREFIX = "on";
    var CSS_NODE_SELECTOR = 'style';
    var CSS_EXPRESSION_PATTERN = /(^|[\s\W])expression(\s*\()/gmi;
    var CSS_EXPRESSION_REPLACE = '$1no-xpr$2';
    var URL_ATTRIBUTES = {
        link: ['href'],
        applet: ['code', 'object'],
        iframe: ['src'],
        img: ['src'],
        embed: ['src'],
        layer: ['src'],
        a: ['href']
    };

    function removeBadNodes($root) {
        if($root.is(BAD_NODE_SELECTOR)) {
            return $([]);
        }
        $root.find(BAD_NODE_SELECTOR).remove();
        return $root;
    }

    function cleanupUrl(url) {
        return decodeURIComponent(_.unescape($.trim(url || ''))).replace(/\s/gmi, '');
    }

    function isBadUrl(url) {
        return BAD_URL_SCHEMES.test(cleanupUrl(url));
    }

    function cleanAttributes($root) {
        _($root).each(function (node) {
            var $node = $(node),
                nodeName = (node.tagName||'').toLowerCase(),
                attrs = node.attributes,
                badNodes= [];
            _.each(attrs, function (attr) {
                if (attr) {
                    var attrName = attr.name.toLowerCase();
                    if (attrName.indexOf(EVENT_HANDLER_ATTRIBUTE_PREFIX) === 0) {
                        badNodes.push(attr.name);
                    } else {
                        var urlAttrs = URL_ATTRIBUTES[nodeName];
                        if (urlAttrs && _(urlAttrs).contains(attrName)) {
                            if (isBadUrl(attr.value)) {
                                $node.attr(attr.name, '#');
                            }
                        }
                    }
                }
            });

            // removal of nodes needs to happen after the node check occurs
            _.each(badNodes, function (attr) {
                $node.removeAttr(attr);
            });

            _($node.children()).chain().map($).each(cleanAttributes);
        });
    }

    function stripComments(txt) {
        return txt.replace(HTML_COMMENTS_PATTERN, '');
    }

    function cleanStylesheets($root) {
        _($('<div />').append($root).find(CSS_NODE_SELECTOR)).each(cleanStylesheet);
    }
    
    function cleanStylesheet(styleNode) {
        var $style = $(styleNode);
        var cssText = $style.html();
        var newText = cleanCssText(cssText);
        if (cssText != newText) {
            $style.text(newText);
        }
    }

    function cleanCssText(cssText) {
        CSS_EXPRESSION_PATTERN.lastIndex = 0;
        return cssText.replace(CSS_EXPRESSION_PATTERN, CSS_EXPRESSION_REPLACE);
    }

    function cleanInlineStyles($html) {
        $html.find('[style]').removeAttr('style');
    }

    /**
     *
     * @param htmlText {string}
     * @param options {object}
     * @param options.allowInlineStyles {boolean}
     * @returns {*}
     */
    function cleanHtml(htmlText, options) {
        options || (options = {});
        // debugger
        var $html = $(stripComments("<div>" + htmlText + "</div>"));
        $html = removeBadNodes($html);
        cleanAttributes($html);
        cleanStylesheets($html);
        if (options.allowInlineStyles === false) {
            cleanInlineStyles($html);
        }
        return $html.html();
    }

    return {
        clean: cleanHtml,
        isBadUrl: isBadUrl,
        _stripComments: stripComments,
        _cleanAttributes: cleanAttributes,
        _removeScripts: removeBadNodes,
        _cleanStylesheets: cleanStylesheets,
        _cleanCssText: cleanCssText
    };

});