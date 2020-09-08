/**
 * @author ahebert
 * @date 7/21/16
 *
 * Confirm dialog that should be used instead of the window.confirm.
 *
 *
 * @param {Object} [options]
 * @param {String} [options.text = 'Are you sure?'] - The contents of the paragraph tag.
 * @param {String} [options.buttonLeftLabel = 'Cancel'] - The label of the left button.
 * @param {String} [options.buttonRightLabel = 'OK'] - The label of the right button.
 * @param {String} [options.isAlert = 'false'] - Defines is this is an alert or a confirm. If this is an alert, hide the left button.
 * @param {String} [options.closeOnEscape = 'false'] - Defines whether the Modal can be dismissed when pressing the Escape key and when clicking on the back drop area.
 * @param {String} [options.showCloseButton = 'false'] - Defines whether the Modal should have a close button.
 */
define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/Button',
        'views/shared/ModalLocalClassNames',
        'views/shared/ModalConfirmation/Contents'
    ],
    function(
        _,
        $,
        module,
        Button,
        Modal,
        ConfirmationContents
    ){
        return Modal.extend({
            moduleId: module.id,

            initialize: function() {
                var defaultOptions = {
                    closeOnEscape : false,
                    showCloseButton : false,
                    buttonLeftLabel: _("Cancel").t(),
                    buttonRightLabel: _("OK").t(),
                    text: _("Are you sure?").t(),
                    isAlert: false
                };
                this.options = _.extend({}, defaultOptions, this.options);

                this.options.bodyView = new ConfirmationContents({
                    text: this.options.text
                });
                if (!this.options.isAlert) {
                    this.options.buttonsLeft = [
                        new Button({
                            href: '#',
                            label: this.options.buttonLeftLabel,
                            style: 'default',
                            action: 'cancel'
                        })
                    ];
                }
                this.options.buttonsRight = [
                    new Button({
                        href: '#',
                        label: this.options.buttonRightLabel,
                        style: 'primary',
                        action: 'success'
                    })
                ];
                Modal.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, Modal.prototype.events, {
                'click [data-action=cancel]': function(e) {
                    e.preventDefault();
                    this.trigger('cancel');
                    this.hide();
                },
                'click [data-action=success]': function(e) {
                    e.preventDefault();
                    this.trigger('success');
                    this.hide();
                }
            })
        });
    }
);