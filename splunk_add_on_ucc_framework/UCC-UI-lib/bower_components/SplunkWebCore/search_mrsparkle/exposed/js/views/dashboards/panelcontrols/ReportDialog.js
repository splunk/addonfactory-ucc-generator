define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/controls/ControlGroup',
        'views/shared/Modal',
        'views/shared/FlashMessages', 
        'splunk.util', 
        'uri/route', 
        'collections/search/Reports',
        'splunkjs/mvc/utils', 
        'splunk.config'
    ],
    function($, 
        _, 
        backbone, 
        module, 
        ControlGroup, 
        Modal, 
        FlashMessage, 
        splunkUtil, 
        route, 
        Reports, 
        utils, 
        splunkConfig
    ){
        return Modal.extend({
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.workingReport = new backbone.Model();
                this.model.workingReport.set({"title": ""});
                this.model.workingReport.set("id", this.model.report.get('id')); 
                this.children.flashMessage = new FlashMessage({ model: this.model.dashboard });
                //reset flashmessages to clear pre-existing flash messages on 'cancel' or 'close' of dialog
                this.on('hide', this.model.dashboard.error.clear, this.model.dashboard.error); 
                this.listenTo(this.model.report, 'successfulManagerChange', this.hide, this); 
                this.controller = this.options.controller;

                if(!this.controller.reportsCollection){
                    this.controller.fetchCollection(); 
                }

                this.controller.reportsCollection.initialFetchDfd.done(_.bind(function() {  
                    this.ready = true;
                    var items = this.controller.reportsCollection.map(function(report) {
                        return { label: report.entry.get('name'), value: report.id };
                    });
                     var reportsLink = route.reports(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app")
                    ); 

                    if(this.controller.reportsCollection.length === this.controller.reportsCollection.REPORTS_LIMIT){
                        this.children.reportsControlGroup = new ControlGroup({
                            label: _("Select Report").t(),
                            controlType:'SyntheticSelect',
                            controlClass: 'controls-block',
                            controlOptions: {
                                model: this.model.workingReport,
                                modelAttribute: 'id',
                                items: items,
                                toggleClassName: 'btn',
                                popdownOptions: {
                                    attachDialogTo: '.modal:visible',
                                    scrollContainer: '.modal:visible .modal-body:visible'
                                }
                            }, 
                            help: _("This does not contain all reports. Add a report that is not listed from ").t() + splunkUtil.sprintf('<a href=%s>%s</a>.', reportsLink, _('Reports').t())
                        });
                    }else{
                        this.children.reportsControlGroup = new ControlGroup({
                            label: _("Select Report").t(),
                            controlType:'SyntheticSelect',
                            controlClass: 'controls-block',
                            controlOptions: {
                                model: this.model.workingReport,
                                modelAttribute: 'id',
                                items: items,
                                toggleClassName: 'btn',
                                popdownOptions: {
                                    attachDialogTo: '.modal:visible',
                                    scrollContainer: '.modal:visible .modal-body:visible'
                                }
                            }
                        });
                    }
                }, this));

                this.children.panelTitleControlGroup = new ControlGroup({
                    label: _("Panel Title").t(),
                    controlType:'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.workingReport,
                        modelAttribute: 'title',
                        placeholder: _("optional").t()
                    }
                });
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-primary': 'onSave'
            }),
            onSave: function(e){
                e.preventDefault();
                this.model.report.trigger("updateReportID", this.model.workingReport.get('id'), this.model.workingReport.get('title'));
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Select a New Report").t());
                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessage.render().el);
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                
                this.$(Modal.BODY_FORM_SELECTOR).append(Modal.LOADING_HORIZONTAL);
                this.$(Modal.LOADING_SELECTOR).html(_('Loading...').t()); 

                this.controller.reportsCollection.initialFetchDfd.done(_.bind(function(){
                    this.$(Modal.LOADING_SELECTOR).remove(); 
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.reportsControlGroup.render().el);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.panelTitleControlGroup.render().el);
                }, this));

                
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            }
        });
    }
);
