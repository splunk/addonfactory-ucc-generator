define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/Modal'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        FlashMessagesCollection,
        FlashMessagesView,
        Modal
    ) {
        var BUTTON_UNINSTALL = '<a href="#" class="btn btn-primary modal-btn-primary pull-right uninstall-btn">' + _.escape(_('Uninstall').t()) + '</a>',
            ERROR_MSGS = {
                GENERIC: _('The app could not be uninstalled at this time. Please exit and try again later.').t(),
                MISSING_CAPABILITIES: _('You do not have sufficient permissions to do this.').t()
            };

        return Modal.extend({
            moduleId: module.id,

            initialize: function(options) {
                Modal.prototype.initialize.call(this, options);
                this.collection = this.collection || {};

                // Collection
                this.collection.flashMessages = new FlashMessagesCollection();

                // Views
                this.children.flashMessages = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .uninstall-btn': function(e) {
                    e.preventDefault();

                    this._disableButtons();

                    this.model.app.destroy({wait: true})
                        .fail(this.onActionFail.bind(this))
                        .done(this.onActionSuccess.bind(this));
                }
            }),

            onActionSuccess: function(response) {
                if (response.status === 5) {
                    this._handleDependencyRequiredError(response.required_apps);
                } else {
                    _.isFunction(this.options.onActionSuccess) && this.options.onActionSuccess.apply(this, arguments);
                    this.hide();
                }
            },

            _handleDependencyRequiredError: function(requireApps) {
                var requiredAppStr = _.map(requireApps, function(app) {
                        return app.app_title;
                    }).join(", "),

                    errorMsg = splunkUtil.sprintf(_('%s could not be uninstalled because it is required by the following apps: %s.').t(),
                        _.escape(this.model.app.getAppLabel()),
                        requiredAppStr
                    );

                this.collection.flashMessages.reset([{
                    type: 'error',
                    html: errorMsg
                }]);

                this._enableButtons();
            },

            onActionFail: function(error) {
                var errorObj = JSON.parse(error.responseText),
                    errorMsg = errorObj.error.message || ERROR_MSGS.GENERIC;

                if(_.isObject(errorMsg) && _.has(errorMsg, 'missing_capabilities')) {
                    errorMsg = ERROR_MSGS.MISSING_CAPABILITIES;
                }

                this.collection.flashMessages.reset([{
                    type: 'error',
                    html: errorMsg
                }]);

                this._enableButtons();
            },

            _disableButtons: function() {
                this._toggleButton('.modal-btn-primary', false);
                this._toggleButton('.close', false);
                this._toggleButton('.modal-btn-cancel', false);
            },

            _enableButtons: function() {
                this._toggleButton('.modal-btn-primary', true);
                this._toggleButton('.close', true);
                this._toggleButton('.modal-btn-cancel', true);
            },

            _toggleButton: function(btn, enabled) {
                if (enabled) {
                    this.$(btn).removeClass('disabled');
                    this.$(btn).prop('disabled', false);
                } else {
                    this.$(btn).addClass('disabled');
                    this.$(btn).prop('disabled', true);
                }
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_.escape(_('App Uninstall - Confirm').t()));

                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);

                this.$(Modal.BODY_SELECTOR).append(splunkUtil.sprintf(_('Are you sure you want to uninstall <b>%s</b> (version %s)? Doing so may cause Splunk Cloud to become unavailable for some time.').t(),
                    _.escape(this.model.app.getAppLabel()),
                    _.escape(this.model.app.getVersion())
                ));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(BUTTON_UNINSTALL);

                return this;
            }
        });
    }
);