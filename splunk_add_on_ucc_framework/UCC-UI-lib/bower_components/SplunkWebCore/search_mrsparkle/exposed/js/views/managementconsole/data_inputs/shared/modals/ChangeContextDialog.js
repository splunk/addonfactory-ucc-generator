define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'models/Base',
    'views/shared/FlashMessages',
    'views/shared/Modal',
    'views/shared/waitspinner/Master',
    'views/managementconsole/data_inputs/shared/controls/DMCContext',
    'splunk.util',
    './modal.pcss'
], function (
    _,
    $,
    Backbone,
    module,
    BaseModel,
    FlashMessages,
    Modal,
    Spinner,
    DMCContext,
    splunkUtil
) {
    var strings = {
        TITLE: _('New context for \'%s\'').t()
    };

    var WorkingModel = BaseModel.extend({
        validation: {
            'bundle': [{
                fn: function (val, key, attrs) {
                    if (_.isUndefined(val)){
                        if (attrs['bundleType'] === 'custom')  {
                            return _('Server class is required').t();
                        }
                        if (attrs['bundleType'] === 'app')  {
                            return _('App is required').t();
                        }
                        if (attrs['bundleType'] === 'app')  {
                            return _('App is required').t();
                        }
                        return _('Context is required').t();
                    }
                }
            }]
        }
    });

    return Modal.extend({
        moduleId: module.id,

        tagName: 'div',

        className: Modal.CLASS_NAME + ' modal-with-spinner change-context',

        events: {
            'click .modal-btn-primary': function () {
                if (this.model.localmodel.validate()) {
                    return;
                }
                this.children.spinner.start();
                this.children.spinner.$el.show();
                this.model.entity.move(this.children.deployControl.getValue())
                    .done(_(this.handleSuccess).bind(this))
                    .fail(_(this.handleFailure).bind(this));
            }
        },

        initialize: function (options) {
            options = _.defaults(options, {
                keyboard: false,
                backdrop: 'static'
            });
            Modal.prototype.initialize.call(this, options);

            var typeAttr = 'bundleType';
            var attr = 'bundle';

            this.model.localmodel = new WorkingModel();
            this.model.localmodel.set(typeAttr, this.model.entity.getBundleType());
            this.model.localmodel.set(attr, this.model.entity.getBundle());
            this.children.deployControl = new DMCContext({
                mode: 'selector',
                model: this.model.localmodel,
                modelTypeAttribute: typeAttr,
                modelAttribute: attr,
                collection: this.collection,
                radio: this.options.radio,
                deferreds: this.options.deferreds,
                hideAllForwarders: !this.model.user.canEditDMCForwarders()
            });
            this.children.flashMessages = new FlashMessages({model: [this.model.entity, this.model.localmodel]});
            this.children.spinner = new Spinner();
        },

        handleSuccess: function () {
            this.children.spinner.$el.hide();
            this.children.spinner.stop();
            this.options.radio.trigger('textConfirmDialog:success');
        },

        handleFailure: function (errorMsg) {
            // not much to do.
            // Flash Messages will display the error message
            if (_.isString(errorMsg)) this.$('.fm').html('<p><i class="icon-alert"></i> ' + errorMsg + '</p>');
            if (_.isObject(errorMsg)
                && _.has(errorMsg, 'responseJSON')
                && _.has(errorMsg.responseJSON, 'error')
                && _.has(errorMsg.responseJSON.error, 'message')
                && _.isString(errorMsg.responseJSON.error.message)
            ) {
                this.$('.fm').html('<p><i class="icon-alert"></i> ' + errorMsg.responseJSON.error.message + '</p>');
            }
            this.children.spinner.$el.hide();
            this.children.spinner.stop();
            this.options.radio.trigger('textConfirmDialog:failure');
        },

        render: function () {
            this.$el.html(Modal.TEMPLATE);
            var name = this.model.entity.getName();
            this.$(Modal.HEADER_TITLE_SELECTOR).html(
                splunkUtil.sprintf(strings.TITLE, name));
            this.$(Modal.BODY_SELECTOR).html(
                _.template(this.bodyTemplate));
            this.children.flashMessages.render().appendTo(this.$('.body-container'));
            this.children.deployControl.render().appendTo(this.$('.body-container'));
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
            this.children.spinner.$el.hide();
            return this;
        },
        bodyTemplate: '<div class="fm"></div><div class="body-container"></div>'
    });
});
