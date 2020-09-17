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
             Backbone,
             module,
             ControlGroup,
             Modal,
             FlashMessage,
             splunkUtil,
             route,
             Reports,
             utils,
             splunkConfig) {

        return Modal.extend({
            moduleId: module.id,
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.reportLimit = options.reportLimit;
                this.model.workingReport = new Backbone.Model();
                this.model.workingReport.set({"title": ""});
                this.model.workingReport.set("id", this.model.savedReport.get('id'));

                this.collection.reports.dfd.done(function() {
                    var items = this.collection.reports.map(function(report) {
                        return {label: report.entry.get('name'), value: report.id};
                    });
                    var currentReportFound = _.some(items, function(item) {
                        return item.value == this.model.savedReport.get('id');
                    }, this);
                    if (!currentReportFound) {
                        items.unshift({
                            label: this.model.savedReport.entry.get('name'),
                            value: this.model.savedReport.get('id')
                        });
                    }
                    var reportsLink = route.reports(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app")
                    );

                    if (this.collection.reports.length === this.reportLimit) {
                        this.children.reportsControlGroup = new ControlGroup({
                            label: _("Select Report").t(),
                            controlType: 'SyntheticSelect',
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
                    } else {
                        this.children.reportsControlGroup = new ControlGroup({
                            label: _("Select Report").t(),
                            controlType: 'SyntheticSelect',
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
                }.bind(this));

                this.children.panelTitleControlGroup = new ControlGroup({
                    label: _("Panel Title").t(),
                    controlType: 'Text',
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
            onSave: function(e) {
                e.preventDefault();
                this.trigger("updateReportID", this.model.workingReport.get('id'), this.model.workingReport.get('title'));
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Select a New Report").t());
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);

                this.$(Modal.BODY_FORM_SELECTOR).append(Modal.LOADING_HORIZONTAL);
                this.$(Modal.LOADING_SELECTOR).html(_('Loading...').t());

                this.collection.reports.dfd.done(_.bind(function() {
                    this.$(Modal.LOADING_SELECTOR).remove();
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.reportsControlGroup.render().el);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.panelTitleControlGroup.render().el);
                }, this));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_APPLY);
            }
        });
    }
);
