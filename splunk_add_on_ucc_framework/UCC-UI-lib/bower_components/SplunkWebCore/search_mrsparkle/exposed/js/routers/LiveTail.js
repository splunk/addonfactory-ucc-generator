define(
    [   'splunk',
        'jquery',
        'underscore',
        'backbone',
        'routers/BootstrapSearch',
        'collections/Base',
        'collections/services/data/ui/Keywords',
        'models/search/Job',
        'models/services/search/jobs/Result',
        'models/search/Report',
        'models/services/data/ui/Pref',
        'views/live_tail/Master',
        'uri/route',
        'splunk.session'
    ],
    function(
        Splunk,
        $,
        _,
        Backbone,
        BootstrapSearchRouter,
        BaseCollection,
        KeywordsCollection,
        SearchJobModel,
        ResultModel,
        ReportModel,
        UIPrefsModel,
        LiveTailView,
        route,
        sessionUndefined
    ) {
        return BootstrapSearchRouter.extend({
            initialize: function() {
                BootstrapSearchRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.enableFooter = false;
                this.showAppsList = false;
                this.fetchManagers = false;
                this.fetchUserPref = true;
                this.setPageTitle(_('Live Tail').t());
                this.url_filter.push('^dispatch\.indexedRealtime');
                this.deferreds.keywords = $.Deferred();
                this.deferreds.uiPrefs = $.Deferred();

                this.collection.keywords = new KeywordsCollection();
                this.collection.results = new BaseCollection();
                this.bootstrapKeywords();

                this.model.report = new ReportModel();
                this.model.uiPrefs = new UIPrefsModel();
                this.model.uiPrefs.fetch({
                    success: function(model, response) {
                        this.deferreds.uiPrefs.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.uiPrefs.resolve();
                    }.bind(this)
                });
                this.model.searchJob = new SearchJobModel({}, {delay: 10000, processKeepAlive: true, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});

                // Set UI timeout delay to 24 hours in milliseconds
                var session = Splunk.Session.getInstance();
                session.timeoutDelay = 24 * 3600 * 1000;
            },

            page: function(locale, app, page) {
                BootstrapSearchRouter.prototype.page.apply(this, arguments);

                $.when(this.baseDeactivateDeferred, this.deferreds.pageViewRendered, this.deferreds.keywords, this.deferreds.uiPrefs).then(function() {
                        this.pageView.$('header').remove();
                        $('.preload').replaceWith(this.pageView.el);
                        this.deferreds.preloadReplaced.resolve();
                }.bind(this));

                $.when(this.baseActivateDeferred).then(function() {
                    this.initializeLiveTailView();

                    this.liveTailView.activate({ deep: true, skipRender: true });
                    this.activate();

                    this.liveTailView.render().replaceContentsOf($('.main-section-body'));
                    $(document).trigger('rendered');
                }.bind(this));
            },

            activate: function() {
                this.model.report.entry.content.on('change', function(model, options) {
                    var changed = this.model.report.entry.content.changedAttributes(),
                        jobPopulationDeferred = $.Deferred();
                    options = options || {};

                    this.populateJob(jobPopulationDeferred, changed);

                    $.when(jobPopulationDeferred).always(function() {
                        options.forceTrigger = true;
                        this.populateClassicUrl(changed, options);
                    }.bind(this));
                }, this);

                this.model.searchJob.on('prepared', function() {
                    this.registerSearchJobFriends();
                }, this);
            },

            deactivate: function() {
                if (!this.shouldRender) {
                    this.model.report.entry.content.off(null, null, this);
                    this.model.searchJob.off(null, null, this);
                }
                this.liveTailView.deactivate({ deep: true });

                BootstrapSearchRouter.prototype.deactivate.apply(this, arguments);
            },

            initializeLiveTailView: function() {
                if (!this.model.user.canLiveTail()) {
                    window.location = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'search',
                        'error'
                    );
                } else {
                    this.liveTailView = new LiveTailView({
                        model: {
                            result: this.model.result,
                            resultJsonRows: this.model.resultJsonRows,
                            report: this.model.report,
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            userPref: this.model.userPref
                        },
                        collection: {
                            keywords: this.collection.keywords,
                            results: this.collection.results
                        },
                        searchString: this.searchString || _('No search input').t()
                    });
                }
            },

            // NOTE: it should not be necessary to override the below method from BaseSearch router at all, but
            // for some reason, the results collection's _raw is not populated if we don't do the below routine. Future fix.
            registerSearchJobFriends: function(options) {
                this.model.searchJob.registerJobProgressLinksChild(
                    SearchJobModel.RESULTS_PREVIEW,
                    this.model.result,
                    function() {
                        var resultPreviewCount = this.model.searchJob.entry.content.get("resultPreviewCount");
                        if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                            this.model.result.safeFetch();
                        }
                    },
                    this
                );
            },

            bootstrapKeywords: function() {
                if (this.deferreds.keywords.state() !== 'resolved') {
                    this.collection.keywords.fetch({
                        data: {
                            app: "-",
                            owner: this.model.application.get("owner"),
                            count: -1
                        },
                        success: function(collection, response, options) {
                            this.deferreds.keywords.resolve();
                        }.bind(this),
                        error: function(collection, response, options) {
                            this.deferreds.keywords.resolve();
                        }.bind(this)
                    });
                }
            }
        });
    }
);