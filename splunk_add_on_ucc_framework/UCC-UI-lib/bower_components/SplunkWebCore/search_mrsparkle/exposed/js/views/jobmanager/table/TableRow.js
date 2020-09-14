define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobcontrols/Master',
        'views/shared/jobstatus/buttons/Master',
        'views/shared/controls/SyntheticCheckboxControl',
        'uri/route',
        'splunk.i18n',
        'util/time',
        'splunk.util'
    ],
    function(
        _,
        module,
        BaseView,
        JobStatusControlsView,
        JobStatusButtonsView,
        SyntheticCheckboxControlView,
        route,
        i18n,
        time_utils,
        splunkUtil
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.children.actionControls = new JobStatusControlsView({
                    model: {
                        searchJob: this.model.job,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    allowSendBackground: false,
                    allowTouch: true,
                    externalJobLinkPage: "search"
                });
                
                this.children.actionButtons = new JobStatusButtonsView({
                    model: {
                        searchJob: this.model.job,
                        application: this.model.application,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user
                    },
                    hidePrintButton: true,
                    externalJobLinkPage: "search",
                    verifyJobExistsExport: true
                });
                this.children.bulkActionCheckbox = new SyntheticCheckboxControlView({
                    modelAttribute: 'selected',
                    model: this.model.job
                });
                
                if (!this.model.job.entry.acl.canWrite()) {
                    this.children.bulkActionCheckbox.disable();
                }

                this.activate();
            },
            
            startListening: function() {
                this.listenTo(this.model.job, 'sync', this.render);
                this.listenTo(this.model.job.control, 'sync', this.render);
                this.listenTo(this.model.job.entry.content, 'change:isDone change:isPaused change:isFinalized change:isFailed change:dispatchState', _.debounce(function() {
                    this.model.job.trigger('refresh');
                }));
                this.listenTo(this.model.job.entry.content.custom, 'change:isBackground', function() {
                    this.model.job.trigger('refresh');
                });
            },

            getCanonicalStatus: function() {
                var doneProgress = Math.round(this.model.job.entry.content.get('doneProgress') * 100);
                if (this.model.job.isQueued()) {
                    return _('Queued').t();
                }
                if (this.model.job.isParsing()) {
                    return _('Parsing').t();
                }
                if (this.model.job.isPaused()) {
                    return _('Paused').t();
                }
                if (this.model.job.isFinalizing()) {
                    return _('Finalizing').t();
                }
                if (this.model.job.isFinalized()) {
                    return _('Finalized').t();
                }
                if (this.model.job.isFailed()) {
                    return _('Failed').t();
                }
                if (this.model.job.isDone()) {
                    return _('Done').t();
                }
                if (this.model.job.isRealtime()) {
                    return _('Running (real-time)').t();
                }
                if (this.model.job.isBackground()) {
                    return _(splunkUtil.sprintf("Backgrounded (%s%)", doneProgress)).t();
                }
                return _(splunkUtil.sprintf("Running (%s%)", doneProgress)).t();
            },

            render: function() {
                var runtime = time_utils.secondsToSeparatedDate(this.model.job.entry.content.get('runDuration'), true),
                    sid = this.model.job.entry.content.get('sid'),
                    createdAt = this.model.job.getCreatedString() || _("Waiting...").t(),
                    owner = this.model.job.entry.acl.get('owner'),
                    appName = this.model.job.entry.acl.get('app'),
                    size = this.model.job.getSizeString(),
                    events = i18n.format_decimal(this.model.job.entry.content.get('eventCount') || 0),
                    expiration = this.model.job.getExpirationString(),
                    status = this.getCanonicalStatus(),
                    splitRuntime,
                    runtimeHours,
                    runtimeMinutes,
                    runtimeSeconds,
                    html = this.$el.html();

                if (this.model.job.entry.content.get('runDuration')) {
                    splitRuntime = time_utils.secondsToSeparatedDate(this.model.job.entry.content.get('runDuration'), true);
                    runtimeHours = splitRuntime.hours.toString().length >= 2 ? splitRuntime.hours.toString() : "0" + splitRuntime.hours;
                    runtimeMinutes = splitRuntime.minutes.toString().length >= 2 ? splitRuntime.minutes.toString() : "0" + splitRuntime.minutes;
                    runtimeSeconds = splitRuntime.seconds.toString().length >= 2 ? splitRuntime.seconds.toString() : "0" + splitRuntime.seconds;
                    runtime = runtimeHours + ":" + runtimeMinutes + ":" + runtimeSeconds;
                } else {
                    runtime = _("Waiting...").t();
                }
                
                if (!html) {
                    this.$el.html(this.compiledTemplate({
                        sid: sid,
                        createdAt: createdAt,
                        owner: owner,
                        appName: appName,
                        canUseApps: this.model.user.canUseApps(),
                        size: size,
                        events: events,
                        runtime: runtime,
                        expiration: expiration,
                        status: status
                    }));
                    
                    this.children.actionControls.render().appendTo(this.$('.col-actions'));
                    this.children.actionButtons.render().appendTo(this.$('.col-actions'));
                    this.children.bulkActionCheckbox.render().appendTo(this.$('.col-selected'));
                } else {
                    this.$('.col-owner').html(_.template('<%- owner %>', {owner: owner}));
                    this.$('.col-application').html(_.template('<%- appName %>', {appName: appName}));
                    this.$('.col-events').html(_.template('<%- events %>', {events: events}));
                    this.$('.col-size').html(_.template('<%- size %>', {size: size}));
                    this.$('.col-created').html(_.template('<%- createdAt %>', {createdAt: createdAt}));
                    this.$('.col-expires').html(_.template('<%- expiration %>', {expiration: expiration}));
                    this.$('.col-runtime').html(_.template('<%- runtime %>', {runtime: runtime}));
                    this.$('.col-status').html(_.template('<%- status %>', {status: status}));
                }

                return this;
            },
            
            template: '\
                <td class="expands" rowspan="2"><a href="#"><i class="icon-triangle-right-small"></i></a>\
                </td>\
                <td class="col-selected">\
                </td>\
                <td class="col-owner col-text">\
                    <%- owner %>\
                </td>\
                <% if (canUseApps) { %>\
                    <td class="col-application col-text">\
                        <%- appName %>\
                    </td>\
                <% } %>\
                <td class="col-events col-text">\
                    <%- events %>\
                </td>\
                <td class="col-size col-text">\
                    <%- size %>\
                </td>\
                <td class="col-created col-text">\
                    <%- createdAt %>\
                </td>\
                <td class="col-expires col-text">\
                    <%- expiration %>\
                </td>\
                <td class="col-runtime col-text">\
                    <%- runtime %>\
                </td>\
                <td class="col-status col-text">\
                    <%- status %>\
                </td>\
                <td class="col-actions">\
                </td>\
                \
            '
        });
    }
);

