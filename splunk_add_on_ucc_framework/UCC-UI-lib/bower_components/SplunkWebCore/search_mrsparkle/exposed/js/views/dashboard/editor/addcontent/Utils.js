define(
    [
        'jquery',
        'underscore',
        'util/splunkd_utils'
    ],
    function($,
             _,
             splunkd_utils) {

        var ELEMENTTYPES = _(["table", "single", "event", "chart", "html", "map", "viz"]);

        return {
            getPanelIcon: function(parsedPanel) {
                var elementChildren = this.getPanelElements(parsedPanel);
                if (elementChildren.length === 0) {
                    return "icon-panel";
                }
                else if (elementChildren[0].type === "single") {
                    return "icon-single-value";
                }
                else if (elementChildren[0].type === "map") {
                    return "icon-location";
                }
                else if (elementChildren[0].type === "table") {
                    return "icon-table";
                }
                else if (elementChildren[0].type === "event") {
                    return "icon-list";
                }
                else if (elementChildren[0].type === "html") {
                    return "icon-code";
                }
                else if (elementChildren[0].type === "chart") {
                    var reportContent = elementChildren[0].reportContent || {};
                    var subtype = reportContent['display.visualizations.charting.chart'] || "column";
                    switch (subtype) {
                        case 'radialGauge':
                            return 'icon-gauge-radial';
                        case 'fillerGauge':
                            return 'icon-gauge-filler';
                        case 'markerGauge':
                            return 'icon-gauge-marker';
                        default:
                            return 'icon-chart-' + subtype;
                    }
                }
                return "icon-panel";
            },
            getPanelElements: function(parsedPanel) {
                return _(parsedPanel.children).filter(function(child) {
                    return ELEMENTTYPES.contains(child.type);
                });
            },
            /**
             * detect whether a panel can be cloned.
             * @param {Object} parsedPanel
             * @returns {null|String} If panel can be cloned, returns null; if panel cannot be cloned, returns a string
             * indicating the reason why it cannot be cloned.
             */
            hasCloneRestriction: function(parsedPanel) {
                var containsPostprocess = _(this.getPanelElements(parsedPanel)).some(function(element) {
                    return this.containsPostprocess(element);
                }, this);

                if (containsPostprocess) {
                    return _('Panel cannot be cloned because it includes one or more post-process searches.').t();
                }

                return null;
            },
            containsPostprocess: function(parsedElement) {
                return _(parsedElement.children).some(function(child) {
                    return child.type === 'postprocess-search';
                });
            }
        };
    });