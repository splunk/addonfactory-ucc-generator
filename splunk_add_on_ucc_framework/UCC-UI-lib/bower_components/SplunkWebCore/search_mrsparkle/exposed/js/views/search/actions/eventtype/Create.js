define(
    [
        'backbone',
        'underscore',
        'module',
        'views/shared/FlashMessages',
        'views/Base',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'util/splunkd_utils'
    ],
    function(Backbone, _, module, FlashMessagesView, Base, Modal, ControlGroup, splunkd_utils){
        return Base.extend({
            moduleId: module.id,
            className: 'modal eventtype-create',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                if (this.options.showSearch) {
                    this.children.search = new ControlGroup({
                        controlType: 'Textarea',
                        controlClass: 'controls-block',
                        controlOptions: {
                            defaultValue: this.model.report.entry.content.get('search'),
                            enabled: false,
                            additionalClassNames: 'uneditable-search'
                        },
                        label: _('Search').t()
                    });
                }
                
                this.children.name = new ControlGroup({
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.eventType.entry.content,
                        save: false
                    },
                    label: _('Name').t()
                });
                
                this.children.tags = new ControlGroup({
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'tags',
                        model: this.model.eventType.entry.content,
                        save: false,
                        placeholder: _('Optional').t()
                    },
                    label: _('Tags').t()
                });
                
                var colors = [
                    {
                        label: _("none").t(),
                        value: 'none'
                    },
                    {
                        label: _("blue").t(),
                        value: 'et_blue'
                    },
                    {
                        label: _("green").t(),
                        value: 'et_green'
                    },
                    {
                        label:_("magenta").t(),
                        value: 'et_magenta'
                    },
                    {
                        label: _("orange").t(),
                        value: 'et_orange'
                    },
                    {
                        label: _("purple").t(),
                        value: 'et_purple'
                    },
                    {
                        label: _("red").t(),
                        value: 'et_red'
                    },
                    {
                        label: _("sky").t(),
                        value: 'et_sky'
                    },
                    {
                        label: _("teal").t(),
                        value: 'et_teal'
                    },
                    {
                        label: _("yellow").t(),
                        value: 'et_yellow'
                    }
                ];
                
                this.children.color = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'color',
                        model: this.model.eventType.entry.content,
                        items: colors,
                        save: false,
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    label: _('Color').t()
                });
                
                var priorities = [
                    {
                        label: _("1 (Highest)").t(),
                        value: 1
                    },
                    {
                        label: _("2").t(),
                        value: 2
                    },
                    {
                        label: _("3").t(),
                        value: 3
                    },
                    {
                        label: _("4").t(),
                        value: 4
                    },
                    {
                        label: _("5").t(),
                        value: 5
                    },
                    {
                        label: _("6").t(),
                        value: 6
                    },
                    {
                        label: _("7").t(),
                        value: 7
                    },
                    {
                        label: _("8").t(),
                        value: 8
                    },
                    {
                        label: _("9").t(),
                        value: 9
                    },
                    {
                        label: _("10 (Lowest)").t(),
                        value: 10
                    }
                ];
                
                this.children.priority = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'priority',
                        model: this.model.eventType.entry.content,
                        items: priorities,
                        save: false,
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    help: _('Determines which style wins, when an event has more than one event type.').t(),
                    label: _('Priority').t()
                });
                this.children.clientflashMessages = new FlashMessagesView({ model: this.model.eventType.entry.content });
                this.children.serverflashMessages = new FlashMessagesView({ model: this.model.eventType });

            },
            
            focus: function() {
                this.$('input[type="text"]').first().focus();
            },
            
            events: {
                'click .modal-footer .btn-primary': function(e) {
                    this.children.serverflashMessages.$el.empty();
                    this.children.clientflashMessages.$el.empty();

                    this.model.eventType.error.clear();
                    this.model.eventType.entry.content.validate();

                    if (this.model.eventType.entry.content.isValid()){
                        this.model.eventType.entry.content.set({
                            'search': this.model.report.entry.content.get('search')
                        });
                        this.model.eventType.save({}, {
                            data: this.model.application.getPermissions("private"),
                            success: function() {
                                this.success();
                            }.bind(this)
                        });
                    }
                    e.preventDefault();
                }
            },
            success: function(model, resp, options) {
                this.$el.modal('hide');
                this.model.eventType.trigger('success');
                this.model.eventType.clear();
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save As Event Type").t());
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.children.clientflashMessages.render().appendTo(this.$('.form-horizontal'));
                this.children.serverflashMessages.render().appendTo(this.$('.form-horizontal'));
                this.children.clientflashMessages.$el.addClass('client');
                this.children.serverflashMessages.$el.addClass('server');
                if (this.children.search) {
                    this.children.search.render().appendTo(this.$('.form-horizontal'));
                }
                this.children.name.render().appendTo(this.$('.form-horizontal'));
                this.children.tags.render().appendTo(this.$('.form-horizontal'));
                this.children.color.render().appendTo(this.$('.form-horizontal'));
                this.children.priority.render().appendTo(this.$('.form-horizontal'));
                this.$(Modal.BODY_FORM_SELECTOR).show();
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                return this;
            }
        }
    );
});
