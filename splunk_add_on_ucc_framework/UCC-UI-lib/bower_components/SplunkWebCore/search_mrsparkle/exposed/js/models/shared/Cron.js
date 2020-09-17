define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'splunk.util'
    ],
    function($, _, BaseModel, splunkUtil) {
        var Cron = BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            defaults: {
                minute: '0',
                hour: '6',
                dayOfMonth: '*',
                month: '*',
                dayOfWeek: "1",
                cronType: 'weekly',
                cron_schedule: '0 6 * * 1'
            },
            validation: {
                'cron_schedule': function(value, attr, computedState) {
                    var type = computedState['ui.type'] || 'scheduled';
                    if (type === 'scheduled' && computedState['cronType'] === 'custom') {
                        if (_.isUndefined(value) || $.trim(value).length === 0) {
                            return _("Custom cron is required").t();
                        }
                        if (!splunkUtil.validateCronString(value)) {
                            return _("Invalid cron").t();
                        }
                    }
                }
            },
            setCronType: function(options) {
                var minute = this.get('minute'),
                    hour = this.get('hour'),
                    dayOfMonth = this.get('dayOfMonth'),
                    month = this.get('month'),
                    dayOfWeek = this.get('dayOfWeek');

                //outliers
                if (month !== "*") {
                    this.set('cronType', Cron.CRON_TYPES.CUSTOM, options);
                    return;
                }

                //if day of week is not * then we to test for weekly
                if (/^[0-6]$/.test(dayOfWeek)) {
                    if (
                        (minute === '0') &&
                        (/^([0-9]|1[0-9]|2[0-3])$/.test(hour)) &&
                        (dayOfMonth === '*')
                    ) {
                        this.set('cronType', Cron.CRON_TYPES.WEEKLY, options);
                        return;
                    }
                } else if (dayOfWeek === '*') {
                    //test for monthly
                    if (/^([0-9]|[1-2][0-9]|3[0-1])$/.test(dayOfMonth)) {
                        if (
                            (/^([0-9]|1[0-9]|2[0-3])$/.test(hour)) &&
                            (minute === '0')
                        ) {
                            this.set('cronType', Cron.CRON_TYPES.MONTHLY, options);
                            return;
                        }
                    } else if (dayOfMonth === '*') {
                        //test for daily by testing hour
                        if (
                            (/^([0-9]|1[0-9]|2[0-3])$/.test(hour)) &&
                            (minute === '0')
                        ) {
                            this.set('cronType', Cron.CRON_TYPES.DAILY, options);
                            return;
                        } else if (
                            hour === '*' &&
                            (/^(0|15|30|45)$/.test(minute))
                        ) {
                            this.set('cronType', Cron.CRON_TYPES.HOURLY, options);
                            return;
                        }
                    }
                }

                this.set('cronType', Cron.CRON_TYPES.CUSTOM, options);
            },
            setDefaults: function() {
                switch (this.get('cronType')) {
                    case Cron.CRON_TYPES.HOURLY:
                        this.set('minute', '0');
                        break;
                    case Cron.CRON_TYPES.DAILY:
                        this.set('hour', '0');
                        break;
                    case Cron.CRON_TYPES.WEEKLY:
                        this.set({
                            dayOfWeek: '1',
                            hour: '0'
                        });
                        break;
                    case Cron.CRON_TYPES.MONTHLY:
                        this.set({
                            dayOfMonth: '1',
                            hour: '0'
                        });
                        break;
                }
            },
            getCronString: function() {
                var minute = this.get('minute'),
                    hour = this.get('hour'),
                    dayOfMonth = this.get('dayOfMonth'),
                    month = this.get('month'),
                    dayOfWeek = this.get('dayOfWeek'),
                    cron_schedule = this.get('cron_schedule'),
                    cronType = this.get('cronType');

                switch(cronType) {
                    case Cron.CRON_TYPES.HOURLY:
                        return minute + ' * * * *';
                    case Cron.CRON_TYPES.DAILY:
                        return '0 ' + hour +  ' * * *';
                    case Cron.CRON_TYPES.WEEKLY:
                        return '0 ' + hour +  ' * * ' + dayOfWeek;
                    case Cron.CRON_TYPES.MONTHLY:
                        return '0 ' + hour + ' ' + dayOfMonth + ' * *';
                    case Cron.CRON_TYPES.CUSTOM:
                        return cron_schedule;
                }
            },
            getDayOfWeekName: function() {
                return Cron.getDayOfWeekNameFromNum(parseInt(this.get('dayOfWeek'), 10));
            },
            getScheduleString: function() {
                switch(this.get('cronType')) {
                    case 'hourly':
                        return splunkUtil.sprintf(_("Hourly, at %s minutes past the hour.").t(), this.get('minute'));
                    case 'daily':
                        return splunkUtil.sprintf(_("Daily, at %s:00.").t(), this.get('hour'));
                    case 'weekly':
                        return splunkUtil.sprintf(_("Weekly, %(dayOfWeek)s at %(hour)s:00.").t(), { dayOfWeek: this.getDayOfWeekName(), hour: this.get('hour')});
                    case 'monthly':
                        return splunkUtil.sprintf(_("Monthly, on day %(dayOfMonth)s at %(hour)s:00.").t(), { dayOfMonth: this.get('dayOfMonth'), hour: this.get('hour')});
                    case 'custom':
                        return _("Cron Schedule.").t();
                }
            }
        },
        // class-level properties
        {
            createFromCronString: function(cronString) {
                var pieces = cronString.trim().split(/\s+/);
                if(!pieces || pieces.length !== 5) {
                    throw splunkUtil.sprintf(_("Invalid cron string: %s").t(), cronString);
                }
                // the above only verifies that the time string had the correct format,
                // next make sure it also represents a valid time
                var cronModel = new Cron({
                    minute: pieces[0],
                    hour: pieces[1],
                    dayOfMonth: pieces[2],
                    month: pieces[3],
                    dayOfWeek: pieces[4],
                    cron_schedule: pieces.join(' ')
                });

                cronModel.setCronType();
                return cronModel;
            },
            getDayOfWeekNameFromNum: function(dayOfWeekNum) {
                switch(dayOfWeekNum) {
                    case 0:
                        return _("Sunday").t();
                    case 1:
                        return _("Monday").t();
                    case 2:
                        return _("Tuesday").t();
                    case 3:
                        return _("Wednesday").t();
                    case 4:
                        return _("Thursday").t();
                    case 5:
                        return _("Friday").t();
                    case 6:
                        return _("Saturday").t();
                    case 7:
                        return _("Sunday").t();
                }
            },
            CRON_TYPES : {
                HOURLY: 'hourly',
                DAILY: 'daily',
                WEEKLY: 'weekly',
                MONTHLY: 'monthly',
                CUSTOM: 'custom'
            }
        });

        return Cron;
    }
);
