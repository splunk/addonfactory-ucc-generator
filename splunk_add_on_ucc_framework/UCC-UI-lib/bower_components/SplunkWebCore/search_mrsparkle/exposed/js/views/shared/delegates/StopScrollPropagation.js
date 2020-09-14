/**
 *   views/shared/delegates/StopScrollPropagation
 *
 *   Desc:
 *     This class prevents the user from scrolling the page when scrolling a div.

 *   @param {Object} (Optional) options An optional object literal having one settings.
 *
 *    Usage:
 *       var p = new StopScrollPropagation({options})
 *
 *    Options:
 *        el (required): The event delegate.
 *        selector: jQuery selector for the scrolling elements. If not provided, all mousewheel events in the el will not propagate.
 *
 */


define(['jquery', 'underscore', 'views/shared/delegates/Base'], function($, _, DelegateBase) {
    return DelegateBase.extend({
        initialize: function(){
            var defaults = {
                selector: ""
            };
            _.defaults(this.options, defaults);

            this.events = {};
            this.events["mousewheel " + this.options.selector] = "mousewheel";
            this.events["DOMMouseScroll " + this.options.selector] = "mousewheel";
            this.delegateEvents(this.events);
        },
        mousewheel: function (e) {
            var delta = -e.originalEvent.wheelDelta || e.originalEvent.detail* 20;
            e.currentTarget.scrollTop += delta;
            e.stopPropagation();
            e.preventDefault();
        }

    });
});