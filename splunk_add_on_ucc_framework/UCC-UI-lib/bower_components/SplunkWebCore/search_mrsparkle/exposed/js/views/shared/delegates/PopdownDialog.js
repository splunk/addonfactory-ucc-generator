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
 *        el (required): The dialog.
 *        arrow: jQuery selector or object for arrow that points up. Defaults to ".arrow".
 *        mode: menu (default) or dialog. Change to dialog to prevent clicks inside the dialog from closing the popdown.
 *        show: true or false (default). Open the menu on initialization.
 *        adjustPosition: true (default) or false. Adjust position will  keep the dialog within the screen margin.
 *        dialogResizes: true or false (default). When true and pointing down, always position from bottom instead of top.
 *        minMargin: Integer. The number of pixels between the edge of the screen and the dialog. Defaults to 20.
 *        ignoreClasses: [] array of HTML classes to ignore clicks inside of so that the popdown does not close
 *        ignoreToggleMouseDown: true or false (default). Ignore mousedown events on the toggle or toggle's children.
 *                              If ignoreToggleMouseDown is enabled, the PopTart will take no action when
 *                              clicking on the PopTart's toggle activator element. This allows the creator of the
 *                              PopTart to fully manage closing the opened PopTart.
 *        ignoreEscape: true or false (default). Ignore escape keypress within the popdown.
 *        scrollContainer: DEPRECATED, the desired scroll container should be given class "popdown-dialog-scroll-parent".
 *                         jQuery selector or object to find the scroll container for the dialog.
 *                         The dialog will listen for scroll events on this element and adjust its position.
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
    'util/string_utils',
    'util/keyboard',
    'util/svg'
],function(
    $,
    _,
    DelegateBase,
    string_utils,
    keyboard,
    svgUtil
){
    return DelegateBase.extend({
        initialize: function() {
            var defaults = {
                arrow: "[data-popdown-role=arrow], .arrow",
                mode: "dialog",  // "menu" or "dialog"
                adjustPosition: true,
                minMargin: 20,
                allowPopUp: true,
                dialogResizes: false,
                direction:'auto',
                zIndex:'auto',
                scrollContainer: '.modal-body-scrolling, .popdown-dialog-scroll-parent, .dropdown-menu-scroll-parent, [data-popdown-role=scroll-parent]',
                ignoreClasses: [],
                ignoreEscape: false
            };

            _.defaults(this.options, defaults);
            this.isShown = false;

            this.addEventHandlers = _.bind(this.addEventHandlers, this);
            this.dialogClick = _.bind(this.dialogClick, this);
            this.keepInBoundsDebounced =  _.debounce(this.keepInBounds, 100);

            // if this.$el doesn't already have an id, create a unique one (to be used in show())
            if (!this.$el.attr('id')) {
                this.$el.attr('id', 'dialog-' + this.cid);
            }

            if (this.options.show) {
                this.show(this.options.show);
            }
        },
        events: {
            'click': 'dialogClick',
            'keydown': function(e) {
                if (e.which === keyboard.KEYS.TAB) {
                    keyboard.handleCircularTabbing(this.$el, e);
                }
            },
            'keydown .close': function(e) {
                if (e.which === keyboard.KEYS.ENTER) {
                    //Prevent click event for anchor tags
                    e.preventDefault();
                    this.hide(e);
                }
            }
        },
        arrow: function() {
            return this.$el.find(this.options.arrow).first();
        },
        setScrollContainer: function($pointTo) {
            if (this.$scrollContainer) {
                return;
            }
            this.$scrollContainer = $pointTo.closest(this.options.scrollContainer);
            if (this.$scrollContainer.length === 0) {
                this.$scrollContainer = $(window);
            }
        },
        toggle: function($pointTo) {
            this.trigger('toggle', $pointTo);

            if (this.isShown) {
                this.hide();
            } else {
                this.show($pointTo);
            }

            this.trigger('toggled', $pointTo);

            return true;
        },
        show: function($pointTo, $toggle) {
            $toggle = $toggle || $pointTo;
            this.trigger('show', $pointTo);

            this.$pointTo = $pointTo;
            this.setScrollContainer($pointTo);

            if (!this.isShown) {
                _.defer(this.addEventHandlers, $toggle);
            }
            if (this.options.zIndex != 'auto') {
                this.$el.css('zIndex', this.options.zIndex);
            }

            this.options.adjustPosition && $pointTo && this.adjustPosition($pointTo);
            this.isShown = true;
            this.$el.addClass('open').show();
            // add a data attribute to map the toggle to the open dialog, this is for automated testing
            $pointTo.attr('data-dialog-id', this.$el.attr('id'));

            this.trigger('shown', $pointTo);
        },
        hide: function(e) {
            if (!this.isShown) {
                return false;
            }

            this.trigger('hide');

            this.removeEventHandlers();
            this.isShown = false;
            this.$el.removeClass('open').hide();

            this.trigger('hidden', e);
        },
        addEventHandlers: function($toggle) {
            $('html').on('mousedown.popdown.' + this.cid, function(e) {
                this.bodyMouseDown(e, $toggle);
            }.bind(this));
            $(window).on('keydown.' + this.cid, function(e) {
                this.windowKeydown(e, $toggle);
            }.bind(this));


            if (!this.$scrollContainer.is($(window))) {
                this.scrollPosition = {top: this.$scrollContainer.scrollTop(), left: this.$scrollContainer.scrollLeft()};
                this.$scrollContainer.on('scroll.' + this.cid, function(e) {
                    if (this.$pointTo) {
                        this.adjustPosition(this.$pointTo);
                    } else {
                        this.containerScroll(e);
                    }
                    this.keepInBoundsDebounced();
                }.bind(this));
            }

            return this;
        },
        removeEventHandlers: function() {
            $('html').off('.' + this.cid);
            $(window).off('.' + this.cid);
            if (this.$scrollContainer) {
                this.$scrollContainer.off('.' + this.cid);
            }
            return this;
        },
        deactivate: function() {
            this.hide();
            return DelegateBase.prototype.deactivate.apply(this, arguments);
        },
        stopListening: function() {
            this.removeEventHandlers();
            return DelegateBase.prototype.stopListening.apply(this, arguments);
        },
        measure: function($el, offsets) {
            var measures = {};

            if (svgUtil.isSvgEl($el)) {
                var bBox = svgUtil.getBBox($el);
                measures.width = bBox.width;
                measures.height = bBox.height;
            } else {
                measures.width = $el.outerWidth();
                measures.height = $el.outerHeight();
            }
            measures.halfHeight = measures.height /2;
            measures.halfWidth = measures.width / 2;

            if (offsets !== false) {
                measures.offset = $el.offset();
                measures.position = $el.position();
                measures.center = {
                    left: measures.offset.left + measures.halfWidth,
                    top: measures.offset.top + measures.halfHeight
                };
            }
            return measures;
        },
        adjustPosition: function($pointTo) {
            this.setScrollContainer($pointTo);
            var dir = this.options.direction;
            this['adjustPosition' + string_utils.capitalize(dir)]($pointTo);
        },
        adjustPositionAuto: function($pointTo) {
            this.$el.css({top: -9999, left: -9999, bottom: 'auto'});
            this.$el.show();

            var m = {}, //measurements
                shift = {left: 0, top:0}; //necessary corrections to fit in view
            var positionFromTop = true;

            m.toggle = this.measure($pointTo);
            m.dialog = this.measure(this.$el);
            m.arrow = this.measure(this.arrow(), false);
            m.window = this.measure($(window), false);
            m.window.top =  $(window).scrollTop();
            m.window.bottom = m.window.height + $(window).scrollTop();

            // Compensate for different offset parents.
            m.dialogParent = {offset: this.$el.offsetParent().offset()};
            m.toggle.relativeOffset = {
                                left: m.toggle.offset.left - m.dialogParent.offset.left + m.toggle.halfWidth,
                                top: Math.floor(m.toggle.offset.top - m.dialogParent.offset.top)
                            };

            //Determine if the default centering need to be shifted left or right
            if (m.toggle.center.left < m.dialog.halfWidth + this.options.minMargin) { //Needs to be pushed right
                shift.left = (m.dialog.halfWidth - m.toggle.center.left) + this.options.minMargin;
            } else if (m.toggle.center.left + m.dialog.halfWidth + this.options.minMargin  > m.window.width) { //Needs to be pushed left
                shift.left = $('body').outerWidth() - (m.toggle.center.left + m.dialog.halfWidth + this.options.minMargin);
            }
            shift.left=Math.round(shift.left);

            // Determine if there is enough room to pop down
            var popDownDialogBottom =  m.toggle.offset.top + m.toggle.height + m.dialog.height + this.options.minMargin;
            var popUpDialogTop =  m.toggle.offset.top - m.dialog.height -  this.options.minMargin;
            if (popDownDialogBottom > m.window.bottom && this.options.allowPopUp && popUpDialogTop > m.window.top ) {
                //Pop upward
                shift.top=-m.dialog.height - m.arrow.halfWidth;
                shift.bottom= m.toggle.height + m.arrow.halfWidth;
                this.$el.addClass('up');

                //If this hasn't been attached the body or some other element, set positionFromTop to false. It will be positioned from the bottom.
                //It's better to position from the bottom so dialogs that change height, like the timerangepicker, are correctly positioned.
                var $dialogParent = this.$el.parent();

                positionFromTop = this.options.dialogResizes || $dialogParent.is($pointTo.parent()) ? false : $dialogParent.is('body') || $dialogParent.is('.modal:visible');
            } else {
                //Pop downward
                shift.top= m.toggle.height;
                this.$el.removeClass('up');
                if (popDownDialogBottom > m.window.bottom) {
                    //Scroll
                    this.$scrollContainer.scrollTop(this.$scrollContainer.scrollTop() + popDownDialogBottom - m.window.bottom);

                    //reset the relative offsets
                    m.toggle.offset = $pointTo.offset();
                    m.toggle.relativeOffset.top = m.toggle.offset.top - m.dialogParent.offset.top;
                }
            }

            //Reset the position and center within the viewable area
            this.position = {
                 top:  positionFromTop ? shift.top + m.toggle.relativeOffset.top : 'auto',
                 left: m.toggle.relativeOffset.left,
                 marginLeft: - m.dialog.halfWidth + shift.left,
                 bottom: positionFromTop ? 'auto' : shift.bottom
                };

            this.$el.css(this.position);
            this.arrow().css('marginLeft', 0 - m.arrow.halfWidth - shift.left);

            //Fix left corner rounding if necessary
            if (m.dialog.halfWidth - m.arrow.halfWidth - shift.left < 8) { //Falling off the left
                this.$el.css('borderTopLeftRadius', Math.max(m.dialog.halfWidth - m.arrow.halfWidth - shift.left, 0));
            } else { //Needs to be pushed left
                this.$el.css('borderTopLeftRadius', '');
            }

        },
        adjustPositionRight: function($pointTo) {
            this.$el.addClass('right');
            this.$el.css({top: -9999, left: -9999});
            this.$el.show();

            var m = {}, //measurements
                shift = {left: 0, top:0}, //necessary corrections
                calculateTop = function() {
                    return Math.round(shift.top) + m.toggle.relativeOffset.top - m.dialog.halfHeight + m.toggle.halfHeight;
                }.bind(this);

            m.toggle = this.measure($pointTo);
            m.dialog = this.measure(this.$el);
            m.arrow = this.measure(this.arrow(), false);
            m.window = this.measure($(window), false);
            m.window.top =  $(window).scrollTop();
            m.window.bottom = m.window.height + $(window).scrollTop();
            m.arrow.minMargin = 10;
            m.arrow.maxShift = m.dialog.halfHeight - m.arrow.halfHeight - m.arrow.minMargin;

            // Compensate for different offset parents.
            m.dialogParent = {offset: this.$el.offsetParent().offset()};
            m.toggle.relativeOffset = {
                                left: m.toggle.offset.left - m.dialogParent.offset.left + m.toggle.width,
                                top: Math.floor(m.toggle.offset.top - m.dialogParent.offset.top)
                            };

            //Determine if the default centering need to be shifted up or down
            if (m.toggle.center.top - m.window.top < m.dialog.halfHeight + this.options.minMargin) { //Needs to be down
                shift.top = (m.dialog.halfHeight - (m.toggle.center.top - m.window.top)) + this.options.minMargin;
            } else if (m.toggle.center.top + m.dialog.halfHeight+ this.options.minMargin  > m.window.bottom ) { //Needs to be pushed up
                shift.top = m.window.bottom - (m.toggle.center.top + m.dialog.halfHeight + this.options.minMargin);
            }

            //Make sure it's not partially hidden over the top of page
            if (calculateTop() < this.options.minMargin) {
                shift.top = shift.top + (this.options.minMargin - calculateTop());
            }

            //Determine if there is sufficient room to include the point
            if (shift.top > m.arrow.maxShift) { //Needs to be down
                shift.top -= shift.top - m.arrow.maxShift;
            } else if (-shift.top > m.arrow.maxShift) { //Needs to be pushed up
                shift.top -= shift.top+m.arrow.maxShift;
            }

            //Reset the position and center within the viewable area
            this.position = {
                 top: calculateTop(),
                 left: m.toggle.relativeOffset.left, marginLeft: m.arrow.halfWidth
                };


            this.$el.css(this.position);
            this.arrow().css('marginTop', 0 - m.arrow.halfHeight - shift.top);

        },
        containerScroll: function(e)  {
            var newScrollTop = this.$scrollContainer.scrollTop(),
                newScrollLeft = this.$scrollContainer.scrollLeft();

            this.position.top = this.position.top + (this.scrollPosition.top - newScrollTop);
            this.position.left = this.position.left + (this.scrollPosition.left  - newScrollLeft);
            this.$el.css(this.position);

            this.scrollPosition = {top: newScrollTop, left: newScrollLeft};
        },
        keepInBounds: function(e)  {
            // if it is no longer pointing at something shown in the view container, close;
            var containerTop = this.$scrollContainer.offset().top,
                containerBottom  = containerTop + this.$scrollContainer.outerHeight(),
                elEdge = this.$el.hasClass('up') ? this.$el.offset().top + this.$el.outerHeight() : this.$el.offset().top; // use the bottom edge when popping upward

            if (elEdge < containerTop || elEdge > containerBottom) {
                this.hide();
            }

        },
        bodyMouseDown: function(e, $toggle) {
            var $target = $(e.target);

            // If the menu is already closed, don't do anything.
            if (!this.isShown) {
                return;
            }

            // Ignore clicks on the toggle or toggle's children.
            if (this.options.ignoreToggleMouseDown && $toggle && (($target[0] === $toggle[0]) || $toggle.has($target).length)) {
                return;
            }

            // Ignore clicks inside of the dialog
            if ($.contains(this.$el[0], e.target) || e.target === this.$el[0]) {
                return;
            }

            // Ignore clicks inside of sibling dialogs appended after this dialog.
            // This handles the case of logically nested popdown dialogs that are physically appended to the body.
            // Clicks inside of logically nested dialogs should not close their logical parent dialog. But clicks
            // inside the parent dialog should allow the nested dialog to close. In theory, a nested dialog must
            // be opened after its parent dialog, which means it will be appended to the body after its parent.
            // Therefore, ignoring clicks on dialogs that are physical siblings of this dialog, but are appended
            // afterwards in the dom, will only ignore dialogs that are logically nested inside this dialog.
            var $siblingDialog = $target.closest(".popdown-dialog");
            if ($siblingDialog.length && ($siblingDialog[0].parentNode === this.$el[0].parentNode) && ($siblingDialog.index() > this.$el.index())) {
                return;
            }

            //Ignore clicks on elements with classes specified in this.options.ignoreClasses
            for(var i = 0; i < this.options.ignoreClasses.length; i++){
                if ($target.closest("." + this.options.ignoreClasses[i]).length) {
                    return;
                }
            }

            this.hide(e);
        },
        dialogClick: function(e) {
            if (this.options.mode != "dialog") {
                var $target = $(e.target);
                //Ignore clicks on elements with classes specified in this.options.ignoreClasses
                for(var i = 0; i < this.options.ignoreClasses.length; i++){
                    if ($target.closest("." + this.options.ignoreClasses[i]).length) {
                        return;
                    }
                }
                this.hide(e);
            }
        },
        windowKeydown: function(e, $toggle) {
            var escapeKeyCode = 27,
                enterKeyCode = 13;

            if (!this.options.ignoreEscape && e.keyCode == escapeKeyCode)  {
                this.hide();
                return true;
            }

            if (e.keyCode == enterKeyCode)  {
                this.bodyMouseDown(e, $toggle);
            }

            return true;
        },
        pointTo: function($pointTo) {
            if (!this.isShown) {
                this.show($pointTo);
            } else {
                this.adjustPosition($pointTo);
            }
        }
    });
});
