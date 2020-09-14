define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/services/search/IntentionsParser',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages',
    'splunk.util',
    'uri/route'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        IntentionsParserModel,
        Modal,
        ControlGroup,
        FlashMessage,
        splunkUtil,
        route
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *       model: {
        *           report: <models.Report>,
        *           searchJob: <models.services.search.Job> (optional),
        *           application: <models.Application>,
        *           controller: <Backbone.Model> (Optional),
        *       }
        * }
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);

            this.model = {
                searchJob: this.model.searchJob,
                report: this.model.report,
                inmem: this.model.report.clone(),
                application: this.model.application,
                controller: this.model.controller
            };

            if(!this.model.searchJob) {
                this.model.intentionsParser = new IntentionsParserModel();
                this.intentionsParserDeferred = this.model.intentionsParser.fetch({
                    data:{
                        q:this.model.report.entry.content.get('search'),
                        timeline: false,
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    }
                });
            }

            this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

            this.children.name = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.model.inmem.entry
                },
                label: _('Report').t()
            });

            var accelerateSearchHelpLink = route.docHelp(
                            this.model.application.get("root"),
                            this.model.application.get("locale"),
                            'learnmore.search.acceleration'
            );

            this.children.acceleration = new ControlGroup({
                controlType: 'SyntheticCheckbox',
                controlOptions: {
                    modelAttribute: 'auto_summarize',
                    model: this.model.inmem.entry.content
                },
                label: splunkUtil.sprintf(_('Accelerate %s').t(), this.model.report.isAlert() ? _('Alert').t() : _('Report').t()),
                help: _('Acceleration might increase storage and processing costs. ').t() +
                      _('Acceleration can return invalid results if you change definitions of knowledge objects used in the search string after you accelerate the report. ').t() +
                      '<a href="' + _.escape(accelerateSearchHelpLink) + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
            });

            this.children.summary_range = new ControlGroup({
                controlType: 'SyntheticSelect',
                controlOptions: {
                    modelAttribute: 'auto_summarize.dispatch.earliest_time',
                    model: this.model.inmem.entry.content,
                    items: [
                        {
                            label: _('1 Day').t(),
                            value: '-1d@h'
                        },
                        {
                            label: _('7 Days').t(),
                            value: '-7d@d'
                        },
                        {
                            label: _('1 Month').t(),
                            value: '-1mon@d'
                        },
                        {
                            label: _('3 Months').t(),
                            value: '-3mon@d'
                        },
                        {
                            label: _('1 Year').t(),
                            value: '-1y@d'
                        },
                        {
                            label: _('All Time').t(),
                            value: '0'
                        }
                    ],
                    save: false,
                    toggleClassName: 'btn',
                    labelPosition: 'outside',
                    elastic: true,
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }
                },
                label: _('Summary Range').t(),
                tooltip: _("Sets the range of time (relative to now) for which data is accelerated. " +
                    "Example: 1 Month accelerates the last 30 days of data in your reports.").t()
            });

            this.model.inmem.entry.content.on('change:auto_summarize', function() {
                if (this.model.inmem.entry.content.get("auto_summarize")) {
                    this.children.summary_range.$el.show();
                    if(this.model.inmem.entry.content.get("auto_summarize.dispatch.earliest_time") === '') {
                        this.model.inmem.entry.content.set("auto_summarize.dispatch.earliest_time",'-1d@h');
                    }
                } else {
                    this.children.summary_range.$el.hide();
                }
            }, this);

            this.on('hidden', function() {
                if (this.model.inmem.get("updated") > this.model.report.get("updated")) {
                    //now we know have updated the clone
                    this.model.report.entry.content.set({
                        auto_summarize: this.model.inmem.entry.content.get('auto_summarize'),
                        'auto_summarize.dispatch.earliest_time': this.model.inmem.entry.content.get('auto_summarize.dispatch.earliest_time')
                    });
                }
            }, this);
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .save.modal-btn-primary': function(e) {
                this.model.inmem.save({}, {
                    success: function(model, response) {
                        this.model.report.fetch();
                        this.remove();
                        if (this.model.controller) {
                            this.model.controller.trigger('refreshEntities');
                        }
                    }.bind(this)
                });
                e.preventDefault();
            }
        }),
        render: function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Acceleration").t());

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            $.when(this.intentionsParserDeferred).then(function(){
                var canSummarize = ((this.model.searchJob && this.model.searchJob.canSummarize()) || 
                                        (this.model.intentionsParser && this.model.intentionsParser.get('canSummarize'))) &&
                                    !this.model.inmem.isSampled();
                if (canSummarize) {
                    this.model.inmem.setAccelerationWarning(canSummarize);
                    this.children.name.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.acceleration.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.summary_range.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                    if (this.model.inmem.entry.content.get("auto_summarize")) {
                        this.children.summary_range.$el.show();
                    } else {
                        this.children.summary_range.$el.hide();
                    }

                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="save btn btn-primary modal-btn-primary pull-right">' + _('Save').t() + '</a>');
                } else {
                    this.$(Modal.BODY_FORM_SELECTOR).append('<div>' + _('This report cannot be accelerated.').t() + '</div>');
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                }
            }.bind(this));

            return this;
        }
    });
});
