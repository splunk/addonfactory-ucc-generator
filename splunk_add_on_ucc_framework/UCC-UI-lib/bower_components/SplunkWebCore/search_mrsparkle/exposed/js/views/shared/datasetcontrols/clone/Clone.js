define([
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages',
    'views/shared/controls/TextControl',
    'views/shared/delegates/PairedTextControls',
    'util/datamodel/form_utils',
    'splunk.util'
    ],
    function(
        _,
        module,
        Base,
        Modal,
        ControlGroup,
        FlashMessages,
        TextControl,
        PairedTextControls,
        dataModelFormUtils,
        splunkUtil
    ) {
    return Base.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *    model: {
        *        dataset: <models.PolymorphicDataset>,
        *        application: <models.Application>,
        *        inmem: <models.PolymorphicDataset>
        *    }
        * }
        */
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);
            this.model.inmem.unset('id');

            this.model.inmem.set({
                clonePermissions: false
            });

            this.model.inmem.entry.content.set({
                name: this.model.inmem.entry.get('name') + '_clone'
            });
            this.children.flashMessage = new FlashMessages({ model: this.model.inmem });

            if (this.model.inmem.isTable()) {
                
                this.model.inmem.entry.content.set({
                    displayName: this.model.inmem.entry.content.get('displayName') + '_clone'
                });
                
                this.children.tableDisplayNameControl = new TextControl({
                    model: this.model.inmem.entry.content,
                    modelAttribute: 'displayName'
                });

                this.children.tablelDisplayNameGroup = new ControlGroup({
                    label: _('Table Title').t(),
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controls: this.children.tableDisplayNameControl
                });

                this.children.tableNameControl = new TextControl({
                    model: this.model.inmem.entry.content,
                    modelAttribute: 'name'
                });

                this.children.tableNameGroup = new ControlGroup({
                    label: _('Table ID').t(),
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controls: this.children.tableNameControl,
                    tooltip: _('The ID is used as the filename on disk. Cannot be changed later.').t(),
                    help: _('Can only contain letters, numbers and underscores.').t()
                });

                this.children.pairedControlsDelegate = new PairedTextControls({
                    sourceDelegate: this.children.tableDisplayNameControl,
                    destDelegate: this.children.tableNameControl,
                    transformFunction: dataModelFormUtils.normalizeForID
                });
                
            } else {
                this.children.titleField = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.inmem.entry.content
                    },
                    label: _('New Name').t()
                });
            }

            if (this.model.dataset.canEditDescription()) {
                this.children.descriptionField = new ControlGroup({
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'dataset.description',
                        model: this.model.inmem.entry.content,
                        placeholder: _('optional').t()
                    },
                    label: _('New Description').t()
                });
            }
        },
        events: {
            'click .btn-primary': function(e) {
                if (this.model.inmem.isTable()) {
                    this.model.inmem.entry.content.set('search', this.model.inmem.getSearch());
                }
                this.model.inmem.save({}, {
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    },
                    success: function(model, response) {
                        this.model.inmem.trigger('createSuccess');
                    }.bind(this)
                });
                e.preventDefault();
            }
        },
        render : function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(splunkUtil.sprintf(_("Clone %s").t(), this.options.nameLabel));

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
            
            if (this.model.inmem.isTable()) {
                this.children.tablelDisplayNameGroup.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.tableNameGroup.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            } else {
                this.children.titleField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            }
            
            if (this.children.descriptionField) {
                this.children.descriptionField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            }

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _('Clone Dataset').t() + '</a>');

            return this;
        }
    });
});
