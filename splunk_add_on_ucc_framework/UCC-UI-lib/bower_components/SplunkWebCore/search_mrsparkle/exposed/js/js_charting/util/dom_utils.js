define(['jquery', 'underscore'], function($, _) {

    // set up some aliases for jQuery 'on' that will work in older versions of jQuery
    var jqOn = _($.fn.on).isFunction() ? $.fn.on : $.fn.bind;
    var jqOff = _($.fn.off).isFunction() ? $.fn.off : $.fn.unbind;

    // a cross-renderer way to update a legend item's text content
    var setLegendItemText = function(legendItem, text) {
        if(legendItem.attr('text') === text) {
            return;
        }
        legendItem.added = true; // the SVG renderer needs this
        legendItem.attr({text: text});
    };

    var hideTickLabel = function(tick) {
        var label = tick.label,
            nodeName = tick.label.element.nodeName.toLowerCase();

        if(nodeName === 'text') {
            label.hide();
        }
        else {
            $(label.element).hide();
        }
    };

    var showTickLabel = function(tick) {
        var label = tick.label,
            nodeName = tick.label.element.nodeName.toLowerCase();

        if(nodeName === 'text') {
            label.show();
        }
        else {
            $(label.element).show();
        }
    };

    return ({

        jQueryOn: jqOn,
        jQueryOff: jqOff,
        setLegendItemText: setLegendItemText,
        hideTickLabel: hideTickLabel,
        showTickLabel: showTickLabel

    });

});