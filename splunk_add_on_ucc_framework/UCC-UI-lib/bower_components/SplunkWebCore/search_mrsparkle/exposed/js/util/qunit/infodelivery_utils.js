define([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'models/Base',
    'mocks/models/MockSplunkD',
    'mocks/models/MockUser',
    'mocks/models/MockServerInfo',
    'mocks/models/MockDashboardView',
    'models/dashboard/DashboardDisplayProps'
], function($,
            _,
            Backbone,
            mvc,
            BaseModel,
            MockSplunkD,
            MockUser,
            MockServerInfo,
            MockDashboardView,
            DashboardDisplayProps) {

    var SCHEDULE_DEFAULTS = {
        'is_scheduled': false,
        'action.email.subject.view': "Splunk Dashboard: '$name$'",
        'action.email.message.view': 'A PDF was generated for $name$',
        'action.email.useNSSubject': '1',
        'action.email.papersize': 'letter',
        'action.email.paperorientation': 'portrait',
        'action.email.priority': '3',
        'action.email.content_type': 'html',
        'cron_schedule': '0 6 * * 1'
    };

    var MODEL_INMEM_DEFAULTS = {
        "action.email": true,
        "action.email.auth_password": "",
        "action.email.auth_username": "",
        "action.email.bcc": "",
        "action.email.cc": "",
        "action.email.cipherSuite": "TLSv1+HIGH:TLSv1.2+HIGH:@STRENGTH",
        "action.email.command": "$action.email.preprocess_results{default=\"\"}$ | sendemail \"results_link=$results.url$\" \"ssname=$name$\" \"graceful=$graceful{default=True}$\" \"trigger_time=$trigger_time$\" maxinputs=\"$action.email.maxresults{default=10000}$\" maxtime=\"$action.email.maxtime{default=5m}$\" results_file=\"$results.file$\"",
        "action.email.content_type": "html",
        "action.email.description": "Send an email notification to specified recipients",
        "action.email.footer.text": "If you believe you've received this email in error, please see your Splunk administrator.\n\nsplunk > the engine for machine data",
        "action.email.format": "table",
        "action.email.from": "splunk",
        "action.email.hostname": "",
        "action.email.icon_path": "mod_alert_icon_email.png",
        "action.email.include.results_link": "1",
        "action.email.include.search": "0",
        "action.email.include.trigger": "0",
        "action.email.include.trigger_time": "0",
        "action.email.include.view_link": "1",
        "action.email.inline": false,
        "action.email.label": "Send email",
        "action.email.mailserver": "localhost",
        "action.email.maxresults": 10000,
        "action.email.maxtime": "60m",
        "action.email.message.alert": "The alert condition for '$name$' was triggered.",
        "action.email.message.report": "The scheduled report '$name$' has run.",
        "action.email.message.view": "TESTING TESTING TESTING weow",
        "action.email.paperorientation": "portrait",
        "action.email.papersize": "letter",
        "action.email.pdf.footer_center": "title",
        "action.email.pdf.footer_enabled": "1",
        "action.email.pdf.footer_left": "logo",
        "action.email.pdf.footer_right": "timestamp,pagination",
        "action.email.pdf.header_center": "description",
        "action.email.pdf.header_enabled": "1",
        "action.email.pdf.html_image_rendering": "1",
        "action.email.pdfview": "crime",
        "action.email.preprocess_results": "",
        "action.email.priority": "2",
        "action.email.reportCIDFontList": "gb cns jp kor",
        "action.email.reportFileName": "$name$-$time:%Y-%m-%d$",
        "action.email.reportIncludeSplunkLogo": "1",
        "action.email.reportPaperOrientation": "portrait",
        "action.email.reportPaperSize": "letter",
        "action.email.sendcsv": "0",
        "action.email.sendpdf": true,
        "action.email.sendresults": false,
        "action.email.sslVersions": "*,-ssl2",
        "action.email.subject": "Splunk Alert: $name$",
        "action.email.subject.alert": "Splunk Alert: $name$",
        "action.email.subject.report": "Splunk Report: $name$",
        "action.email.subject.view": "Splunk Dashboard: '$name$'",
        "action.email.to": "bfogelman@splunk.com",
        "action.email.track_alert": true,
        "action.email.ttl": "10",
        "action.email.useNSSubject": "1",
        "action.email.use_ssl": false,
        "action.email.use_tls": false,
        "action.email.width_sort_columns": true,
        "cron_schedule": "0 6 * * 1",
        "description": "scheduled search for view name=crime",
        "disabled": false,
        "eai:acl": null,
        "is_scheduled": true,
        "next_scheduled_time": "2016-06-13 06:00:00 PDT",
        "schedule_priority": "default",
        "schedule_window": "0"
    };

    var CRON_DEFAULTS = {
        "minute": "0",
        "hour": "6",
        "dayOfMonth": "*",
        "month": "*",
        "dayOfWeek": "1",
        "cron_schedule": "0 6 * * 1",
        "cronType": "weekly"
    };

    return {
        mockModel: function(options) {
            options || (options = {});
            var model = {};
            model.controller = new Backbone.Model();
            model.user = new MockUser(options.user || {});
            model.userPref = new MockSplunkD();
            model.userPref.entry.content.set(options.userPref || {});
            model.serverInfo = new MockServerInfo();
            model.application = new Backbone.Model(options.application || {});
            model.state = new Backbone.Model(options.state || {mode: 'view'});
            model.page = new DashboardDisplayProps(options.page || {});
            model.view = new MockDashboardView(options.view || {});
            model.view.entry.acl.set(options.acl || {});
            model.view.entry.content.set(options.entryContent || {});
            model.scheduledView = new MockSplunkD();
            model.scheduledView.entry.content.set(SCHEDULE_DEFAULTS);
            model.inmem = new MockSplunkD();
            model.inmem.entry.content.set(MODEL_INMEM_DEFAULTS);
            model.cron = new MockSplunkD();
            model.inmem.entry.content.set(CRON_DEFAULTS);
            return model;
        }
    };
});
