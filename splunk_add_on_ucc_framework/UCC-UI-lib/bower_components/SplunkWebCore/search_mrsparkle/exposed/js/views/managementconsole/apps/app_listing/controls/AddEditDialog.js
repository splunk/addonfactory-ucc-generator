define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/App',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/Modal',
        'views/shared/basemanager/EditDialog',
        'views/shared/controls/MultiInputControl',
        'views/shared/controls/SyntheticRadioControl',
        'views/managementconsole/apps/add_app/SelectAppFile',
        'views/managementconsole/apps/add_app/SetProperties'
    ],
    function(
        $,
        _,
        Backbone,
        AppModel,
        FlashMessagesCollection,
        FlashMessagesView,
        Modal,
        BaseAddEditDialog,
        MultiInputControl,
        SyntheticRadioControl,
        SelectAppFileView,
        SetPropertiesView
    ) {
        return BaseAddEditDialog.extend({
            className: Modal.CLASS_NAME + ' edit-dialog-modal',

            initialize: function(options) {
                _.defaults(options, {
                    backdrop: 'static'
                });

                this.collection.flashMessages = new FlashMessagesCollection();
                this.uploadFile = this.model.controller.get('uploadFile');

                BaseAddEditDialog.prototype.initialize.apply(this, arguments);

                this.children.flashMessagesLegacyView = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });
            },

            // This overrides the method in the base class
            setTitle: function() {
                this.title = this.model.entity.isNew() ? _("Install App").t() :
                    this.model.controller.get('uploadFile') ? _("Update App").t() :
                    _("Edit Properties").t();
            },

            // This overrides the method in the base class
            onClickSave: function(e) {
                e.preventDefault();
                
                var validate = this.model.entity.entry.content.validate();
                if (validate) {
                    this.collection.flashMessages.reset([{
                        type: 'error',
                        html: _.values(validate)[0]
                    }]);
                    return;
                }
                this.model.entity.save({}, {uploadFile: this.uploadFile || this.model.entity.isNew(), validate: true})
                    .done(function() {
                        this.collection.entities.fetch();
                        this.hide();
                    }.bind(this))
                    .fail(function(error) {
                        var errorObj = JSON.parse(error.responseText),
                            errorMsg = errorObj.error.message;
                        this.collection.flashMessages.reset([{
                            type: 'error',
                            html: errorMsg || _('Failed to save app.').t()
                        }]);
                    }.bind(this));
            },

            // This overrides the method in the base class
            setFormControls: function() {
                if (this.model.entity.isNew()) {
                    this.children.selectAppFileView = new SelectAppFileView({
                        model: {
                            appModel: this.model.entity
                        },
                        collection: {
                            flashMessages: this.collection.flashMessages
                        },
                        viewSize: 'small'
                    });

                    this.children.setPropertiesView = new SetPropertiesView({
                        model: {
                            appModel: this.model.entity
                        },
                        collection: {
                            groups: this.collection.groups,
                            flashMessages: this.collection.flashMessages
                        }
                    });
                } else if (this.uploadFile) {
                    this.children.selectAppFileView = new SelectAppFileView({
                        model: {
                            appModel: this.model.entity
                        },
                        collection: {
                            flashMessages: this.collection.flashMessages
                        },
                        viewSize: 'small'
                    });
                } else {
                    this.children.setPropertiesView = new SetPropertiesView({
                        model: {
                            appModel: this.model.entity
                        },
                        collection: {
                            groups: this.collection.groups,
                            flashMessages: this.collection.flashMessages
                        }
                    });
                }
            },

            // This overrides the method in the base class
            renderFormControls: function($modalBody) {
                $modalBody.html(this.compiledTemplate());
                this.$('.flash-messages-place-holder').append(this.children.flashMessagesLegacyView.render().el);
                if (this.model.entity.isNew()) {
                    this.$('.file-upload-container').append(this.children.selectAppFileView.render().el);
                    this.$('.set-properties-container').append(this.children.setPropertiesView.render().el);
                } else if (this.uploadFile) {
                    this.$('.file-upload-container').append(this.children.selectAppFileView.render().el);
                } else {
                    this.$('.set-properties-container').append(this.children.setPropertiesView.render().el);
                }
            },

            template: '\
                <div class="flash-messages-place-holder"></div>\
                <div class="file-upload-container">\
                </div>\
                <div class="set-properties-container">\
                </div>\
            '
        });
    }
);