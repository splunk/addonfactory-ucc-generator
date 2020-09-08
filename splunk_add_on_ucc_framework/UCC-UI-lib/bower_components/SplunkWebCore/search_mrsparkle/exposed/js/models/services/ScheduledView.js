define(['jquery','underscore','backbone','models/SplunkDBase','models/Base', 'splunk.util', 'backbone_validation'],
function($, _, Backbone, SplunkDBase, BaseModel, splunkUtil, Val){

    var ScheduledView =  SplunkDBase.extend({
        defaults: {
            'is_scheduled': false,
            'action.email.subject.view': "Splunk Dashboard: '$dashboard.label$'",
            'action.email.message.view': 'A dashboard was generated for $dashboard.label$',
            'action.email.useNSSubject': '1',
            'action.email.papersize': 'letter',
            'action.email.paperorientation': 'portrait',
            'action.email.priority': '3',
            'action.email.content_type': 'html',
            'cron_schedule': '0 6 * * 1'
        },
        initialize: function() {
            SplunkDBase.prototype.initialize.apply(this, arguments);
        },
        url: function() {
            return 'scheduled/views/' + this.viewName;
        },
        findByName: function(viewName, app, owner) {
            this.viewName = viewName;
            this.set(this.idAttribute, 'scheduled/views/' + viewName);
            var dfd = this.fetch({ data: { app: app, owner: owner }});
            dfd.done(_.bind(this.applyDefaultsIfNotScheduled, this));
            return dfd;
        },
        applyDefaultsIfNotScheduled: function() {
            if(!this.entry.content.get('is_scheduled')) {
                this.entry.content.set(this.defaults);
            }
        }
    });

    ScheduledView.Entry = ScheduledView.Entry.extend({});
    ScheduledView.Entry.Content = ScheduledView.Entry.Content.extend({
        validation: {
            'action.email.to': {
                fn: 'validateEmailList'
            },
            'action.email.subject.view': {
                fn: 'validateNSSubject'
            },
            'action.email.subject': {
                fn: 'validateSubject'
            }
        },
        validateSubject: function(value, attr, computedState) {
            if (splunkUtil.normalizeBoolean(computedState['is_scheduled']) &&
                !splunkUtil.normalizeBoolean(computedState['action.email.useNSSubject']) &&
                (_.isUndefined(value) || $.trim(value).length === 0)) {
                
                return _('Subject is empty').t();
            }
        },
        validateNSSubject: function(value, attr, computedState) {
            if (splunkUtil.normalizeBoolean(computedState['is_scheduled']) &&
                splunkUtil.normalizeBoolean(computedState['action.email.useNSSubject']) &&
                (_.isUndefined(value) || $.trim(value).length === 0)) {
                
                return _('Subject is empty').t();
            }
        },
        validateEmailList: function(value, attr, model) {
            if(model.is_scheduled) {
                if(!value) {
                    return _("Email Address list is empty").t();
                }
                if(_(value.split(/\s*,\s*/)).any(function(v){ return !Val.patterns.email.test(v); })) {
                    return _("Email Address list is invalid").t();
                }
            }
        }
    });

    return ScheduledView;
});
