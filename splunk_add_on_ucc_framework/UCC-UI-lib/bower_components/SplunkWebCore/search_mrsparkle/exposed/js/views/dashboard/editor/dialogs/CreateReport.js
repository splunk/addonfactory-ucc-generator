define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/search/Report',
        'views/shared/controls/ControlGroup',
        'views/shared/Modal',
        'views/shared/FlashMessages'
    ],
    function($,
             _,
             Backbone,
             module,
             ReportModel,
             ControlGroup,
             Modal,
             FlashMessagesView) {
        return Modal.extend({
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.newReport = new ReportModel();
                //set name
                this.model.newReport.entry.content.set('name', this.model.report.entry.content.get('dashboard.element.title'));
                this.children.flashMessagesReport = new FlashMessagesView({model: this.model.newReport});
                //reset flashmessages to clear pre-existing flash messages on 'cancel' or 'close' of dialog
                this.on('hide', this.model.newReport.error.clear, this.model.newReport.error);

                this.children.reportNameControlGroup = new ControlGroup({
                    label: _("Report Title").t(),
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.newReport.entry.content,
                        modelAttribute: 'name'
                    }
                });

                this.children.reportDescriptionControlGroup = new ControlGroup({
                    label: _("Description").t(),
                    controlType: 'Textarea',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.newReport.entry.content,
                        modelAttribute: 'description',
                        placeholder: _("optional").t()
                    }
                });
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-primary': 'onSave'
            }),
            onSave: function(e) {
                e.preventDefault();
                this.trigger("saveAsReport", this.model.newReport);
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Convert to Report").t());
                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessagesReport.render().el);
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);

                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.reportNameControlGroup.render().el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.reportDescriptionControlGroup.render().el);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_APPLY);
            }
        });
    }
);
