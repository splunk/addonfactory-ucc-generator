define(function(require) {
    var _ = require('underscore');
    var AddContentUtils = {};

    var ELEMENTTYPES = _(["table", "single", "event", "chart", "html", "map", "viz"]);

    AddContentUtils.showMoreItems = function(e, collection, $el) {
        e.preventDefault();
        collection.fetchData.set('count', collection.fetchData.get('count') + collection.original_count);
        $el.find('.show-more').text(_('loading...').t());
    };

    AddContentUtils.highlightPanel = function($el) {
        _.defer(function(){
            $el.addClass('panel-highlight');
            _.delay(function(){
                $el.removeClass('panel-highlight');
            }, 2000);
        });
    };
    
    AddContentUtils.getPanelIcon = function(parsedPanel) {
        var elementChildren = AddContentUtils.getPanelElements(parsedPanel);
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
        else if (elementChildren[0].type === "viz") {
            return "icon-external-viz";
        }
        else if (elementChildren[0].type === "chart") {
            var subtype = elementChildren[0].settings['charting.chart'] || "column";
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
    };

    AddContentUtils.getPanelElements = function(parsedPanel) {
        return _(parsedPanel.children).filter(function (child) {
            return ELEMENTTYPES.contains(child.type);
        });
    };

    return AddContentUtils;

});
