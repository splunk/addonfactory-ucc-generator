define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/controls/ControlGroup',
        'views/shared/Modal', 
        'views/shared/FlashMessages'
    ],
    function($, 
        _, 
        backbone, 
        module, 
        ControlGroup, 
        Modal, 
        FlashMessagesView
    ){
        return Modal.extend({
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.workingReport = new backbone.Model({'name': this.model.report.entry.content.get('display.general.title') });
                this.children.flashMessagesReport = new FlashMessagesView({model: this.model.report});
                this.children.flashMessagesDashboard = new FlashMessagesView({model: this.model.dashboard});
                //reset flashmessages to clear pre-existing flash messages on 'cancel' or 'close' of dialog
                this.on('hide', this.model.report.error.clear, this.model.report.error); 
                this.on('hide', this.model.dashboard.error.clear, this.model.dashboard.error); 

                this.children.reportNameControlGroup = new ControlGroup({
                    label: _("Report Title").t(),
                    controlType:'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.workingReport,
                        modelAttribute: 'name'
                    }
                });

                this.children.reportDescriptionControlGroup = new ControlGroup({
                    label: _("Description").t(),
                    controlType:'Textarea',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.workingReport,
                        modelAttribute: 'description',
                        placeholder: _("optional").t()
                    }
                });

                this.listenTo(this.model.report, 'successfulReportSave', this.hide, this); 
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-primary': 'onSave'
            }),
            onSave: function(e){
                e.preventDefault();
                this.model.report.trigger("saveAsReport", this.model.workingReport.get("name"), this.model.workingReport.get("description"));
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Convert to Report").t());
                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessagesDashboard.render().el);
                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessagesReport.render().el);
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.reportNameControlGroup.render().el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.reportDescriptionControlGroup.render().el);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            }
        });
    }
);
