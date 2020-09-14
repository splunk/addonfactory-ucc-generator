/**
 *   views/shared/delegates/Popdown
 *
 *   Desc:
 *     This class applies popdown menus and dialogs.

 *   @param {Object} (Optional) options An optional object literal having one settings.
 *
 *    Usage:
 *       var p = new Popdown({options})
 *
 *    Options:
 *        el (required): The dialog and toggle container. Recommend that this is the offset container for the dialog.
 *        toggle: jQuery selector for the toggles defaults to "> .popdown-toggle, > dropdown-toggle".
 *        dialog: jQuery selector or object for the dialog defaults to "> .popdown-dialog,  > dropdown-menu".
 *        arrow: jQuery selector or object for arrow that points up. Defaults to ".arrow".
 *        mode: menu (default) or dialog. Change to dialog to prevent clicks inside the dialog from closing the popdown.
 *        show: true or false (default). Open the menu on initialization.
 *        adjustPosition: true (default) or false. Adjust position will  keep the dialog within the screen margin.
 *        minMargin: Integer. The number of pixels between the edge of the screen and the dialog. Defaults to 20.
 *        detachDialog: false (default) or true.
 *                      Detach the dialog from its original parent element and re-attach to the closest appropriate ancestor.
 *                      This can be the body element, a modal body container, or any element with the "popdown-dialog-position-parent" class.
 *                      This can be useful to avoid hidden overflow issues, but should be used with care since any
 *                          scoped CSS selectors or event delegate listeners will no longer work.
 *        attachDialogTo: DEPRECATED, use detachDialog instead.
 *                        jQuery selector or object to attach the dialog element to, usually 'body'
 *                          this can be useful to avoid hidden overflow issues, but should be used with care since any
 *                          scoped CSS selectors or event delegate listeners will no longer work
 *        ignoreClasses: [] array of HTML classes to ignore clicks inside of so that the popdown does not close
 *        ignoreEscape: true or false (default). Ignore escape keypress within the popdown.
 *
 *    Methods:
 *        show: show the dialog (directly calling show should be avoided and should not be necessary).
 *        hide: hide the dialog.
 *        scrollToVisible: scrolls the page if necessary to show the entire dialog.
 */


define([
    'jquery',
    'underscore',
    'views/shared/delegates/Base',
    'views/shared/delegates/PopdownDialog'
],function(
    $,
    _,
    DelegateBase,
    PopdownDialog
){
    var popdown =  DelegateBase.extend({
        initialize: function() {
            var defaults = {
                toggle: "> [data-popdown-role=toggle], > [data-action=toggle], > .popdown-toggle, > .dropdown-toggle",
                dialog: "> [data-popdown-role=dialog], > [data-popdown-role=menu], > .popdown-dialog, > .dropdown-menu",
                arrow: "[data-popdown-role=arrow], .arrow",
                mode: "menu",  // "menu" or "dialog"
                adjustPosition: true,
                minMargin: 20,
                detachDialog: false,
                attachDialogTo: false,
                allowPopUp: true,
                ignoreClasses: [],
                ignoreEscape: false
            };

            _.defaults(this.options, defaults);

            this.children = {};
            this.events = {};
            this.events["mousedown " + this.options.toggle] = "toggle";
            this.events["keydown " + this.options.toggle] = "keydownToggle";
            this.events["click " + this.options.toggle] = "clickToggle";
            this.delegateEvents(this.events);
            this.$activeToggle = this.$(this.options.toggle).first();

            if (this.options.show) {
                this.show();
            }
        },
        startListening: function(options) {
            if (this.children.delegate) {
                this.listenTo(this.children.delegate, 'toggle', this.hearToggle);
                this.listenTo(this.children.delegate, 'toggled', this.hearToggled);
                this.listenTo(this.children.delegate, 'show', this.hearShow);
                this.listenTo(this.children.delegate, 'shown', this.hearShown);
                this.listenTo(this.children.delegate, 'hide', this.hearHide);
                this.listenTo(this.children.delegate, 'hidden', this.hearHidden);
            }
        },
        delegate: function() {
            if (!this.children.delegate) {
                var options = _(this.options).omit('attachDialogTo');
                options.el = (options.dialog instanceof $) ? options.dialog[0] : this.$(options.dialog)[0];
                this.children.delegate = new PopdownDialog(options);

                this.startListening();

                if (this.options.detachDialog) {
                    if (this.$activeToggle.length === 0) {
                        this.$activeToggle = this.$(this.options.toggle).first();
                    }
                    this.$activeToggle.closest('[data-popdown-role=position-parent], .popdown-dialog-position-parent, .dropdown-menu-position-parent, .modal, body')
                        .append(this.children.delegate.el);
                } else if (this.options.attachDialogTo) {
                    $(this.options.attachDialogTo).append(this.children.delegate.el);
                }
            }
            return this.children.delegate;
        },
        toggle: function(e) {
            e.preventDefault();

            if ($(e.currentTarget).is('.disabled, :disabled, [disabled=disabled]')) return;

            this.delegate().toggle($(e.currentTarget));

            return true;
        },
        hearToggle: function($toggle) {
            this.trigger('toggle', $toggle);
        },
        hearToggled: function($toggle) {
            this.trigger('toggled', $toggle);
        },
        show: function() {
            this.delegate().show(this.$activeToggle);
        },
        hearShow: function($toggle) {
            this.trigger('show', $toggle);

            $(window).on('resize.popdown.' + this.cid, this.windowResize.bind(this));
            this.$activeToggle.removeClass('active');
            this.$activeToggle = $toggle.addClass('active');

            if (this.$activeToggle.attr('data-popdown-role')) { //use attributes
                this.$activeToggle.attr('data-popdown-state', 'inactive');
                this.$activeToggle = $toggle.attr('data-popdown-state', 'active');
            } else {
                this.$activeToggle.removeClass('active');
                this.$activeToggle = $toggle.addClass('active');
            }

        },
        hearShown: function($toggle) {
            // Need to enable focus here so the list items are tabbable (508).
            // Consumers can listen to 'shown' on the popdown to trigger a more specific focus if they need.
            this.delegate().$el.find('a:not(.disabled):first').focus();
            this.trigger('shown', $toggle);
        },
        hide: function(e) {
            if (!this.delegate().isShown) return false;

            $(window).off('.' + this.cid);

            if ($.contains(this.children.delegate.el, $(':focus')[0])) {
                this.$activeToggle.focus();
            }
            this.children.delegate.hide();
        },
        clickToggle: function(e) {
            e.preventDefault();
        },
        keydownToggle: function(e) {
            var enterKeyCode = 13;
            if (e.keyCode == enterKeyCode)  {
                this.toggle(e);
            }
        },
        hearHide: function($toggle) {
            $(window).off('.popdown.' + this.cid);
            this.trigger('hide', $toggle);

            if (this.$activeToggle.attr('data-popdown-role')) { //use attributes
                this.$activeToggle.attr('data-popdown-state', 'inactive');
            } else {
                this.$activeToggle.removeClass('active');
            }
        },
        hearHidden: function($toggle) {
            this.trigger('hidden', $toggle);
        },
        stopListening: function() {
            this.children.delegate && this.children.delegate.remove();
            return DelegateBase.prototype.stopListening.apply(this, arguments);
        },
        adjustPosition: function() {
            this.delegate();
            this.children.delegate.adjustPosition(this.$activeToggle);
        },
        windowResize: function(e) {
            if (this.children.delegate && this.children.delegate.isShown) {
                this.adjustPosition(this.$activeToggle);
            }
        },
        pointTo: function($activeToggle) {
            this.$activeToggle = $activeToggle;
            this.delegate().adjustPosition(this.$activeToggle);
        },
        remove: function() {
            DelegateBase.prototype.remove.apply(this);
            this.children.delegate && this.children.delegate.remove();
            if (this.children.delegate && this.options.attachDialogTo) {
                this.children.delegate.$el.remove();
            }
            delete this.children.delegate;
            $(window).off('resize.popdown.' + this.cid);
            $(window).off('.' + this.cid);
            this.undelegateEvents();
            return this;
        },
        getPopdownDialogEl: function () {
            return this.children.delegate && this.children.delegate.el;
        },
        getPopdownEvents: function () {
            return this.children.delegate && this.children.delegate.events;
        },
        delegatePopdownEvents: function (events) {
            this.delegate().delegateEvents(events);
        }
    });

    return popdown;
});
