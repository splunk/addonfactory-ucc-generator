define(
    [
        'jquery',
        'underscore'
    ],
    function(
        $,
        _
    ) {
        var SVG_NS = 'http://www.w3.org/2000/svg';

        var modifyClass = function($el, cls, add) {
            var currentClasses = $el.attr('class') || '',
                paddedClasses = ' ' + currentClasses + ' ',
                clsTrim = $.trim(cls),
                paddedCls = ' ' + clsTrim + ' ';

            if (add && paddedClasses.indexOf(paddedCls) === -1) {
                $el.attr('class', currentClasses + ' ' + clsTrim);
            } else if (!add && paddedClasses.indexOf(paddedCls) !== -1) {
                $el.attr('class', $.trim(paddedClasses.replace(paddedCls,'')));
            }
        };

        return {
            createElement: function(type) {
                return $(document.createElementNS(SVG_NS, type));
            },

            getBBox: function($el) {
                var getBBox = $el[0].getBBox,
                    bbox;

                // getBBox will not exist in Chrome and IE if
                // the svg element is not yet rendered.
                if (!_.isFunction(getBBox)) {
                    return {};
                }

                // This call will fail in firefox if the svg is
                // not rendered yet.
                try {
                    bbox = getBBox.apply($el[0]);
                } catch(e) {
                    return {
                        height: 0,
                        width: 0,
                        cx: 0,
                        cy: 0,
                        x2: 0,
                        y2: 0
                    };
                }

                return $.extend(bbox, {
                    cx: bbox.x + Math.floor(bbox.width / 2),
                    cy: bbox.y + Math.floor(bbox.height / 2),
                    x2: bbox.x + bbox.width,
                    y2: bbox.y + bbox.height
                });
            },

            addClass: function($el, cls) {
               modifyClass($el, cls, true);
            },

            removeClass: function($el, cls) {
                modifyClass($el, cls, false);
            },

            isSvgEl: function($el) {
                return ($el[0] && $el[0] instanceof SVGElement);
            }
        };
    }
);