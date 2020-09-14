define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'views/shared/delegates/PairedTextControls',
        'util/datamodel/form_utils'
    ],
    function(
        _,
        module,
        Base,
        FlashMessage,
        Modal,
        ControlGroup,
        TextControl,
        PairedTextControls,
        dataModelFormUtils
    ) {
        return Base.extend({
            moduleId: module.id,

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

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
                
                this.children.description = new ControlGroup({
                    label: _('Description').t(),
                    controlType: 'Textarea',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.inmem.entry.content,
                        modelAttribute: 'dataset.description',
                        placeholder: _('optional').t()
                    }
                });
            },

            events: {
                "click .modal-btn-primary": function(e) {
                    this.submit();
                    e.preventDefault();
                }
            },

            render: function() {
                var header = _('Save As New Table').t();

                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(header);

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.tablelDisplayNameGroup.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.tableNameGroup.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.description.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            },

            submit: function() {
                this.model.inmem.save({}, {
                    data: this.model.application.getPermissions("private"),
                    success: function(model, response) {
                        this.model.inmem.trigger('createSuccess');
                    }.bind(this)
                });
            }
        });
    }
);
