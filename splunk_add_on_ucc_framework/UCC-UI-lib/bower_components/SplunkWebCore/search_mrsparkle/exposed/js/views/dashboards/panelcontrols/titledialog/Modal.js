define(
    [
        'underscore',
        'jquery',
        'backbone',
        'module',
        'views/shared/controls/ControlGroup',
        'views/shared/Modal', 
        'views/shared/FlashMessages'
    ],
    function(_, $, backbone, module, ControlGroup, Modal, FlashMessagesView){
        return Modal.extend({
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                var titleProperty = 'display.general.title';
                this.model.workingReport = new backbone.Model(/*this.model.report.entry.content.toJSON()*/);
                this.model.workingReport.set(titleProperty, this.model.report.entry.content.get(titleProperty, { tokens: true }));
                this.children.flashMessages = new FlashMessagesView({model: this.model.dashboard});
                //reset flashmessages to clear pre-existing flash messages on 'cancel' or 'close' of dialog
                this.on('hide', this.model.dashboard.error.clear, this.model.dashboard.error); 

                this.children.panelTitleControlGroup = new ControlGroup({
                    label: _("Title").t(),
                    controlType:'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.workingReport,
                        modelAttribute: titleProperty,
                        placeholder: _("optional").t()
                    }
                });

                this.listenTo(this.model.report, 'successfulSave', this.hide, this); 
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-primary': 'onSave'
            }),
            onSave: function(e){
                var newTitle = this.model.workingReport.get('display.general.title'); 
                e.preventDefault();
                this.model.report.trigger("saveTitle", newTitle); //this.model.report is actually this.model.working due to titledialog using tokens 
           },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Title").t());
                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);                
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.panelTitleControlGroup.render().el);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            }
        });
    }
);
