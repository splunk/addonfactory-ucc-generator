/**
 * PopTart.show() now has the following signature:
 *
 * show($pointTo[, options])
 *
 * Where the options are:
 *
 * $toggle: Clicking on this element will trigger opening and closing of the PopTart. Defaults to the $pointTo element.
 * $onOpenFocus: When the PopTart opens, this element is then given focus. Defaults to the first anchor element inside the opened PopTart.
 * $onCloseFocus: When the PopTart closes, this element is then given focus. Defaults to the $toggle element.
 * $onClickCloseFocus: When the PopTart closes via a click event, this element is then given focus. Defaults to the $onCloseFocus element.
 */

define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/MenuDialog',
        'views/shared/delegates/PopdownDialog'
    ],
    function($, _, module, MenuDialogView, PopdownDialogDelegate) {
        return MenuDialogView.extend({
            moduleId: module.id,
            className: 'popdown-dialog',
            useLocalClassNames: false,
            initialize: function() {
                var defaults = {
                    direction:'auto',
                    adjustPosition: true,
                    mode: 'dialog'
                };
                _.defaults(this.options, defaults);

                MenuDialogView.prototype.initialize.apply(this, arguments);
                this.children.popdownDialogDelegate = new PopdownDialogDelegate({
                    el: this.el,
                    ignoreClasses: this.options.ignoreClasses,
                    adjustPosition: this.options.adjustPosition,
                    show: this.options.show,
                    mode: this.options.mode, // "menu" or "dialog"
                    direction: this.options.direction,
                    arrow: this.options.arrow,
                    minMargin: this.options.minMargin,
                    allowPopUp: this.options.allowPopUp,
                    scrollContainer: this.options.scrollContainer,
                    /**
                     * If ignoreToggleMouseDown is enabled, the PopTart will take no action when
                     * clicking on the PopTart's toggle activator element. This allows the
                     * creator of the PopTart to fully manage closing the opened PopTart.
                     */
                    ignoreToggleMouseDown: this.options.ignoreToggleMouseDown
                });
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.children.popdownDialogDelegate, 'all', function() {
                    this.trigger.apply(this, arguments);
                });
                this.listenTo(this, 'shown', function() {
                    this.shown = true;
                    if (this.$onOpenFocus) {
                        this.$onOpenFocus.focus();
                    } else {
                        this.children.popdownDialogDelegate.$el.find('a').first().focus();
                    }

                    $(window).on('resize.' + this.cid, this.onWindowResize.bind(this));
                });
                this.listenTo(this, 'hidden', function(e) {
                    this.shown = false;
                    if (this.options.onHiddenRemove) {
                        this.remove();
                    }

                    $(window).off("resize." + this.cid);

                    //Focus on activator
                    var x = window.pageXOffset,
                        y = window.pageYOffset;
                    if (e && e.type === 'mousedown') {
                        // if there's no other element to focus on use the $onClickCloseFocus
                        if ($(e.target).closest(':focusable').length === 0) {
                            this.$onClickCloseFocus.focus();
                        }
                    } else {
                        this.$onCloseFocus.focus();
                    }
                    window.scrollTo(x, y);
                });
            },
            toggle: function() {
                return this.children.popdownDialogDelegate.toggle();
            },
            show: function($pointTo, options) {
                options = options || {};

                this.$pointTo = $pointTo;
                this.$toggle = options.$toggle || this.$pointTo;
                this.$onOpenFocus = options.$onOpenFocus || this.$onOpenFocus;
                this.$onCloseFocus = options.$onCloseFocus || this.$toggle;
                this.$onClickCloseFocus = options.$onClickCloseFocus || this.$onCloseFocus;

                this.children.popdownDialogDelegate.show(this.$pointTo, this.$toggle);
            },
            hide: function(e) {
                this.children.popdownDialogDelegate.hide(e);
            },
            render: function() {
                this.el.innerHTML = this.template;
                return this;
            },
            remove: function() {
                if (this.shown) {
                    this.hide();
                }
                MenuDialogView.prototype.remove.apply(this, arguments);
            },
            onWindowResize: function() {
                this.children.popdownDialogDelegate.adjustPosition(this.$pointTo);
            },
            template: '\
                <div class="arrow"></div>\
                <div class="popdown-dialog-body popdown-dialog-padded"></div>\
            ',
            template_menu: '\
                <div class="arrow"></div>\
            '
        });
    }
);
