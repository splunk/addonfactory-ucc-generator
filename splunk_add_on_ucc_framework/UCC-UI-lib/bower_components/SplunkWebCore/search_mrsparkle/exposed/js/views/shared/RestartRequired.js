/**
 * @author ahebert
 * @date 9/22/16
 *
 * Success dialog prompting user for restart that should be shown after any successful action requiring restart.
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/Button',
        'views/shared/ModalLocalClassNames',
        'views/shared/RestartRequiredContents',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Button,
        Modal,
        RestartRequiredContents,
        SplunkUtil
    ){
        return Modal.extend({
            moduleId: module.id,
            /**
             * Initializes the success modal:
             *  - initializes bodyView, buttons
             *  - uses defaults options or passed options
             * @param options
             *  - title (string|optional) Title of the modal window. (default: 'Restart Required')
             *  - restartMandatory (Boolean|optional) Should display the 'Restart later' button. (default: false)
             *  - showCloseButton (Boolean|optional) Should display the close button of the modal. (default: false)
             *  - closeOnEscape (Boolean|optional) Should close the modal on escape. (default: false)
             *  - bodyView (View|optional) View component for the body of the modal. Should extend from views/Base.js (default: none)
             *  - restartCallback (Function|optional) Function executed when restart button is pressed. (default: none)
             *  - return_to (String|optional) URL of the direct action page, the page the user should land after restart. (default: none)
             */
            initialize: function(options) {
                var defaultOptions = {
                    restartMandatory: false,
                    title: _('Restart Required').t(),
                    message: SplunkUtil.sprintf(_("You must restart %s for changes to take effect.").t(),
                        this.model.serverInfo.getProductName())
                };
                this.options = _.extend({}, defaultOptions, this.options);

                this.options.bodyView = this.options.bodyView || new RestartRequiredContents({
                    message: this.options.message
                });
                if (!this.options.restartMandatory) {
                    this.options.buttonsLeft = [
                        new Button({
                            href: '#',
                            label: _("Restart Later").t(),
                            style: 'default',
                            action: 'skip'
                        })
                    ];
                }
                this.options.buttonsRight = [
                    new Button({
                        href: '#',
                        label: _("Restart Now").t(),
                        style: 'primary',
                        action: 'restart'
                    })
                ];
                Modal.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, Modal.prototype.events, {
                'click [data-action=skip]': function(e) {
                    e.preventDefault();
                    this.hide({reason:'clickSkip'});
                },
                'click [data-action=restart]': function(e) {
                    e.preventDefault();
                    if (this.options.restartCallback) {
                        this.options.restartCallback();
                    }
                    SplunkUtil.restart_server(this.options.return_to);
                }
            })
        });
    }
);
