/**
 *   views/shared/delegates/ModalTimerangePicker
 *
 *   Desc:
 *     Work in progress, a delegate view to handle timerange pickers located in modals. 
 *       It provides the animation from the content view to the timerangepicker view and back. 
 *
 *   @param {Object} (Optional) options An optional object literal having one settings.
 *
 *    Usage:
 *       var p = new ModalTimerangePicker({options})
 *
 *    Options:
 *        el: The dialog and toggle container. Recommend that this is the offset container for the dialog.
 *        $visArea: jQuery object that is the visible area.
 *        $slideArea: jQuery object that slides left and right.
 *        $contentWrapper: jQuery object that holds the original content with the activator.
 *        $timeRangePickerWrapper: jQuery object that holds the timerange picker.
 *        $modalParent: jQuery object of the modal.
 *        $timeRangePicker: jQuery object of the timerange picker.
 *        activateSelector: jQuery selector that when clicked causes the animation to the timerangepicker.
 *        backButtonSelector: jQuery selector that when clicked causes the animation from the timerangepicker
 *                               back to the content view without changing the timerange.
 *        SLIDE_ANIMATION_DURATION: (Optional) time to perform animation. Default 500.
 *
 *    Methods:
 *        showTimeRangePicker: animates to the timerangepicker from content view.
 *        closeTimeRangePicker: animates from the timerangepicker to content view.
 *                               Should be called when applied is triggered on the timerange model.
 *        onBeforePaneAnimation: sets up for animation (directly calling show should be avoided and should not be necessary).
 *        onAfterPaneAnimation: clean up after animation (directly calling show should be avoided and should not be necessary).
 */


define([
    'jquery',
    'underscore',
    'views/shared/delegates/Base',
    'views/shared/delegates/PopdownDialog',
    'views/shared/Modal',
    './ModalTimerangePicker.pcss'
],function(
    $,
    _,
    DelegateBase,
    PopdownDialog,
    Modal,
    css
){
    return DelegateBase.extend({
        initialize: function(){
            var defaults = {
               SLIDE_ANIMATION_DURATION: 500
            };

            _.defaults(this.options, defaults);

            this.$visArea = this.options.$visArea;
            this.$slideArea = this.options.$slideArea;
            this.$contentWrapper = this.options.$contentWrapper;
            this.$timeRangePickerWrapper = this.options.$timeRangePickerWrapper;
            this.$modalParent = this.options.$modalParent;
            this.$timeRangePicker = this.options.$timeRangePicker;

            this.title = this.$(Modal.HEADER_TITLE_SELECTOR).html();

            this.events = {};
            this.events["click " + this.options.backButtonSelector] = "closeTimeRangePicker";
            this.events["click " + this.options.activateSelector] = "showTimeRangePicker";
            this.delegateEvents(this.events);

            this.$timeRangePicker.hide();

        },
        showTimeRangePicker: function (e) {
            var $from = this.$contentWrapper,
                $to = this.$timeRangePickerWrapper,
                anamateDistance = $from.width();

            this.onBeforePaneAnimation($from, $to);

            var toWidth = $to.width(),
                toHeight = $to.height();

            this.$modalParent.animate({
                width: toWidth,
                marginLeft: -toWidth/2
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION
            });
            this.$visArea.animate({
                height: toHeight
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION,
                complete: function() {
                    this.onAfterPaneAnimation($from, $to);
                }.bind(this)
            }, this);

            this.$slideArea.animate({
                marginLeft: -anamateDistance
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION
            });

            this.$el.animate({
                width: toWidth
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION
            });

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Select Time Range").t());
            this.$('.btn.back').show();
            this.$('.btn-primary').hide();
            this.$('.btn.cancel').hide();

            if (e) {
                e.preventDefault();
            }
        },
        closeTimeRangePicker: function (e) {
            var $from = this.$timeRangePickerWrapper,
                $to = this.$contentWrapper,
                anamateDistance = $to.width();

            this.onBeforePaneAnimation($from, $to);

            this.$modalParent.animate({
                width: anamateDistance,
                marginLeft: -(anamateDistance/2)
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION,
                complete: function() {
                    //undo width and margin so applied classes continue to work
                    this.$modalParent.css({ width: ''});
                    this.$modalParent.css({ marginLeft: ''});
                }.bind(this)
            });

            this.$visArea.animate({
                height: $to.height()
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION,
                complete: function() {
                    this.onAfterPaneAnimation($from, $to);
                }.bind(this)
            }, this);

            this.$slideArea.animate({
                marginLeft: 0
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION
            });

            this.$el.animate({
                width: anamateDistance
            }, {
                duration: this.options.SLIDE_ANIMATION_DURATION
            });

            this.$(Modal.HEADER_TITLE_SELECTOR).html(this.title);
            this.$('.btn.back').hide();
            this.$('.btn-primary').show();
            this.$('.btn.cancel').show();

            if (e) {
                e.preventDefault();
            }
        },

        // sets up heights of the 'from' and 'to' elements for a smooth animation
        // during the animation, the slide area uses overflow=hidden to control visibility of the 'from' pane
        onBeforePaneAnimation: function($from, $to) {
            this.$visArea.css('overflow', 'hidden');
            this.$visArea.css({ height: $from.height() + 'px'});
            if($to === this.$timeRangePickerWrapper) {
                this.$timeRangePicker.show();
            }
            $to.css({ height: '', visibility: '' });
        },
        // undo the height manipulations that were applied to make a smooth animation
        // after the animation, the 'from' is hidden via display=none and the slide area has visible overflow
        // (this prevents vertical clipping of popup menus)
        onAfterPaneAnimation: function($from, $to) {
            if($from === this.$timeRangePickerWrapper) {
                this.$timeRangePicker.hide();
            }
            this.$visArea.css('overflow', '');
            this.$visArea.css({ height: ''});
            $from.css({ height: '2px', visibility : 'hidden'});
        }
    });
});
