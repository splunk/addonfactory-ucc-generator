// Reusable dialog
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'splunk.util',
    'module',
    'views/shared/FlashMessages',
    'views/shared/waitspinner/Master',
    'views/shared/Modal',
    './modal.pcss'
], function (
    _,
    $,
    Backbone,
    splunkUtil,
    module,
    FlashMessages,
    Spinner,
    Modal
) {

    /*
     * Use case:
     *  User clicks on a enable/disable/delete link for an entity, we would
     *  like to show the user a prompt to comfirm the action.
     *
     * Features:
     *  - Modal title displays '(Enable|Disable|Delete) <model.getName()> ?'
     *  - Modal footer will have cancel/(enable|disable|delete) buttons
     *  - Calls enable|disable|destroy on the modal upon confirmation
     *  - When xhr is on flight, shows a spinner
     *  - Upon success, it fires 'textConfirmDialog:success'
     *  - Upon failure, it fires 'textConfirmDialog:failed'
     *  - Error will be displayed using FlashMessages
     *
     * Usages:
     *   Required:
     *    @param (BackboneModel) model: the model that needs to be destroyed
     *    @param (eventchannel) radio: the event channel on which events are triggered
     *   Optional:
     *    @param (string) title: Want to customize the title,
     *    @param (string) textMessage: Want to customize the text message,
     *    message can have one '%s' which will be replaced by response of model.getName()
     *
     *  Model Requirement:
     *    The model should implement
     *    getName() function - The function response will be used text message
     *    enable() function - This will be called when user clicks 'enable'. Required to return promise
     *    disable() function - This will be called when user clicks 'disable'. Required to return promise
     *    delete() function - This will be called when user clicks 'delete'. Required to return promise
     */

    var strings = {
        DELETE_TITLE: _('Delete <i>%s</i> ?').t(),
        ENABLE_TITLE: _('Enable <i>%s</i> ?').t(),
        DISABLE_TITLE: _('Disable <i>%s</i> ?').t(),
        REVERT_TITLE: _('Revert to default?').t(),
        DELETE_MESSAGE: _('Are you sure you want to delete \'%s\' entity?').t(),
        ENABLE_MESSAGE: _('Are you sure you want to enable \'%s\' entity?').t(),
        DISABLE_MESSAGE: _('Are you sure you want to disable \'%s\' entity?').t(),
        REVERT_MESSAGE: _('Are you sure you want to revert \'%s\'?<br/>Once reverted, all the settings will be restored to the defaults.').t()
    };
    var ENABLE_BUTTON = '<a href="#" class="btn btn-primary modal-btn-primary pull-right enable">' + _('Enable').t() + '</a>';
    var DISABLE_BUTTON = '<a href="#" class="btn btn-primary modal-btn-primary pull-right disable">' + _('Disable').t() + '</a>';
    var REVERT_BUTTON = '<a href="#" class="btn pull-right revert">' + _('Revert').t() + '</a>';
    var DELETE_BUTTON = Modal.BUTTON_DELETE_SECONDARY;
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME + ' modal-with-spinner text-confirm-dialog',

        events: $.extend({}, Modal.prototype.events, {
            'click .modal-btn-delete': function (e) {
                this.children.spinner.start();
                this.children.spinner.$el.show();

                this.model.destroy({ wait: true })
                    .done(_(this.handleSuccess).bind(this))
                    .fail(_(this.handleFailure).bind(this));
            },

            'click .modal-btn-primary.enable': function (e) {
                this.children.spinner.start();
                this.children.spinner.$el.show();
                this.model.enable()
                    .done(_(this.handleSuccess).bind(this))
                    .fail(_(this.handleFailure).bind(this));
            },

            'click .modal-btn-primary.disable': function (e) {
                this.children.spinner.start();
                this.children.spinner.$el.show();
                this.model.disable()
                    .done(_(this.handleSuccess).bind(this))
                    .fail(_(this.handleFailure).bind(this));
            },

            'click .btn.revert': function (e) {
                this.children.spinner.start();
                this.children.spinner.$el.show();
                this.model.revert()
                    .done(_(this.handleSuccess).bind(this))
                    .fail(_(this.handleFailure).bind(this));
            }
        }),

        initialize: function (options) {
            options = _.defaults(options, {
                keyboard: false,
                backdrop: 'static'
            });
            Modal.prototype.initialize.call(this, options);

            this.radio = this.options.radio || _.extend({}, Backbone.Events);
            this.mode = this.options.mode || '';
            switch (this.mode) {
                case 'enable':
                    this.title = this.options.title || strings.ENABLE_TITLE;
                    this.textMessage = this.options.textMessage || strings.ENABLE_MESSAGE;
                    this.cancelButton = Modal.BUTTON_CANCEL;
                    this.primaryButton = ENABLE_BUTTON;
                    break;
                case 'disable':
                    this.title = this.options.title || strings.DISABLE_TITLE;
                    this.textMessage = this.options.textMessage || strings.DISABLE_MESSAGE;
                    this.cancelButton = Modal.BUTTON_CANCEL;
                    this.primaryButton = DISABLE_BUTTON;
                    break;
                case 'delete':
                    this.title = this.options.title || strings.DELETE_TITLE;
                    this.textMessage = this.options.textMessage || strings.DELETE_MESSAGE;
                    this.cancelButton = Modal.BUTTON_CANCEL_PRIMARY;
                    this.primaryButton = DELETE_BUTTON;
                    break;
                case 'revert':
                    this.title = this.options.title || strings.REVERT_TITLE;
                    this.textMessage = this.options.textMessage || strings.REVERT_MESSAGE;
                    this.cancelButton = Modal.BUTTON_CANCEL_PRIMARY;
                    this.primaryButton = REVERT_BUTTON;
                    break;
                case 'default':
                    this.title = 'Unknown mode';
                    this.textMessage = 'Unknown mode "' + this.mode + '". Please use enable, disable, delete';
                    this.cancelButton = Modal.BUTTON_CANCEL_PRIMARY;
                    this.primaryButton = '';
                    break;
            }
            var models = [this.model];
            if (_.has(this.model, 'linkModel')) models.push(this.model.linkModel);
            this.children.flashMessages = new FlashMessages({model: models});
            this.children.spinner = new Spinner();
        },

        handleSuccess: function () {
            this.children.spinner.$el.hide();
            this.children.spinner.stop();
            this.radio.trigger('textConfirmDialog:success', this.mode);
        },

        handleFailure: function (errorMsg) {
            // not much to do.
            // Flash Messages will display the error message
            this.children.spinner.$el.hide();
            this.children.spinner.stop();
            this.radio.trigger('textConfirmDialog:failure', this.mode);
        },

        render: function () {
            var name = this.model.getName();
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(
                splunkUtil.sprintf(this.title, name));
            this.$(Modal.BODY_SELECTOR).html(
                _.template(this.bodyTemplate, {body: splunkUtil.sprintf(this.textMessage, name)})
            );
            this.$('.fm').append(this.children.flashMessages.render().el);
            this.$(Modal.FOOTER_SELECTOR).append(this.cancelButton);
            this.$(Modal.FOOTER_SELECTOR).append(this.primaryButton);
            this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
            this.children.spinner.$el.hide();
            return this;
        },

        // allows for html to be passed.
        // please ensure this.options.textMessage is escaped correctly.
        bodyTemplate: '<div class="fm"></div><p><%= body %></p>'
    });
});

