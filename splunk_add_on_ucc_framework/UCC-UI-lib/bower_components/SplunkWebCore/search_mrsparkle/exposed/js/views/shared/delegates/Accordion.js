/**
 *   views/shared/delegates/Accordion
 *
 *   Desc:
 *     This class applies accordion behaviors.
 *     Default markup is based on Twitter Bootstrap's Collapse
 *     http://twitter.github.com/bootstrap/
 *
 *     @param {Object} (Optional) options An optional object literal having one or more settings.
 *
 *    Usage:
 *       var p = new Popdown({options})
 *
 *    Options:
 *        el (required): The event delegate.
 *        group: jQuery selector for the toggle and body wrapper ".accordion-group".
 *        toggle: jQuery selector for the accordion group's toggle. Defaults to ".accordion-toggle".
 *        body: jQuery selector for the accordion group's body. Defaults to ".accordion-body".
 *        default: jQuery selector or object for the default group. Defaults to ".accordion-group:first-child".
 *        collapsible: Will allow for each to open/close on each's own w/o others toggling
 *
 *    Methods:
 *        show: show a panel. Parameters are the group, which can be a selector or jQuery object, and a boolean to enable or disable animation.
 */


define([
    'jquery',
    'underscore',
    'views/shared/delegates/Base',
    'views/shared/Icon'
],function(
    $,
    _,
    DelegateBase,
    Icon
){
    return DelegateBase.extend({
        initialize: function(){
            var defaults = {
                group: ".accordion-group, [data-accordion-role=group]",
                toggle: ".accordion-toggle, [data-accordion-role=toggle]",
                body: ".accordion-body, [data-accordion-role=body]",
                defaultGroup: ".accordion-group:first-child, [data-accordion-role=group]:first-child",
                icon: ".icon-accordion-toggle, [data-accordion-role=toggle-icon]",
                inactiveIconClass: "icon-triangle-right-small",
                activeIconClass: "icon-triangle-down-small",
                inactiveIconName: "triangleRightSmall",
                activeIconName: "triangleDownSmall",
                activeClass: "active",
                collapsible: false,
                speed: 300
            };

            _.defaults(this.options, defaults);

            this.events = {};
            this.events["click " + this.options.toggle] = "toggle";

            //setup
            this.children.iconInactive = new Icon({icon: this.options.inactiveIconName}).render().$el.attr('data-accordion-role', 'toggle-icon');
            this.children.iconActive = new Icon({icon: this.options.activeIconName}).render().$el.attr('data-accordion-role', 'toggle-icon');

            //show the default group, hide the others
            this.hideGroup(this.$(this.options.group), false);
            this.showGroup(this.$(this.options.defaultGroup), false);
        },
        toggle: function (e) {
            e.preventDefault();
            var $group = $(e.currentTarget).closest(this.options.group);

            if (this.options.collapsible) {
                this.trigger('toggle');
                this.toggleGroup($group);
                this.trigger('toggled');
                return;
            }

            //if the group is already active, do nothing.
            if ($group.hasClass(this.options.activeClass) || $group.attr('data-active')) {
                return;
            }

            this.trigger('toggle');
            this.switchToGroup($group, true);
            this.trigger('toggled');
        },
        // Aliased for legacy support
        show: function (group, animate) {
            this.switchToGroup($(group), animate);
        },
        switchToGroup: function ($group, animate) {
            var $activeGroup = this.$(this.options.group + '.' + this.options.activeClass + ', [data-active][data-accordion-role=group]');

            //ignore if the item is already active.
            this.trigger('show');
            this.trigger('hide');

            this.hideGroup($activeGroup, animate);
            this.showGroup($group, animate);
        },
        toggleGroup: function($group) {
            if ($group.hasClass(this.options.activeClass) || $group.attr('data-active')) {
                this.hideGroup($group);
            } else {
                this.showGroup($group);
            }
            this.trigger('toggled');
        },
        showGroup: function($group, animate) {
            var that = this,
                complete = function () {
                  that.trigger('shown');
                };

            if ($group.attr('data-accordion-role') == 'group') {
                $group.find(this.options.icon).replaceWith(this.children.iconActive.clone());
                $group.attr('data-active', 'active');
            } else {
                    $group.find(this.options.icon).addClass(this.options.activeIconClass).removeClass(this.options.inactiveIconClass);
                $group.addClass(this.options.activeClass);
            }

            if (animate !== false) {
                $group.find(this.options.body).slideDown({duration:this.options.speed, queue: false, complete:complete});
            } else {
                $group.find(this.options.body).show();
                complete();
            }
        },
        hideGroup: function($group, animate) {
            var that = this,
                complete = function () {
                    that.trigger('hidden');
                };

            if ($group.attr('data-accordion-role') == 'group') {
                $group.find(this.options.icon).replaceWith(this.children.iconInactive.clone());
                $group.removeAttr('data-active');
            } else {
                $group.find(this.options.icon).addClass(this.options.inactiveIconClass).removeClass(this.options.activeIconClass);
                $group.removeClass(this.options.activeClass);
            }

            if (animate !== false) {
                $group.find(this.options.body).slideUp({duration:this.options.speed, queue: false, complete:complete});
            } else {
                $group.find(this.options.body).hide();
                complete();
            }
        }
    });
});
