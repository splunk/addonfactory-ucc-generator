define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/ManagementconsoleBase',
        'models/shared/TimeRange',
        'collections/managementconsole/AuditLogs',
        'collections/services/data/ui/Times',
        'views/managementconsole/audit_logs/Master'
    ],
    function(
        _,
        $,
        Backbone,
        DmcBaseRouter,
        TimeRangeModel,
        AuditLogsCollection,
        TimesCollection,
        AuditLogsView
    ) {
        return DmcBaseRouter.extend({
            initialize: function() {
                DmcBaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Install Log').t());
                this.enableFooter = false;
                this.collection = this.collection || {};
                this.deferreds = this.deferreds || {};
                this.children = this.children || {};

                this.model.timeRange = new TimeRangeModel();
                this.deferreds.timeRange = this.model.timeRange.save({
                    earliest: '-30d',
                    latest: 'now'
                });

                this.collection.times = new TimesCollection();
                this.deferreds.times = $.Deferred();
                this.deferreds.application.done(function() {
                    this.collection.times.fetch({
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner"),
                            count: -1
                        }
                    }).done(function() {
                        this.deferreds.times.resolve();
                    }.bind(this)).fail(function() {
                        this.deferreds.times.reject();
                    }.bind(this));
                }.bind(this)).fail(function() {
                    this.deferreds.times.reject();
                }.bind(this));

                this.collection.auditLogs = new AuditLogsCollection();
                this.deferreds.auditLogs = $.Deferred();
                this.deferreds.timeRange.done(function() {
                    this.collection.auditLogs.fetchData.set(
                        {
                            count: 25,
                            offset: 0,
                            earliest_time: this.model.timeRange.get('earliest'),
                            latest_time: this.model.timeRange.get('latest')
                        },
                        { silent: true }
                    );

                    this.collection.auditLogs.fetch().done(function() {
                        this.deferreds.auditLogs.resolve();
                    }.bind(this)).fail(function() {
                        this.deferreds.auditLogs.reject();
                    }.bind(this));
                }.bind(this)).fail(function() {
                    this.deferreds.auditLogs.reject();
                }.bind(this));
            },

            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);

                $.when(
                    this.deferreds.pageViewRendered, 
                    this.deferreds.auditLogs,
                    this.deferreds.timeRange,
                    this.deferreds.times,
                    this.deferreds.application,
                    this.deferreds.appLocal,
                    this.deferreds.user
                ).done(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    this.children.table = new AuditLogsView({
                        model: {
                            timeRange: this.model.timeRange,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            application: this.model.application
                        },
                        collection: { 
                            auditLogs: this.collection.auditLogs,
                            times: this.collection.times
                        }
                    });
                    
                    this.pageView.$('.main-section-body').append(this.children.table.render().$el);
                }.bind(this));
            }
        });
    }
);