/**
 *   views/shared/delegates/concertina
 *
 *   Desc:
 *     This class applies concertina behaviors.
 *     Default markup is based on Twitter Bootstrap's Collapse
 *     http://twitter.github.com/bootstrap/
 *
 *     @param {Object} (Optional) options An optional object literal having one or more settings.
 *
 *    Usage:
 *       var p = new Concertina({options})
 *
 *    Options:
 *        el (required): The event delegate.
 *        group: jQuery selector for the toggle and body wrapper ".concertina-group".
 *        toggle: jQuery selector for the concertina group's toggle. Defaults to ".concertina-toggle".
 *        body: jQuery selector for the concertina group's body. Defaults to ".concertina-body".
 *        default: jQuery selector or object for the default group. Defaults to ".concertina-group:first-child".
 *
 *    Methods:
 *        show: show a panel. Parameters are the group, which can be a selector or jQuery object, and a boolean to enable or disable animation.
 */


define([
    'jquery',
    'underscore',
    'views/shared/delegates/Base',
    './Concertina.pcss'
],function(
    $,
    _,
    DelegateBase,
    css
){
    return DelegateBase.extend({
        initialize: function(){
            var defaults = {
                body: ".concertina-body",
                group: ".concertina-group",
                heading: ".concertina-heading",
                toggle: ".concertina-toggle",
                groupBody: ".concertina-group-body",
                dockTop: ".concertina-dock-top",
                dockBottom: ".concertina-dock-bottom",
                icon: ".icon-concertina-toggle",
                activeClass: "active",
                speedMin: 100,
                speedMax: 300,
                speedMinDistance: 200,
                speedMaxDistance: 800,
                easing: 'swing'
            };

            _.defaults(this.options, defaults);

            this.events= {};
            this.events['click ' + this.options.body + ' ' + this.options.toggle] = 'clickToggle';
            this.events['click '  + this.options.dockTop + ' ' + this.options.toggle] = 'clickToggleTop';
            this.events['click ' + this.options.dockBottom + ' ' + this.options.toggle] = 'clickToggleBottom';
            _.defer(this.delegateEvents.bind(this), this.events);

            this.measurements = {};
            this.elements = {};

            this.reset();
            $(window).on('resize.' + this.cid, this.reset.bind(this));

        },
        clickToggleTop: function(e) {
            e.preventDefault();

            var $el = $(e.currentTarget),
                $original = $el.parent().data('original'),
                topMargin = $el.parent().position().top,
                scrollFrom = this.elements.$body.scrollTop(),
                scrollTo = $original.position().top - topMargin + scrollFrom;

            this.elements.$body.animate({'scrollTop': scrollTo}, this.adjustSpeed(scrollFrom, scrollTo), this.options.easing);
        },
        clickToggle: function(e) {
            e.preventDefault();
            this.scrollUp($(e.currentTarget).closest(this.options.group), this.elements.$bottomDock.outerHeight());
        },
        clickToggleBottom: function(e) {
            e.preventDefault();

            var $el = $(e.currentTarget),
                $group = $(e.currentTarget).parent().data('original').closest(this.options.group);

            this.scrollUp($group, $group.nextAll().length * $el.outerHeight());
        },
        scrollUp: function($group, bottomMargin) {
            var concertinaHeight = this.elements.$body.height(),
                scrollFrom = this.elements.$body.scrollTop(),
                scrollTo = $group.height() + ($group.position().top + scrollFrom) - concertinaHeight + bottomMargin,
                topMargin = $group.prevAll().length * ($group.find(this.options.toggle).outerHeight() -1),
                groupTop = $group.position().top;

            //if it's already in view, don't do anything
            if (scrollFrom > scrollTo) {
                return;
            }

            //ensure there is enough room to scrollUp
            if (groupTop + scrollFrom  < scrollTo + topMargin) {
                scrollTo = scrollFrom + groupTop - topMargin;
            }

            this.elements.$body.animate({'scrollTop': scrollTo}, this.adjustSpeed(scrollFrom, scrollTo), this.options.easing);
        },
        adjustSpeed: function(from, to) {
            //Map the distance to the min/max speed based on the min/max distance
            var distance = Math.abs(from - to),
                speed = (distance-this.options.speedMinDistance)/(this.options.speedMaxDistance-this.options.speedMinDistance) * (this.options.speedMax-this.options.speedMin) + this.options.speedMin;
            return Math.min(Math.max(speed, this.options.speedMin), this.options.speedMax);
        },
        reset: function() {
            this.elements.$body = this.$(this.options.body);
            this.elements.$body.off('scroll.' + this.cid);
            this.elements.$body.on('scroll.' + this.cid, this.updateDocking.bind(this));

            this.elements.$headings = this.elements.$body.find(this.options.heading);
            this.measurements.scrollBarWidth = this.elements.$body.parent().width() - this.elements.$headings.first().width();
            this.elements.$topDock = this.$(this.options.dockTop).css('right', this.measurements.scrollBarWidth + 'px').html('');
            this.elements.$bottomDock = this.$(this.options.dockBottom).css('right', this.measurements.scrollBarWidth + 'px').html('');
            this.measurements.containerHeight = this.$el.height();

            this.updateDocking();
        },
        updateDocking: function() {
            this.elements.$topDock.html('');
            this.elements.$bottomDock.html('');

            //Top Dock
            this.elements.$headings.each(function(index, element) {
                var $el = $(element);
                if ($el.position().top < this.elements.$topDock.height()) {
                    $el.clone().appendTo(this.elements.$topDock).data('original', $el);
                }
            }.bind(this));

            //Bottom Dock
            $(this.elements.$headings.get().reverse()).each(function(index, element) {
                var $el = $(element);
                if ($el.position().top + $el.height() > this.measurements.containerHeight - this.elements.$bottomDock.height()) {
                    $el.clone().prependTo(this.elements.$bottomDock).data('original', $el);
                }
            }.bind(this));
        },
        remove: function() {
            DelegateBase.prototype.remove.apply(this);
            $(window).off('resize.' + this.cid);
            this.elements.$body && this.elements.$body.off('scroll.' + this.cid);
            return this;
        }
    });
});
