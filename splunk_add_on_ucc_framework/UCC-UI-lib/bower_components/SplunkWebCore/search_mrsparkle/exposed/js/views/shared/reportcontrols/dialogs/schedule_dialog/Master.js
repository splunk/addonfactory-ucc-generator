define([
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'models/shared/ScheduleWindow',
    'models/shared/Cron',
    'models/shared/TimeRange',
    'collections/services/data/ui/Times',
    'views/shared/Modal',
    'module',
    'views/shared/reportcontrols/dialogs/schedule_dialog/step1/Master',
    'views/shared/reportcontrols/dialogs/schedule_dialog/Step2',
    'splunk.util',
    './Master.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        ScheduleWindowModel,
        Cron,
        TimeRangeModel,
        TimesCollection,
        Modal,
        module,
        Step1,
        Step2,
        splunkUtil,
        css
    ) {
    return Modal.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *       model: {
            *           application: <models.Application>
            *           report: <models.Report>,
            *           appLocal: <models.services.AppLocal>,
            *           user: <models.services.admin.User>,
            *           controller: <Backbone.Model> (Optional)
            *       }
            * }
            */
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                //model
                this.model = {
                    application: this.model.application,
                    report: this.model.report,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo,
                    appLocal: this.model.appLocal,
                    timeRange: new TimeRangeModel({enableRealTime:false}),
                    inmem: this.model.report.clone(),
                    cron: Cron.createFromCronString(this.model.report.entry.content.get('cron_schedule') || '0 6 * * 1'),
                    scheduleWindow: new ScheduleWindowModel(),
                    controller: this.model.controller
                };
                //collections
                this.collection = new TimesCollection();

                this.collectionDeferred = this.collection.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    }
                });

                this.model.inmem.set({
                    scheduled_and_enabled: !this.model.inmem.entry.content.get('disabled') && this.model.inmem.entry.content.get('is_scheduled'),
                    schedule_warning_message: this.model.inmem.getScheduleWarning(this.model.report)
                });

                this.model.scheduleWindow.setScheduleWindow(this.model.inmem.entry.content.get('schedule_window'));

                //views
                this.children.step1 = new Step1({
                    model: {
                        state: this.model.inmem.entry.content,
                        application: this.model.application,
                        inmem: this.model.inmem,
                        cron: this.model.cron,
                        timeRange: this.model.timeRange,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        scheduleWindow: this.model.scheduleWindow
                    },
                    collection: this.collection
                });

                this.children.step2 = new Step2({
                    model: {
                        inmem: this.model.inmem,
                        application: this.model.application,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    }
                });

                //event listeners for workflow navigation
                this.model.inmem.on('next', function() {
                    this.model.cron.validate();
                    this.model.scheduleWindow.validate();
                    if (this.model.scheduleWindow.isValid() && this.model.cron.isValid()) {
                        this.children.step1.$el.hide();
                        this.$el.addClass(Modal.CLASS_MODAL_WIDE);
                        this.children.step2.$el.show();
                    }
                },this);

                this.model.inmem.entry.content.on('back', function() {
                    this.children.step2.$el.hide();
                    this.$el.removeClass(Modal.CLASS_MODAL_WIDE);
                    this.children.step1.$el.show();
                },this);

                //event listeners for saving
                this.model.inmem.on('saveSuccessNotScheduled', function() {
                    this.model.report.entry.content.set('is_scheduled', 0);
                    this.hide();
                    if (this.model.controller) {
                        this.model.controller.trigger('refreshEntities');
                    }
                }, this);

                this.model.inmem.on('saveSchedule', function() {
                    this.transposeFromUI();

                    this.model.inmem.entry.content.set('cron_schedule', this.model.cron.getCronString());
                    // SPL-109045: Set dispatchAs to owner if report is scheduled.
                    this.model.inmem.entry.content.set('dispatchAs', 'owner');

                    this.model.inmem.save({}, {
                        success: function(model, response){
                            this.model.report.fetch();
                            this.hide();
                            if (this.model.controller) {
                                this.model.controller.trigger('refreshEntities');
                            }
                        }.bind(this)
                    });
                }, this);
            },
            transposeFromUI: function() {
                if (this.model.inmem.entry.content.get('action.email')) {
                    var sendResults = splunkUtil.normalizeBoolean(this.model.inmem.entry.content.get('action.email.sendpdf')) ||
                            splunkUtil.normalizeBoolean(this.model.inmem.entry.content.get('action.email.sendcsv')) ||
                            splunkUtil.normalizeBoolean(this.model.inmem.entry.content.get('action.email.inline'));
                    this.model.inmem.entry.content.set('action.email.sendresults', +sendResults);
                } else {
                    // SPL-113747 - if email is not selected do not save email address
                    this.model.inmem.entry.content.set({
                        'action.email.to': this.model.report.entry.content.get('action.email.to'),
                        'action.email.cc': this.model.report.entry.content.get('action.email.cc'),
                        'action.email.bcc': this.model.report.entry.content.get('action.email.bcc')
                    });
                }

                if (this.model.inmem.get('scheduled_and_enabled')) {
                    this.model.inmem.entry.content.set({
                        'is_scheduled': 1,
                        'disabled': 0
                    });
                }

                this.model.inmem.entry.content.set('schedule_window', this.model.scheduleWindow.getScheduleWindow());
            },
            render: function() {
                this.$el.addClass('schedule-modal');
                var timeRangeDeferred = this.model.timeRange.save({
                    'earliest': this.model.inmem.entry.content.get('dispatch.earliest_time'),
                    'latest': this.model.inmem.entry.content.get('dispatch.latest_time')
                });

                $.when(timeRangeDeferred, this.collectionDeferred).then(function() {
                    this.children.step1.render().appendTo(this.$el);
                    this.children.step2.render().appendTo(this.$el);
                    this.children.step2.$el.hide();
                }.bind(this));
            }
        }
    );
});
