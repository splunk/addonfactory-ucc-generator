define(['underscore', 'jquery', 'splunk.util', 'util/console', 'models/services/configs/AlertAction', 'models/search/Job', 'splunk.config'], function(_, $, splunkUtil, console, AlertAction, Job, splunkConfig) {

    var TYPE_PDFGEN = 'pdfgen';

    /**
     * Check the availibility of the PDF Generator
     * @return a jQuery Deferred object that is resolved when it has been determined what kind of PDF
     * rendering is available
     *       The deferred callbacks receive 2 arguments:
     *          - a boolean indicating the availability
     *          - the type (string) of the PDF server if available ("pdfgen")
     */
    var isPdfServiceAvailable = _.once(function() {
        var dfd = $.Deferred();
        if (splunkConfig["PDFGEN_IS_AVAILABLE"]) {
            dfd.resolve(true, TYPE_PDFGEN);
        } else {
            dfd.resolve(false);
        }
        
        return dfd.promise();
    });

    var isPDFGenAvailable = function() {
        return splunkConfig["PDFGEN_IS_AVAILABLE"];
    };

    /**
     * Get the email alert settings (models.AlertAction)
     * @returns a jQuery Deferred object that is resolved when the settings are loaded
     */
    var getEmailAlertSettings = _.once(function() {
        var dfd = $.Deferred();
        var emailAlertSettings = new AlertAction({ id: 'email' });

        emailAlertSettings.fetch().done(function() {
            dfd.resolve(emailAlertSettings);
        }).fail(function() {
                    dfd.reject();
                });

        return dfd.promise();
    });

    /**
     * Starts a search to send test email with the PDF version of a view via Email (using the sendemail command)
     * @param view (String) name of the dashboard
     * @param app (String) app of the dashboard
     * @param to (String) comma-separated list of recipients
     * @param options { paperSize: (String), paperOrientation: (String) }
     * @returns A jQuery Deferred object that is resolved once the search has successfully completed
     */
    function sendEmail(view, app, to, options) {
        var dfd = $.Deferred();

        getEmailAlertSettings().done(function(emailSettings) {

            to = to.split(/[,\s]+/).join(',');

            var commandParams = {
                'server': emailSettings.getSetting('mailserver', 'localhost'),
                'use_ssl': emailSettings.getSetting('use_ssl', 'false'),
                'use_tls': emailSettings.getSetting('use_tls', 'false'),
                'to': to,
                'cc': options.ccEmail,
                'bcc': options.bccEmail,
                'sendpdf': options.sendPDF,
                'contentType' : options.emailContentType || "",
                'from': emailSettings.getSetting('from', 'splunk@localhost'),
                'subject': options.emailSubject,
                'message': options.emailMessage,
                'papersize': options.paperSize || 'a2',
                'paperorientation': options.paperOrientation || 'portrait',
                'pdfview': view,
                'sendtestemail': options.sendTestEmail || '0'
            };
            var searchString = '| sendemail ' + _(commandParams).map(function(v, k) {
                return [k, JSON.stringify(v)].join('=');
            }).join(' ');

            console.log('Starting search %o', searchString);

            var job = new Job();
            job.save({}, {
                data: {
                    search: searchString,
                    earliest_time: '0',
                    latest_time: 'now',
                    app: app,
                    namespace: app,
                    owner: splunkConfig.USERNAME,
                    ui_dispatch_app: app,
                    ui_dispatch_view: view,
                    preview: false
                }
            }).done(_.bind(function() {
                        job.startPolling();
                        job.entry.content.on('change:isDone', function(m, isDone) {
                            if(isDone) {
                                var messages = job.entry.content.get('messages');

                                _(messages).each(function(msg) {
                                    if(msg.type === 'ERROR') {
                                        console.error(msg.text);
                                    }
                                });

                                if(_(messages).any(function(msg) { return msg.type === 'ERROR'; })) {
                                    dfd.reject(_(messages).pluck('text')[0]);
                                } else {
                                    dfd.resolve();
                                }

                                _.defer(_.bind(job.destroy, job));
                            }
                        });
                        job.entry.content.on('change:isFailed', function(m, isFailed) {
                            if(isFailed) {
                                dfd.reject();
                            }
                            _.defer(_.bind(job.destroy, job));
                        });
                        job.on('error', function() {
                            dfd.reject('Error creating search job');
                            _.defer(_.bind(job.destroy, job));
                        });

                    }, this)).fail(_.bind(function() {
                        console.log('Search creation fail', arguments);
                    }, this));

        }).fail(function() {
                    dfd.reject();
                });

        return dfd.promise();
    }

    /** Workaround for SPL-67453 - double-encode certain XML characters */
    function encodeXMLForCustomEndpoint(xml) {
        return xml.replace(/&/g, '&amp;').replace(/%/g, '&#37;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var downloadReportFromXML = function (xml, app, view, params) {
        var baseURL = splunkUtil.make_full_url("splunkd/__raw/services/pdfgen/render");
        var form = $('<form method="POST" target="_blank"></form>').attr('action', baseURL);
        $('<input/>').attr({ type: 'hidden', name: 'input-dashboard-xml', value: encodeXMLForCustomEndpoint(xml) }).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'namespace', value: app }).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'input-dashboard', value: view}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'splunk_form_key', value: splunkUtil.getFormKey() }).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'locale', value: window._i18n_locale.locale_name}).appendTo(form);
        if(params) {
            _.each(params, function(v, k) {
                $('<input/>').attr({ type: 'hidden', name: k, value: v }).appendTo(form);
            });
        }
        console.log('submitting form', form[0]);
        form.appendTo(document.body).submit();
        _.defer(function() {
            form.remove();
        });
    };

    /**
     * Generates the download URL for the PDF version of a dashboard|report
     * @param view the name of the dashboard|report
     * @param app the app the dashboard|report is defined in
     * @param params a object containing additional parameters for pdfgen (ignored for deprecated pdf server)
     * @param viewType dashboard|report. the type of the view defaults to dashboard
     * @returns a jQuery Deferred object that is resolved if the PDF Server is available. The first callback argument is
     * the download URL
     */
    var getRenderURL = function(view, app, params, viewType) {
        var dfd = $.Deferred();

        isPdfServiceAvailable().done(function(bool, type) {
            var inputType = viewType ? 'input-' + viewType : 'input-dashboard',
                    data = {
                        'namespace': app
                    };
            data[inputType] = view;

            if(type === TYPE_PDFGEN) {
                params = _.extend(
                        data,
                        params || {});
                dfd.resolve(splunkUtil.make_full_url("splunkd/__raw/services/pdfgen/render", params));
            } else {
                dfd.reject();
            }
        }).fail(function() {
                    dfd.reject();
                });
        return dfd.promise();
    };

    return {
        isPdfServiceAvailable: isPdfServiceAvailable,
        isPDFGenAvailable: isPDFGenAvailable,
        getRenderURL: getRenderURL,
        downloadReportFromXML: downloadReportFromXML,
        getEmailAlertSettings: getEmailAlertSettings,
        sendTestEmail: sendEmail
    };
});
