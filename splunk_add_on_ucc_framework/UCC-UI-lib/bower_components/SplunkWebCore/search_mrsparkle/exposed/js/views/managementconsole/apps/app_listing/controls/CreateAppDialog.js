define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/App',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/managementconsole/apps/add_app/SetProperties',
        './CreateAppDialog.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        AppModel,
        FlashMessagesCollection,
        FlashMessagesView,
        Modal,
        ControlGroup,
        SetPropertiesView,
        css
    ) {
        var ERROR_MSGS = {
                GENERIC: _('The app could not be created at this time. Please exit and try again later.').t()
            },
            AFTER_INSTALLATION = AppModel.AFTER_INSTALLATION,
            BUTTON_CREATE = '<a href="#" class="btn btn-primary modal-btn-primary pull-right create-btn">' + _.escape(_('Create').t()) + '</a>',
            STRINGS = {
                OPTIONAL: _('optional').t()
            };

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                _.defaults(options, {
                    backdrop: 'static'
                });

                Modal.prototype.initialize.call(this, options);

                this.model = this.model || {};
                this.collection = this.collection || {};

                // Model
                this.model.app = new AppModel({
                    entry: {
                        content: {
                            groups: [],
                            afterInstallation: AFTER_INSTALLATION.DO_NOTHING.value
                        }
                    },
                    name: '',
                    '@ui.label': '',
                    '@launcher.version': '',
                    '@launcher.author': '',
                    '@launcher.description': ''
                });

                // Collection
                this.collection.flashMessages = new FlashMessagesCollection();

                // Views
                this.children.flashMessages = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });

                this.children.displayNameInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('Name').t(),
                    tooltip: _("A friendly name for display in the Splunk Web").t(),
                    controlOptions: {
                        model: this.model.app,
                        modelAttribute: '@ui.label',
                        placeholder: STRINGS.OPTIONAL
                    }
                });

                this.children.folderNameInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('Folder Name').t(),
                    tooltip: _("This name maps to the app's directory. Valid characters are A-Z a-z 0-9 _ -. Spaces are not valid characters.").t(),
                    controlOptions: {
                        model: this.model.app,
                        modelAttribute: 'name'
                    }
                });

                this.children.versionInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('Version').t(),
                    controlOptions: {
                        model: this.model.app,
                        modelAttribute: '@launcher.version',
                        placeholder: STRINGS.OPTIONAL
                    }
                });

                this.children.authorInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('Author').t(),
                    controlOptions: {
                        model: this.model.app,
                        modelAttribute: '@launcher.author',
                        placeholder: STRINGS.OPTIONAL
                    }
                });

                this.children.descriptionInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('Description').t(),
                    controlOptions: {
                        model: this.model.app,
                        modelAttribute: '@launcher.description',
                        placeholder: STRINGS.OPTIONAL
                    }
                });

                this.children.setPropertiesView = new SetPropertiesView({
                    model: {
                        appModel: this.model.app
                    },
                    collection: {
                        groups: this.collection.groups,
                        flashMessages: this.collection.flashMessages
                    },
                    showFlashMessages: false
                });
            },

            events: {
                'click .create-btn': function(e) {
                    e.preventDefault();
                    var errorMsg = '',
                        errorObj = null;

                    var validate = this.model.app.validate();
                    if (validate) {
                        this.collection.flashMessages.reset([{
                            type: 'error',
                            html: _.values(validate)[0]
                        }]);
                        return;
                    }

                    this.model.app.save().done(function() {
                        this.collection.apps.fetch();
                        this.hide();
                    }.bind(this)).fail(function(error) {
                        errorObj = JSON.parse(error.responseText);
                        errorMsg = errorObj.error.message || ERROR_MSGS.GENERIC;

                        this.collection.flashMessages.reset([{
                            type: 'error',
                            html: errorMsg
                        }]);
                    }.bind(this));
                }
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_.escape(_('Create New App').t()));

                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);

                this.$(Modal.BODY_SELECTOR).append('<div class="content-body"></div>');
                this._renderContent();

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(BUTTON_CREATE);

                return this;
            },

            _renderContent: function() {
                this.$('.content-body').html(this.compiledTemplate());

                this.children.displayNameInput.render().appendTo(this.$('.input-display-name'));
                this.children.folderNameInput.render().appendTo(this.$('.input-folder-name'));
                this.children.versionInput.render().appendTo(this.$('.input-version'));
                this.children.authorInput.render().appendTo(this.$('.input-author'));
                this.children.descriptionInput.render().appendTo(this.$('.input-description'));
                this.children.setPropertiesView.render().appendTo(this.$('.set-properties-container'));
            },

            template: '\
                <h3 class="content-title"><%- _("App Settings").t() %></h3>\
                <div class="input-display-name"></div>\
                <div class="input-folder-name"></div>\
		        <div class="input-version"></div>\
		        <div class="input-author"></div>\
                <div class="input-description"></div>\
                <div class="set-properties-container"></div>\
		    '
        });
    }
);