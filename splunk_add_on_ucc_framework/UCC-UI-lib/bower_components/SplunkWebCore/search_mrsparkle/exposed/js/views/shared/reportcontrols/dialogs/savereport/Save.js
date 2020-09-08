define(
    [
         'underscore',
         'module',
         'views/Base',
         'views/shared/controls/ControlGroup',
         'views/shared/FlashMessages',
         'views/shared/Modal',
         'views/shared/reportcontrols/dialogs/shared/ReportVisualizationControlGroup'
     ],
     function(
         _,
         module,
         Base,
         ControlGroup,
         FlashMessage,
         Modal,
         ReportVisualizationControlGroup
     ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.inmem.setTimeRangeWarnings(this.model.reportPristine);
                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

                //name
                this.children.title = new ControlGroup({
                    label: _("Title").t(),
                    controlType:'Label',
                    controlOptions: {
                        model: this.model.inmem.entry,
                        modelAttribute: 'name'
                    }
                });

                //viz toggle
                this.children.visualization = new ReportVisualizationControlGroup({
                    model: {
                        report: this.model.inmem,
                        searchJob: this.model.searchJob
                    }
                });
                
                //timeRangePicker toggle
                this.children.timeRangePickerToggle = new ControlGroup({
                    label: _("Time Range Picker").t(),
                    controlType:'SyntheticRadio',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            { value: '1', label: _('Yes').t() },
                            { value: '0', label: _('No').t() }
                        ],
                        model: this.model.inmem.entry.content,
                        modelAttribute: 'display.general.timeRangePicker.show'
                    }
                });
            },
            events: {
                "click .modal-btn-primary" : function(e) {
                    this.model.inmem.entry.content.set({
                        'request.ui_dispatch_view': this.model.application.get('page')
                    });
                    this.model.inmem.setVizType();
                    this.model.inmem.save({}, {
                        success: function(model, response) {
                            this.model.inmem.trigger('saveSuccess');
                        }.bind(this)
                    });

                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.title);

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.title.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                if (!this.model.reportPristine.isAlert()) {
                    if (this.options.chooseVisualizationType) {
                        if (!this.model.searchJob.isReportSearch()) {
                            this.model.inmem.entry.content.set({'display.statistics.show': '1'});
                            this.model.inmem.entry.content.set({'display.visualizations.show': '0'});
                        }
                        this.children.visualization.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    }

                    if (!this.model.reportPristine.entry.content.get('is_scheduled')) {
                        this.children.timeRangePickerToggle.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    }
                }

                this.model.inmem.setInmemVizType();
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            }
        });
    }
);
