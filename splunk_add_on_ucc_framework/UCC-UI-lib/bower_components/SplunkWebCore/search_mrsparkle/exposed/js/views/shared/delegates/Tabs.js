/**
 *   views/shared/delegates/Tabs
 *
 *   Desc:
 *     This class applies tab behaviors.
 *     Based on Twitter Bootstrap's Collapse
 *     http://twitter.github.com/bootstrap/
 *
 *     @param {Object} (Optional) options An optional object literal having one settings.
 *
 *    Usage:
 *       var this.children.tabs = new TabsDelegate({options})
 *
 *    Options:
 *        el (required): The event delegate. To be more specific, it's the container the tabs will reside.
 *        toggle: jQuery selector for the toggle. It's wrapper/parent will receive the activated class.
 *        defaultToggle: jQuery selector or object for the initially selected tab. Default is the first tab.
 *        activeClass: allows for a custom active classname upon click
 *
 *    Methods:
 *        click: invoked when user clicks any of the tabs.
 *        show: select the current tab and trigger events(directly calling show should be avoided).
 */


define([
    'jquery',
    'underscore',
    'views/shared/delegates/Base'
],function(
    $,
    _,
    DelegateBase
){
    return DelegateBase.extend({
        initialize: function(){
            var defaults = {
                toggle: "> li > a",
                activeClass: "active",
                defaultToggle: null
            };

            _.defaults(this.options, defaults);
            this.options.defaultToggle = this.options.defaultToggle ? this.options.defaultToggle : $(this.el).children().first().find('a');

            this.events = {};
            this.events["click " + this.options.toggle] = "click";
            this.delegateEvents(this.events);

            this.show($(this.options.defaultToggle));
        },
        click: function (e) {
            e.preventDefault();
            this.trigger('toggle', e);
            var $toggle = $(e.currentTarget);

            //if the tab is already active, do nothing.
            if ($toggle.parent().hasClass(this.options.activeClass)) {
                return;
            }

            this.show($toggle);
            this.trigger('toggled', e);
        },
        show: function ($toggle) {
            this.trigger('show', $toggle);

            if($toggle.length > 0) {
                var that = this;
                $toggle.parent().siblings().each(function(index, element) {
                    var $li = $(element);
                    $li.removeClass(that.options.activeClass).removeAttr('data-tab-state');
                    $(that.getContentSelector($li.children('a'))).hide();
                });

                $toggle.parent().addClass(this.options.activeClass).attr('data-tab-state', this.options.activeClass);
                $(this.getContentSelector($toggle)).show();
            }

            this.trigger('shown', $toggle);
        },
        // helper to normalize getting the content selector from a tab label anchor tag
        // in IE7, the href will be expanded to a fully-qualified URL, so make sure to just use the fragment
        getContentSelector: function($a) {
            var href = $a.attr('href');
            return (href.indexOf('#') > -1) ? ('#' + href.split('#')[1]) : href;
        }

    });

});