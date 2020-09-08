define(
        [
            'underscore',
            'module',
            'models/shared/ScheduleWindow',
            'views/Base',
            'views/shared/Modal',
            'views/shared/ScheduleSentence',
            'views/shared/controls/ControlGroup',
            'uri/route',
            'splunk.i18n',
            'splunk.util'
        ],
        function(
            _,
            module,
            ScheduleWindowModel,
            Base,
            Modal,
            ScheduleSentence,
            ControlGroup,
            route,
            i18n,
            splunkUtil
        ) {
        return Base.extend({
            moduleId: module.id,
            className: 'form form-horizontal',
            /**
            * @param {Object} options {
            *        model: {
            *            application: <models.Application>
            *            inmem: <models.Report>,
            *            cron: <models.Cron>,
            *            timeRange: <models.TimeRange>,
            *            user: <models.services.admin.User>,
            *            appLocal: <models.services.AppLocal>,
            *            scheduleWindow: <models.shared.ScheduleWindow>
            *        },
            *        collection: <collections.services.data.ui.Times>
            * }
            **/
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                //views
                var checkBoxLabel = this.model.inmem.entry.content.get('disabled') ? _("Enable and Schedule Report").t() : _('Schedule Report').t();

                this.children.name = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.inmem.entry
                    },
                    label: _('Report').t()
                });
                
                var configScheduleHelpLink = route.docHelp(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        'learnmore.report.scheduled'
                );
                this.children.scheduleCheck = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    controlOptions: {
                        modelAttribute: 'scheduled_and_enabled',
                        model: this.model.inmem
                    },
                    label: checkBoxLabel,
                    help: '<a href="' + configScheduleHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
                });

                this.children.scheduleSentence = new ScheduleSentence({
                    model: {
                        cron: this.model.cron,
                        application: this.model.application
                    },
                    lineOneLabel: _('Schedule').t(),
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }
                });

                if (this.model.user.canEditSearchScheduleWindow()) {
                    var scheduleWindowItems = [];
                    _.each(ScheduleWindowModel.VALUE_OPTIONS, function(value) {
                        var item = {};
                        item.value = value;
                        if (item.value === 'auto') {
                            item.label = _('Auto').t();
                        } else {
                            var valueAsInt = parseInt(value, 10);
                            if (valueAsInt === 0) {
                                item.label = _('No window').t();
                            } else {
                                if (valueAsInt < 60) {
                                    item.label = splunkUtil.sprintf(i18n.ungettext('%s minute', '%s minutes', valueAsInt), valueAsInt);
                                } else {
                                    var hours = parseInt(valueAsInt/60, 10);
                                    item.label = splunkUtil.sprintf(i18n.ungettext('%s hour', '%s hours', hours), hours);
                                }
                            }
                        }
                        scheduleWindowItems.push(item);
                    });
                    
                    scheduleWindowItems.push({label: _('Custom').t(), value: 'custom'});
                    
                    this.children.scheduleWindow = new ControlGroup({
                        className: 'control-group',
                        controlType: 'SyntheticSelect',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: 'schedule_window_option',
                            model: this.model.scheduleWindow,
                            items: scheduleWindowItems,
                            toggleClassName: 'btn',
                            popdownOptions: {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        },
                        tooltip: _('Let report run at any time within a window that opens at its scheduled run time, ' +
                            'to improve efficiency when there are many concurrently scheduled reports. The “Auto” ' +
                            'setting automatically determines the best window width for the report.').t(),
                        label: _('Schedule Window').t()
                    });
                    
                    this.children.customWindow = new ControlGroup({
                        controlType: 'Text',
                        controlOptions: {
                            additionalClassNames: 'custom-window',
                            modelAttribute: 'custom_window',
                            model: this.model.scheduleWindow
                        },
                        label: _('Custom Window').t()
                    });
                }

                if (this.model.user.canEditSearchSchedulePriority()) {
                    var schedulePriorityItems = [
                        { label: _('Default').t(), value: 'default'},
                        { label: _('Higher').t(), value: 'higher'},
                        { label: _('Highest').t(), value: 'highest'}
                    ];
                    this.children.schedulePriority = new ControlGroup({
                        className: 'control-group',
                        controlType: 'SyntheticSelect',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: 'schedule_priority',
                            model: this.model.inmem.entry.content,
                            items: schedulePriorityItems,
                            toggleClassName: 'btn',
                            popdownOptions: {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        },
                        tooltip: _('Raise the scheduling priority of a report. Set to “Higher” to prioritize it above ' +
                            'other searches of the same scheduling mode, or “Highest” to prioritize it above other ' +
                            'searches regardless of mode. Use with discretion.').t(), 
                        label: _('Schedule Priority').t()
                    });
                }

                //event listeners
                this.model.inmem.on('change:scheduled_and_enabled', this.isScheduledToggle, this);
                this.model.timeRange.on('applied', function() {
                    this.model.inmem.entry.content.set({
                        'dispatch.earliest_time': this.model.timeRange.get('earliest'),
                        'dispatch.latest_time':this.model.timeRange.get('latest')
                    });
                    this.setLabel();
                }, this);
                this.model.timeRange.on('change:earliest_epoch change:latest_epoch change:earliest change:latest', _.debounce(this.setLabel, 0), this);
                
                this.listenTo(this.model.scheduleWindow, 'change:schedule_window_option', this.toggleCustomWindow);
            },
            isScheduledToggle: function() {
                if(this.model.inmem.get('scheduled_and_enabled')) {
                    this.children.scheduleSentence.$el.show();
                    this.$('div.timerange').show();
                    if (this.children.scheduleWindow) {
                        this.children.scheduleWindow.$el.show();
                        this.toggleCustomWindow();
                    }
                    this.children.schedulePriority && this.children.schedulePriority.$el.show();
                } else {
                    this.children.scheduleSentence.$el.hide();
                    this.$('div.timerange').hide();
                    if (this.children.scheduleWindow) {
                        this.children.scheduleWindow.$el.hide();
                        this.children.customWindow.$el.hide();
                    }
                    this.children.schedulePriority && this.children.schedulePriority.$el.hide();
                }
                this.model.inmem.trigger('togglePrimaryButton');
            },
            toggleCustomWindow: function() {
                if (this.model.scheduleWindow.get('schedule_window_option') === 'custom') {
                    this.children.customWindow.$el.show();
                } else {
                    this.children.customWindow.$el.hide();
                }
            },
            setLabel: function() {
                var timeLabel = this.model.timeRange.generateLabel(this.collection);
                this.$el.find("span.time-label").text(timeLabel);
            },
            render: function() {
                this.children.name.render().appendTo(this.$el);
                if (this.model.inmem.entry.content.get('disabled')) {
                    this.$el.append('<div>' + _('This report is currently disabled.').t() + '</div>');
                }
                this.children.scheduleCheck.render().appendTo(this.$el);
                this.children.scheduleSentence.render().appendTo(this.$el);

                this.$el.append('<div class="control-group timerange" style="display: block;"><label class="control-label">' + _('Time Range').t() + '</label></div>');
                this.$('div.timerange').append('<div class="controls"><a href="#" class="btn timerange-control"><span class="time-label"></span><span class="icon-triangle-right-small"></span></a></div>');

                this.children.schedulePriority && this.children.schedulePriority.render().appendTo(this.$el);
                if (this.children.scheduleWindow) {
                    this.children.scheduleWindow.render().appendTo(this.$el);
                    this.children.customWindow.render().appendTo(this.$el);
                    this.$('.custom-window').append('<span class="custom-window-text">'+_('minutes').t()+'</span>');
                } 
                
                this.setLabel();
                this.isScheduledToggle();
                return this;
            }
        });
    }
);
