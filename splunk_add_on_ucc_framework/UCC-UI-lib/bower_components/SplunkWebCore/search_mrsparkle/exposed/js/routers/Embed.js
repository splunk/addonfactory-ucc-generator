define(
    [
        'underscore',
        'jquery',
        'splunk.util',
        'routers/Base',
        'models/Base',
        'models/search/Report',
        'models/search/Job',
        'models/services/search/jobs/Result',
        'models/services/search/jobs/Summary',
        'models/services/configs/Visualization',
        'models/shared/fetchdata/ResultsFetchData',
        'collections/services/saved/searches/Histories',
        'collections/search/SelectedFields',
        'collections/services/data/ui/WorkflowActions',        
        'views/embed/Master'
    ],
    function(
        _,
        $,
        splunkutil,
        BaseRouter,
        BaseModel,
        ReportModel,
        JobModel,
        ResultModel,
        SummaryModel,
        ExternalVisualizationModel,
        ResultsFetchDataModel,
        HistoriesCollection,
        SelectedFieldsCollection,
        WorkflowActionCollection,
        MasterView
    ) {
        return BaseRouter.extend({
            routes: $.extend(
                true, 
                {}, 
                {
                    ':locale/embed': 'embed',
                    ':locale/embed?*params': 'embed',
                    ':locale/embed/': 'embed',
                    ':locale/embed/?*params': 'embed',
                    '*root/:locale/embed': 'embedRooted',
                    '*root/:locale/embed?*params': 'embedRooted',
                    '*root/:locale/embed/': 'embedRooted',
                    '*root/:locale/embed/?*params': 'embedRooted'    
                }, 
                BaseRouter.prototype.routes
            ),
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                //unsubscribe jquery 401 ajaxError redirect
                $(document).off('ajaxError');
                //router
                this.setPageTitle(_('Embedded Report').t());
                this.enablePageView = false;
                this.fetchExternalVisualization = true;
                //models
                this.model.report = new ReportModel();
                this.model.job = new JobModel({}, {
                    delay: JobModel.DEFAULT_POLLING_INTERVAL, 
                    processKeepAlive: false
                });
                this.model.result = new ResultModel();
                this.model.summary = new SummaryModel();
                //collections
                this.collection.histories = new HistoriesCollection();
                this.collection.selectedFields = new SelectedFieldsCollection();
                this.collection.workflowActions = new WorkflowActionCollection();
                //views
                this.views.master = new MasterView({
                    el: $('body'),
                    model: {
                        application: this.model.application,
                        report: this.model.report,
                        job: this.model.job,
                        result: this.model.result,
                        summary: this.model.summary
                    },
                    collection: {
                        histories: this.collection.histories,
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    }
                });
                //observers
                //load saved search from url
                this.model.classicurl.on('change:s', function() {
                    this.model.report.fetchAbort();
                    this.model.report.clear();
                    this.model.report.set('id', this.model.classicurl.get('s'));
                    this.model.report.fetch({
                        data: {
                            oid: this.model.classicurl.get('oid')
                        },
                        migrateViewState: false
                    });
                    this.model.application.set('oid', this.model.classicurl.get('oid'));
                }, this);
                //saved search loaded
                this.model.report.on('sync', function() {
                    this.setPageTitle(this.model.report.entry.get('name'));
                    // We can't use the superclass `externalVisualizationBootstrap` method here because the
                    // visualizations.conf endpoint is not supported via guest pass.  So the work-around is to
                    // to check for a custom viz and register it manually.
                    var vizType = this.model.report.entry.content.get('display.visualizations.type');
                    if (vizType === 'custom') {
                        var customType = this.model.report.entry.content.get('display.visualizations.custom.type');
                        var externalViz = new ExternalVisualizationModel();
                        externalViz.entry.acl.set({ app: customType.split('.')[0] });
                        externalViz.entry.set({ name: customType.split('.')[1] });
                        externalViz.addToRegistry({ loadFormatterHtml: false });
                    }
                    this.model.report.entry.content.set({
                        'display.events.list.drilldown': 'none',
                        'display.events.raw.drilldown': 'none',
                        'display.events.table.drilldown': '0',
                        'display.statistics.drilldown': 'none',
                        'display.visualizations.charting.drilldown': 'none'
                    });
                    this.collection.histories.fetchAbort();
                    this.collection.histories.reset();
                    this.collection.histories.url = this.model.report.entry.links.get('history');
                    this.collection.histories.fetch({
                        data: {
                            count: 1,
                            sort_key: 'start',
                            sort_dir: 'desc',
                            oid: this.model.classicurl.get('oid')
                        }
                    });
                    this.collection.selectedFields.reset(this.model.report.getDisplayEventsFields({key: 'name'}));
                }, this);
                this.collection.histories.on('sync', function() {
                    var history = this.collection.histories.at(0);
                    this.model.job.clear();
                    this.model.job.fetchAbort();
                    this.model.job.stopPolling();
                    if (history) {
                        this.model.job.set('id', history.entry.get('name'));
                        this.model.job.fetch({
                            data: {
                                oid: this.model.classicurl.get('oid')
                            }
                        });
                    }
                }, this);
                //job created or cleared
                this.model.job.on('sync', function() {
                     this.model.job.startPolling();
                }, this);
                //job friends
                this.model.job.entry.links.on('change:events', function() {
                    var events = this.model.job.entry.links.get('events');
                    if (events) {
                        this.model.result.set('id', events);
                    } else {
                        this.model.result.fetchAbort();
                    }
                }, this);
                this.model.job.on('jobProgress', function() {
                    if (!this.model.job.isReportSearch()) {
                        this.fetchEvents();
                    }
                }, this);
            },
            fetchEvents: function() {
                var fields = _(this.model.report.getDisplayEventsFields()).union(['_raw', '_time', '_audit', '_decoration', 'eventtype', 'linecount', '_fulllinecount']);
                if (this.model.job.isRealtime()) {
                    fields.push('_serial', 'splunk_server');
                }
                var options = {
                   data: {
                        offset: 0,
                        count: 10,
                        earliest_time: this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        latest_time: this.model.report.entry.content.get('display.events.timelineLatestTime'),
                        segmentation: 'none',
                        max_lines: this.model.report.getNearestMaxlines(),
                        field_list: splunkutil.fieldListToString(fields),
                        truncation_mode: 'abstract',
                        oid: this.model.classicurl.get('oid')
                    },
                    sparseMode: true
                };
                this.model.result.safeFetch(options);
            },
            embed: function(locale) {
                this.model.application.set({
                    locale: locale,
                    app: '-',
                    page: 'embed'
                });
                this.model.classicurl.fetch();
                this.views.master.render();
                window.router = this;
            },
            embedRooted: function(root, locale) {
                this.model.application.set(
                    {root: root}, 
                    {silent: true}
                );
                this.embed(locale);
            },
            setPageTitle: function(title) {
                document.title = title;
            }
        });
    }
);
