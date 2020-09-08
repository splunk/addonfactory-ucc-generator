define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'models/ACLReadOnly',
        'models/search/Report',
        'models/shared/Cron',
        'models/shared/TimeRange',
        'util/time',
        'util/splunkd_utils',
        'splunk.util',
        'splunk.i18n',
        'util/math_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        ACLReadOnlyModel,
        ReportModel,
        CronModel,
        TimeRangeModel,
        time_utils,
        splunkd_utils,
        splunkUtil,
        i18n,
        mathUtils
    ){
        var EntryContentDefaults = {
            'ui.type': 'scheduled',
            'ui.realtime.triggercondition': 'per_result',
            'ui.realtime.resultscomparator': 'greater than',
            'ui.realtime.resultstimeunit': 'm',
            'ui.realtime.resultscomparatorinput': '0',
            'ui.realtime.resultstime': '1',
            'ui.realtime.customsearch': void(0),
            'ui.scheduled.triggercondition': 'events',
            'ui.scheduled.resultscomparator': 'greater than',
            'ui.scheduled.resultsinput': '0',
            'ui.permissions': splunkd_utils.USER,
            'ui.executeactions': true,
            'ui.supresstime': 60,
            'ui.supresstimeunit': 's'
        };
        var Model = ReportModel.extend({
            initialize: function(attributes, options) {
                ReportModel.prototype.initialize.apply(this, arguments);
            },
            setFromSplunkD: function(payload, options) {
                ReportModel.prototype.setFromSplunkD.apply(this, arguments);
                this.transposeFromSavedsearch();
                return;
            },
            validateAssociated: function() {
                var validCronandWorkingTimerange = true;
                this.entry.content.validate();
                if (this.cron.get('cronType') === 'custom' &&
                    this.entry.content.get('ui.type') === 'scheduled') {
                    this.cron.validate();
                    this.workingTimeRange.validate();
                    validCronandWorkingTimerange = this.cron.isValid() && this.workingTimeRange.isValid();
                } else {
                    this.cron.clearErrors();
                    this.workingTimeRange.clearErrors();
                }
                return validCronandWorkingTimerange && this.entry.content.isValid();    
            },
            parse: function(response) {
                var parsedResponse = ReportModel.prototype.parse.apply(this, arguments);
                this.transposeFromSavedsearch();
                return parsedResponse;
            },
            sync: function(method, model, options) {
                options = $.extend(true, {}, options || {});
                if (method === 'create' || method === 'update') {
                    
                    // transposeToSavedsearch is called below and sets values on the entry content
                    // save the original values to set back on the mode if there is an error.
                    var cloneContent = model.entry.content.clone().toJSON(),
                        error = options.error;
                        
                    options.error = function () {
                        model.entry.content.set(cloneContent);
                        if (error) {
                            error.apply(this, arguments);
                        }
                    };
                    
                    this.transposeToSavedsearch();
                    if (!this.isAlert()) {
                        throw new Error("Can not edit a report with an alert model.");
                    }
                }

                return ReportModel.prototype.sync.apply(this, arguments);
            },
            setNewAlertAttr: function() {
                this.entry.set('name', '');
                this.entry.content.set({
                    // for backwards compatibility
                    'action.email.useNSSubject': '1',
                    // should not accelerate an alert
                    'action.summary_index': '0',
                    'disabled': false,
                    'is_scheduled': 1
                });
            },
            canNotEditInUI: function() {
                // can not edit in ui if realtime alltime with trigger type other than always
                return (this.entry.content.get('dispatch.earliest_time')==='rt' ||
                        this.entry.content.get('dispatch.latest_time') ==='rt') &&
                    this.entry.content.get('alert_type') !== 'always';
            },
            initializeAssociated: function() {
                ReportModel.prototype.initializeAssociated.apply(this, arguments);
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                
                this.cron = this.cron || new RootClass.Cron();
                this.associated.cron = this.cron;
                
                this.workingTimeRange = this.workingTimeRange || new RootClass.WorkingTimeRange({enableRealTime:false});
                this.associated.workingTimeRange = this.workingTimeRange;
            },
            transposeToSavedsearch: function() {
                switch(this.entry.content.get('ui.type')){
                    case 'realtime':
                        if (this.entry.content.get('ui.realtime.triggercondition') != 'per_result'){
                            if(this.entry.content.get('ui.realtime.resultstime')){
                                this.entry.content.set({
                                    'dispatch.earliest_time': 'rt-' + this.entry.content.get('ui.realtime.resultstime') + '' + this.entry.content.get('ui.realtime.resultstimeunit'),
                                    'dispatch.latest_time': 'rt-0' + this.entry.content.get('ui.realtime.resultstimeunit'),
                                    'cron_schedule': '* * * * *'
                                });
                            }
                        } else {
                            this.entry.content.set({
                                'dispatch.earliest_time': 'rt',
                                'dispatch.latest_time': 'rt',
                                'cron_schedule': '* * * * *'
                            });
                        }
                        
                        switch(this.entry.content.get('ui.realtime.triggercondition')){
                            case 'per_result':
                                this.entry.content.set('alert_type', 'always');
                                break;
                            case 'events':
                                this.entry.content.set({
                                    'alert_type': 'number of events',
                                    'alert_comparator': this.entry.content.get('ui.realtime.resultscomparator'),
                                    'alert_threshold': this.entry.content.get('ui.realtime.resultscomparatorinput')
                                });
                                break;
                            case 'hosts':
                                this.entry.content.set({
                                    'alert_type': 'number of hosts',
                                    'alert_comparator': this.entry.content.get('ui.realtime.resultscomparator'),
                                    'alert_threshold': this.entry.content.get('ui.realtime.resultscomparatorinput')
                                });
                                break;
                            case 'sources':
                                this.entry.content.set({
                                    'alert_type': 'number of sources',
                                    'alert_comparator': this.entry.content.get('ui.realtime.resultscomparator'),
                                    'alert_threshold': this.entry.content.get('ui.realtime.resultscomparatorinput')
                                });
                                break;
                            case 'custom':
                                this.entry.content.set({
                                    'alert_type': 'custom',
                                    'alert_condition': this.entry.content.get('ui.realtime.customsearch')
                                });
                                break;
                        }
                        break;
                    case 'scheduled':
                        switch(this.entry.content.get('ui.scheduled.triggercondition')){
                            case 'events':
                                this.entry.content.set({
                                    'alert_type': 'number of events',
                                    'alert_comparator': this.entry.content.get('ui.scheduled.resultscomparator'),
                                    'alert_threshold': this.entry.content.get('ui.scheduled.resultsinput')
                                });
                                break;
                            case 'hosts':
                                this.entry.content.set({
                                    'alert_type': 'number of hosts',
                                    'alert_comparator': this.entry.content.get('ui.scheduled.resultscomparator'),
                                    'alert_threshold': this.entry.content.get('ui.scheduled.resultsinput')
                                });
                                break;
                            case 'sources':
                                this.entry.content.set({
                                    'alert_type': 'number of sources',
                                    'alert_comparator': this.entry.content.get('ui.scheduled.resultscomparator'),
                                    'alert_threshold': this.entry.content.get('ui.scheduled.resultsinput')
                                });
                                break;
                            case 'custom':
                                this.entry.content.set({
                                    'alert_type': 'custom',
                                    'alert_condition': this.entry.content.get('ui.scheduled.customsearch')
                                });
                                break;
                        }
                        switch(this.cron.get('cronType')){
                            case 'hourly':
                                this.entry.content.set({
                                    'dispatch.earliest_time': '-1h',
                                    'dispatch.latest_time': 'now'
                                });
                                break;
                            case 'daily':
                                this.entry.content.set({
                                    'dispatch.earliest_time': '-1d',
                                    'dispatch.latest_time': 'now'
                                });
                                break;
                            case 'weekly':
                                this.entry.content.set({
                                    'dispatch.earliest_time': '-1w',
                                    'dispatch.latest_time': 'now'
                                });
                                break;
                            case 'monthly':
                                this.entry.content.set({
                                    'dispatch.earliest_time': '-1mon',
                                    'dispatch.latest_time': 'now'
                                });
                                break;
                            case 'custom':
                                this.entry.content.set({
                                    'dispatch.earliest_time': this.workingTimeRange.get('earliest'),
                                    'dispatch.latest_time': this.workingTimeRange.get('latest')
                                });
                                break;
                        }
                        this.entry.content.set({'cron_schedule': this.cron.getCronString()});
                        break;
                }
                
                if (this.entry.content.has('ui.executeactions') && this.entry.content.get('ui.executeactions') &&
                    !(this.entry.content.get('ui.type') === 'realtime' &&
                        this.entry.content.get('ui.realtime.triggercondition') === 'per_result')) {
                    this.entry.content.set({
                        'alert.digest_mode' : 1
                    });
                } else {
                    this.entry.content.set({
                        'alert.digest_mode' : 0
                    });
                }
                
                if (this.entry.content.get('alert.suppress')) {
                    this.entry.content.set({
                        'alert.suppress.period': this.entry.content.get('ui.supresstime') + this.entry.content.get('ui.supresstimeunit')
                    });
                    if (!(this.entry.content.get('ui.type') == 'realtime' &&
                            this.entry.content.get('ui.realtime.triggercondition') == 'per_result') &&
                        this.entry.content.get('ui.executeactions')) {
                        this.entry.content.set('alert.suppress.fields', '');
                    }
                } else {
                    // ensurse 'alert.supress' is not null
                    this.entry.content.set('alert.suppress', 0);
                }
                
                if (this.entry.content.get('action.email')) {
                    this.entry.content.set({
                        'action.email.sendresults': +(
                            splunkUtil.normalizeBoolean(this.entry.content.get('action.email.sendpdf')) || 
                            splunkUtil.normalizeBoolean(this.entry.content.get('action.email.sendcsv')) || 
                            splunkUtil.normalizeBoolean(this.entry.content.get('action.email.inline'))
                        )
                    });
                } else {
                    //SPL-100249 must not send action.email.to if action.email is not true. This way
                    //if an invalid email is enterned it is not sent and it does not remove a
                    //previously valid email
                    this.entry.content.set('action.email.to', '');
                }
                
                if (!this.entry.content.get('action.script')) {
                    //SPL-100872 must not send action.script.filename if action.script is not true. This way
                    //if an invalid filename is enterned it is not sent and it does not remove a
                    //previously valid filename
                    this.entry.content.set('action.script.filename', '');
                }
                
                var actions = [];
                 _.each(this.entry.content.attributes, function(value, attr) {
                    if (value == true) {
                        var actionName = attr.match(/^action.([^\.]*)$/);
                        if (actionName) {
                            actions.push(actionName[1]);
                        }
                    }
                });
                 
                // set actions
                this.entry.content.set('actions', actions.join(', '));
            },
            transposeFromSavedsearch: function() {
                // saving isAlert so even after changing attrs here we know what it came in as 
                var isAlert = this.isAlert();
                if (this.isNew()) {
                    // Create alert
                    if (!isAlert) {
                        // if new alert from a saved report not of type alert
                        this.stripReportAttributesToSaveAsAlert();
                    }
                    this.setNewAlertAttr();
                } else {
                    // Edit alert
                    if (!isAlert) {
                        throw new Error("Can not edit a report with an alert model.");
                    }
                }
                if (isAlert) {
                    this.transposeFromSavedsearchAlert();
                }
            },
            transposeFromSavedsearchAlert: function() {
                // Settings
                var triggercondition = this.entry.content.get('alert_type'),
                    earliestTime = this.entry.content.get('dispatch.earliest_time'),
                    latestTime = this.entry.content.get('dispatch.latest_time'),
                    type = this.isRealTime() ? 'realtime' : 'scheduled',
                    attr = {
                        'ui.type': type
                    };
                    
                this.workingTimeRange.set({
                    'earliest': earliestTime,
                    'latest': latestTime
                });
                
                switch(type){
                    case 'realtime' :
                        var timeMatch = earliestTime.match(/\d+/);
                        switch(triggercondition) {
                            case 'always' :
                                attr['ui.realtime.triggercondition'] = 'per_result';
                                break;
                            case 'number of events' :
                                attr['ui.realtime.triggercondition'] = 'events';
                                attr['ui.realtime.resultscomparator'] = this.entry.content.get('alert_comparator');
                                attr['ui.realtime.resultscomparatorinput'] = this.entry.content.get('alert_threshold');
                                attr['ui.realtime.resultstime'] = timeMatch ? timeMatch[0] : "0";
                                attr['ui.realtime.resultstimeunit'] = _.indexOf(['d', 'h', 'm'], earliestTime.match(/[a-z]$/)[0]) === -1 ? 'm' : earliestTime.match(/[a-z]$/)[0];
                                break;
                            case 'number of hosts' :
                                attr['ui.realtime.triggercondition'] = 'hosts';
                                attr['ui.realtime.resultscomparator'] = this.entry.content.get('alert_comparator');
                                attr['ui.realtime.resultscomparatorinput'] = this.entry.content.get('alert_threshold');
                                attr['ui.realtime.resultstime'] = timeMatch ? timeMatch[0] : "0";
                                attr['ui.realtime.resultstimeunit'] = _.indexOf(['d', 'h', 'm'], earliestTime.match(/[a-z]$/)[0]) === -1 ? 'm' : earliestTime.match(/[a-z]$/)[0];
                                break;
                            case 'number of sources' :
                                attr['ui.realtime.triggercondition'] = 'sources';
                                attr['ui.realtime.resultscomparator'] = this.entry.content.get('alert_comparator');
                                attr['ui.realtime.resultscomparatorinput'] = this.entry.content.get('alert_threshold');
                                attr['ui.realtime.resultstime'] = timeMatch ? timeMatch[0] : "0";
                                attr['ui.realtime.resultstimeunit'] = _.indexOf(['d', 'h', 'm'], earliestTime.match(/[a-z]$/)[0]) === -1 ? 'm' : earliestTime.match(/[a-z]$/)[0];
                                break;
                            case 'custom' :
                                attr['ui.realtime.triggercondition'] = 'custom';
                                attr['ui.realtime.customsearch'] = this.entry.content.get('alert_condition');
                                attr['ui.realtime.resultstime'] = timeMatch ? timeMatch[0] : "0";
                                attr['ui.realtime.resultstimeunit'] = _.indexOf(['d', 'h', 'm'], earliestTime.match(/[a-z]$/)[0]) === -1 ? 'm' : earliestTime.match(/[a-z]$/)[0];
                                break;
                        }
                        break;
                    case 'scheduled' :
                        if (this.entry.content.get('cron_schedule')) {
                            this.cron.set(CronModel.createFromCronString(this.entry.content.get('cron_schedule')).toJSON());
                            //check if earliest latest are defaults if not set cronType to custom
                            switch(this.cron.get('cronType')){
                                case 'hourly':
                                    if (earliestTime !== '-1h' || latestTime !== 'now') {
                                        this.cron.set('cronType', 'custom');
                                    }
                                    break;
                                case 'daily':
                                    if (earliestTime !== '-1d' || latestTime !== 'now') {
                                        this.cron.set('cronType', 'custom');
                                    }
                                    break;
                                case 'weekly':
                                    if (earliestTime !== '-1w' || latestTime !== 'now') {
                                        this.cron.set('cronType', 'custom');
                                    }
                                    break;
                                case 'monthly':
                                    if (earliestTime !== '-1mon' || latestTime !== 'now') {
                                        this.cron.set('cronType', 'custom');
                                    }
                                    break;
                            }
                        }
                        switch(triggercondition) {
                            case 'always' :
                                    attr['ui.scheduled.triggercondition'] = 'events';
                                    attr['ui.scheduled.resultscomparator'] = 'greater than';
                                    attr['ui.scheduled.resultsinput'] = '0';
                                break;
                            case 'number of events' :
                                    attr['ui.scheduled.triggercondition'] = 'events';
                                    attr['ui.scheduled.resultscomparator'] = this.entry.content.get('alert_comparator');
                                    attr['ui.scheduled.resultsinput'] = this.entry.content.get('alert_threshold');
                                break;
                            case 'number of hosts' :
                                    attr['ui.scheduled.triggercondition'] = 'hosts';
                                    attr['ui.scheduled.resultscomparator'] = this.entry.content.get('alert_comparator');
                                    attr['ui.scheduled.resultsinput'] = this.entry.content.get('alert_threshold');
                                break;
                            case 'number of sources' :
                                    attr['ui.scheduled.triggercondition'] = 'sources';
                                    attr['ui.scheduled.resultscomparator'] = this.entry.content.get('alert_comparator');
                                    attr['ui.scheduled.resultsinput'] = this.entry.content.get('alert_threshold');
                                break;
                            case 'custom' :
                                attr['ui.scheduled.triggercondition'] = 'custom';
                                attr['ui.scheduled.customsearch'] = this.entry.content.get('alert_condition');
                                break;
                        }
                        break;
                 }
                 
                // Trigger Conditions
                attr['ui.executeactions'] = splunkUtil.normalizeBoolean(this.entry.content.get('alert.digest_mode'));
                
                // Throttle
                var supresstime = this.entry.content.get('alert.suppress.period');
                if (supresstime) {
                    attr['ui.supresstime'] = supresstime.match(/^\d*/)[0];
                    var timeUnit = supresstime.match(/s|m|h|d/);
                    attr['ui.supresstimeunit'] = timeUnit ? timeUnit[0] : 's';
                }
                
                // Sharing
                attr['ui.permissions'] = splunkd_utils.USER;
                
                this.entry.content.set(attr);
            },
            getAlertTriggerConditionString: function() {
                var type = this.entry.content.get('alert_type'),
                    earliestTime = this.entry.content.get('dispatch.earliest_time'),
                    latestTime = this.entry.content.get('dispatch.latest_time'),
                    isRealtime = (earliestTime && time_utils.isRealtime(earliestTime)) || (latestTime && time_utils.isRealtime(latestTime)),
                    threshold = this.entry.content.get('alert_threshold'),
                    timeParse = time_utils.parseTimeString(earliestTime),
                    alertCondition = this.entry.content.get('alert_condition'),
                    isAllTimeRT = earliestTime === 'rt' ||latestTime === 'rt';
                switch(type) {
                    case 'always':
                        if (isRealtime) {
                            return _('Per-Result.').t();
                        }
                        return _('Number of Results is > 0.').t();
                    case 'number of events':
                    case 'number of hosts':
                    case 'number of sources':
                        if (isAllTimeRT) {
                            return _('Unsupported.').t();
                        }
                        var typeText = {
                            'number of events': _("Results").t(),
                            'number of hosts': _("Hosts").t(),
                            'number of sources': _("Sources").t()
                        };
                        switch(this.entry.content.get('alert_comparator')){
                            case 'greater than':
                                if (isRealtime) {
                                    switch(timeParse.unit) {
                                        case 'm':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is > %(threshold)s in %(timeAmount)s minute.', 'Number of %(typetext)s is > %(threshold)s in %(timeAmount)s minutes.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'h':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is > %(threshold)s in %(timeAmount)s hour.', 'Number of %(typetext)s is > %(threshold)s in %(timeAmount)s hours.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'd':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is > %(threshold)s in %(timeAmount)s day.', 'Number of %(typetext)s is > %(threshold)s in %(timeAmount)s days.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                    }
                                } else {
                                    return splunkUtil.sprintf(_('Number of %(typetext)s is > %(threshold)s.').t(), {typetext: typeText[type], threshold:threshold});
                                }
                                break;
                            case 'less than':
                                if (isRealtime) {
                                    switch(timeParse.unit) {
                                        case 'm':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is < %(threshold)s in %(timeAmount)s minute.', 'Number of %(typetext)s is < %(threshold)s in %(timeAmount)s minutes.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'h':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is < %(threshold)s in %(timeAmount)s hour.', 'Number of %(typetext)s is < %(threshold)s in %(timeAmount)s hours.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'd':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is < %(threshold)s in %(timeAmount)s day.', 'Number of %(typetext)s is < %(threshold)s in %(timeAmount)s days.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                    }
                                } else {
                                    return splunkUtil.sprintf(_('Number of %(typetext)s is < %(threshold)s.').t(), {typetext: typeText[type], threshold:threshold});
                                }
                                break;
                            case 'equal to':
                                if (isRealtime) {
                                    switch(timeParse.unit) {
                                        case 'm':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is = %(threshold)s in %(timeAmount)s minute.', 'Number of %(typetext)s is = %(threshold)s in %(timeAmount)s minutes.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'h':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is = %(threshold)s in %(timeAmount)s hour.', 'Number of %(typetext)s is = %(threshold)s in %(timeAmount)s hours.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'd':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is = %(threshold)s in %(timeAmount)s day.', 'Number of %(typetext)s is = %(threshold)s in %(timeAmount)s days.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                    }
                                } else {
                                    return splunkUtil.sprintf(_('Number of %(typetext)s is = %(threshold)s.').t(), {typetext: typeText[type], threshold:threshold});
                                }
                                break;
                            case 'not equal to':
                                if (isRealtime) {
                                    switch(timeParse.unit) {
                                        case 'm':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is &#8800; %(threshold)s in %(timeAmount)s minute.', 'Number of %(typetext)s is &#8800; %(threshold)s in %(timeAmount)s minutes.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'h':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is &#8800; %(threshold)s in %(timeAmount)s hour.', 'Number of %(typetext)s is &#8800; %(threshold)s in %(timeAmount)s hours.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                        case 'd':
                                            return splunkUtil.sprintf(i18n.ungettext('Number of %(typetext)s is &#8800; %(threshold)s in %(timeAmount)s day.', 'Number of %(typetext)s is &#8800; %(threshold)s in %(timeAmount)s days.', timeParse.amount), {typetext: typeText[type], threshold: threshold, timeAmount: timeParse.amount});
                                    }
                                } else {
                                    return splunkUtil.sprintf(_('Number of %(typetext)s is &#8800; %(threshold)s.').t(), {typetext: typeText[type], threshold:threshold});
                                }
                                break;
                            case 'drops by':
                                // drops by is only supported for non-realtime saved searches
                                return splunkUtil.sprintf(_('Number of %(typetext)s drops by %(threshold)s.').t(), {typetext: typeText[type], threshold:threshold});
                            case 'rises by':
                                // rises by is only supported for non-realtime saved searches
                                return splunkUtil.sprintf(_('Number of %(typetext)s rises by %(threshold)s.').t(), {typetext: typeText[type], threshold:threshold});
                        }
                        break;
                    case 'custom':
                        if (isAllTimeRT) {
                            return _('Unsupported.').t();
                        }
                        if (isRealtime) {
                            switch(timeParse.unit) {
                                case 'm':
                                    return splunkUtil.sprintf(i18n.ungettext('Custom. "%(alertCondition)s" in %(timeAmount)s minute.', 'Custom. "%(alertCondition)s" in %(timeAmount)s minutes.', timeParse.amount), {alertCondition: alertCondition, timeAmount: timeParse.amount});
                                case 'h':
                                    return splunkUtil.sprintf(i18n.ungettext('Custom. "%(alertCondition)s" in %(timeAmount)s hour.', 'Custom. "%(alertCondition)s" in %(timeAmount)s hours.', timeParse.amount), {alertCondition: alertCondition, timeAmount: timeParse.amount});
                                case 'd':
                                    return splunkUtil.sprintf(i18n.ungettext('Custom. "%(alertCondition)s" in %(timeAmount)s day.', 'Custom. "%(alertCondition)s" in %(timeAmount)s days.', timeParse.amount), {alertCondition: alertCondition, timeAmount: timeParse.amount});
                            }
                        } else {
                            return splunkUtil.sprintf(_('Custom. "%s".').t(), alertCondition);
                        }
                        break;
                }
            }
        },
        {
            Entry: BaseModel.extend(
                {
                    initialize: function() {
                        BaseModel.prototype.initialize.apply(this, arguments);
                    }
                },
                {
                    Links: BaseModel,
                    ACL: ACLReadOnlyModel,
                    Content: BaseModel.extend(
                        {
                            initialize: function() {
                                BaseModel.prototype.initialize.apply(this, arguments);
                            },
                            defaults: EntryContentDefaults,
                            validation: {             
                                'ui.type': {
                                    required: true
                                },
                                'ui.realtime.resultscomparatorinput': {
                                    fn: 'validateRealtimeResultsComparatorInput'
                                 },
                                'ui.realtime.resultstime': {
                                    fn: 'validateRealtimeResultsTime'
                                },
                                'ui.realtime.customsearch': {
                                    fn: 'validateRealtimeCustomSearch'
                                },
                                'ui.scheduled.resultsinput': {
                                    fn: 'validateScheduledResultsInput'
                                },
                                'ui.scheduled.customsearch': {
                                    fn: 'validateScheduledCustomSearch'
                                },
                                'alert.suppress.fields': {
                                    fn: 'validateFieldValue'
                                },
                                'ui.supresstime': {
                                    fn: 'validateSuppressTime'
                                },  
                                'alert.track': {
                                    fn: 'validateActions'
                                },
                                'action.script.filename': {
                                    fn: 'validateScriptFilename'
                                },
                                'action.email.to': {
                                    fn: 'validateEmailTo'
                                }
                            },
                            validateRealtimeResultsComparatorInput: function(value, attr, computedState) {
                                if (computedState['ui.type'] === 'realtime' &&
                                    (computedState['ui.realtime.triggercondition'] === 'events' ||
                                        computedState['ui.realtime.triggercondition'] === 'hosts' ||
                                        computedState['ui.realtime.triggercondition'] === 'sources') &&
                                    _.isNaN(mathUtils.strictParseFloat(value))) {
                                    
                                    return _('Trigger threshold must be a number.').t();
                                }
                            },
                            validateRealtimeResultsTime: function(value, attr, computedState) {
                                if (computedState['ui.type'] === 'realtime' &&
                                    (computedState['ui.realtime.triggercondition'] === 'events' ||
                                        computedState['ui.realtime.triggercondition'] === 'hosts' ||
                                        computedState['ui.realtime.triggercondition'] === 'sources' ||
                                        computedState['ui.realtime.triggercondition'] === 'custom') &&
                                    (_.isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
                                    
                                    return _('Trigger time range must be a number greater than 0.').t();
                                }
                            },
                            validateRealtimeCustomSearch: function(value, attr, computedState) {
                                if (computedState['ui.type'] === 'realtime' &&
                                    computedState['ui.realtime.triggercondition'] === 'custom' &&
                                    (_.isUndefined(value) || $.trim(value).length === 0)) {
                                    
                                    return _('Custom condition is required.').t();
                                }
                            },
                            validateScheduledResultsInput: function(value, attr, computedState) {
                                if (computedState['ui.type'] === 'scheduled' &&
                                    (computedState['ui.scheduled.triggercondition'] === 'events' ||
                                        computedState['ui.scheduled.triggercondition'] === 'hosts' ||
                                        computedState['ui.scheduled.triggercondition'] === 'sources') &&
                                    _.isNaN(mathUtils.strictParseFloat(value))) {
                                    
                                    return _('Trigger threshold must be a number.').t();
                                }
                            },
                            validateScheduledCustomSearch: function(value, attr, computedState) {
                                if (computedState['ui.type'] === 'scheduled' &&
                                    computedState['ui.scheduled.triggercondition'] === 'custom' &&
                                    (_.isUndefined(value) || $.trim(value).length === 0)) {
                                    
                                    return _('Custom condition is required.').t();
                                }
                            },
                            validateFieldValue: function(value, attr, computedState) {
                                if (computedState['alert.suppress'] &&
                                    (!computedState['ui.executeactions'] ||
                                        (computedState['ui.type'] === 'realtime' &&
                                            computedState['ui.realtime.triggercondition'] === 'per_result')) &&
                                    (_.isUndefined(value) || $.trim(value).length === 0)) {
                                    
                                    return _('Per result alert throttling requires at least one throttling field; use * to throttle on all fields.').t();
                                }
                            },
                            validateSuppressTime: function(value, attr, computedState) {
                                if (computedState['alert.suppress'] &&
                                    (!mathUtils.isInteger(value) || value <= 0)) {
                                    
                                    return _('Throttle suppression time range must be a integer greater than 0.').t();
                                }
                            },          
                            validateActions: function(value, attr, computedState) {
                                if (!value) {
                                    var action = _.find(computedState, function(value, attr) {
                                        return splunkUtil.normalizeBoolean(value) === true && /^action.([^\.]*)$/.test(attr);
                                    });
                                    if (!action) {
                                        return _('Enable at least one action.').t();
                                    }
                                }
                            },
                            validateScriptFilename: function(value, attr, computedState) {
                                if (computedState['action.script'] &&
                                    (_.isUndefined(value) || $.trim(value).length === 0)) {
                                    
                                    return _('A filename is required if script action is enabled').t();
                                }
                            },
                            validateEmailTo: function(value, attr, computedState) {
                                 if (computedState['action.email'] &&
                                    (_.isUndefined(value) || $.trim(value).length === 0)) {
                                    
                                    return _('An email address is required if email action is enabled').t();
                                }
                            }
                        }
                    ),
                    Fields: BaseModel
                }
            ),
            Cron: CronModel,
            WorkingTimeRange: TimeRangeModel
        });
        
        return Model;
    }
);
