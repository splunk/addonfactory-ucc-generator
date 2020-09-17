define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'splunk.util',
        'models/search/Job',
        'models/services/search/jobs/ResultJsonCols',
        'collections/services/authentication/Users',
        'collections/services/licenser/Licenses',
        'collections/services/licenser/Stacks',
        'collections/services/licenser/Pools',
        'collections/services/licenser/Groups',
        'collections/services/licenser/Slaves',
        'collections/services/licenser/Messages',
        'collections/services/licenser/Localslaves',
        'collections/services/licenser/Usages',
        'views/licensing/Master'
    ],
    function(
        $,
        _,
        BaseRouter,
        SplunkUtil,
        SearchJob,
        ResultJsonCols,
        UsersCollection,
        LicensesCollection,
        StacksCollection,
        PoolsCollection,
        GroupsCollection,
        SlavesCollection,
        MessagesCollection,
        LocalSlavesCollection,
        UsagesCollection,
        LicenseSummaryView
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.setPageTitle(_('Licensing').t());

                //collections
                this.collection.users = new UsersCollection();
                this.collection.licenses = new LicensesCollection();
                this.collection.stacks = new StacksCollection();
                this.collection.pools = new PoolsCollection();
                this.collection.groups = new GroupsCollection();
                this.collection.slaves = new SlavesCollection();
                this.collection.messages = new MessagesCollection();
                this.collection.localslaves = new LocalSlavesCollection();
                this.collection.usages = new UsagesCollection();

                //deferreds
                this.deferreds.users = $.Deferred();
                this.deferreds.licenses = $.Deferred();
                this.deferreds.stacks = $.Deferred();
                this.deferreds.pools = $.Deferred();
                this.deferreds.groups = $.Deferred();
                this.deferreds.slaves = $.Deferred();
                this.deferreds.messages  = $.Deferred();
                this.deferreds.localslaves = $.Deferred();
                this.deferreds.localslave = $.Deferred();
                this.deferreds.usages = $.Deferred();

                this.bootstrapUsers();
                this.bootstrapLicenses();
                this.bootstrapStacks();
                this.bootstrapPools();
                this.bootstrapGroups();
                this.bootstrapSlaves();
                this.bootstrapMessages();
                this.bootstrapLocalslaves();
                this.bootstrapUsages();

                this.searchJob = new SearchJob();
                this.searchResults = new ResultJsonCols();
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                $.when(this.deferreds.pageViewRendered,
                    this.deferreds.users,
                    this.deferreds.licenses, 
                    this.deferreds.stacks, 
                    this.deferreds.pools,
                    this.deferreds.groups,
                    this.deferreds.slaves,
                    this.deferreds.messages,
                    this.deferreds.localslaves,
                    this.deferreds.usages).then(function() {
                        $('.preload').replaceWith(this.pageView.el);

                        //get active license group
                        this.activeGroup = this.collection.groups.find(function(group) {
                            return group.entry.content.get('is_active');
                        });

                        //initialize data and views
                        this.initializeUsageChartData();
                        this.initializeAndRenderSummary();
                }.bind(this));
            },

            initializeUsageChartData: function() {
                //license usage query strings
                var STACK_SIZE_SEARCH_STRING = SplunkUtil.sprintf("index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | \
                    eval _time=_time - 43200 | append [ rest /services/licenser/usage | stats sum(quota) as stacksz | eval _time=relative_time(now(), \"@d\")] | \
                    bin _time span=1d | timechart span=1d sum(stacksz) AS \"%s\" fixedrange=false ", _("volume licensed").t());

                var BASE_USAGE_SEARCH_STRING = SplunkUtil.sprintf("| join type=outer _time [search index=_internal source=*license_usage.log* type=\"Usage\" \
                    earliest=-30d@d latest=@d | eval _time=_time - 43200 | \
                    eval h=if(len(h)=0 OR isnull(h),\"(SQUASHED)\",h) | eval s=if(len(s)=0 OR isnull(s),\"(SQUASHED)\",s) | eval idx=if(len(idx)=0 OR isnull(idx),\"(UNKNOWN)\",idx) | \
                    bin _time span=1d | stats sum(b) as b by _time, pool, s, st, h, idx | \
                    append [ rest /services/licenser/usage/license_usage | stats sum(slaves_usage_bytes) as b | eval _time=relative_time(now(), \"@d\")] | \
                    timechart span=1d sum(b) AS \"%s\" fixedrange=false] ", _("volume indexed").t());

                var fieldFormatString = "| fields - _timediff | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";

                var completeSearchString = STACK_SIZE_SEARCH_STRING + BASE_USAGE_SEARCH_STRING + fieldFormatString;

                var jobPromise = this.searchJob.save({}, {data: {
                    app: this.model.application.get('app'),
                    owner: this.model.application.get('owner'),
                    search: completeSearchString
                }});

                jobPromise.done(function() {
                    this.searchJob.registerJobProgressLinksChild(
                        SearchJob.RESULTS_PREVIEW, 
                        this.searchResults, 
                        function() {
                            this.searchResults.fetch(); 
                        }, 
                        this);
                    this.searchJob.startPolling();
                }.bind(this));
            },

            bootstrapUsers: function() {
                if (this.deferreds.users.state() !== 'resolved') {
                    this.collection.users.fetch({
                        success: function(model, response) {
                            this.deferreds.users.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.users.resolve();
                        }.bind(this)
                     });
                }
            },

            bootstrapLicenses: function() {
                if (this.deferreds.licenses.state() !== 'resolved') {
                    this.collection.licenses.fetch({
                        success: function(model, response) {
                            this.deferreds.licenses.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.licenses.resolve();
                        }.bind(this)
                     });
                }
            },

            bootstrapStacks: function() {
                if (this.deferreds.stacks.state() !== 'resolved') {
                    this.collection.stacks.fetch({
                        success: function(model, response) {
                            this.deferreds.stacks.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.stacks.resolve();
                        }.bind(this)
                     });
                }
            },

            bootstrapPools: function() {
                if (this.deferreds.pools.state() !== 'resolved') {
                    this.collection.pools.fetch({
                        success: function(model, response) {
                            this.deferreds.pools.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.pools.resolve();
                        }.bind(this)
                     });
                }
            },

            bootstrapGroups: function() {
                if (this.deferreds.groups.state() !== 'resolved') {
                    this.collection.groups.fetch({
                        success: function(model, response) {
                            this.deferreds.groups.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.groups.resolve();
                        }.bind(this)
                     });
                }
            },

            bootstrapSlaves: function() {
                if (this.deferreds.slaves.state() !== 'resolved') {
                    this.collection.slaves.fetch({
                        success: function(model, response) {
                            this.deferreds.slaves.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.slaves.resolve();
                        }.bind(this)
                     });
                }

            },

            bootstrapMessages: function() {
                if (this.deferreds.messages.state() !== 'resolved') {
                    this.collection.messages.fetch({
                        success: function(model, response) {
                            this.deferreds.messages.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.messages.resolve();
                        }.bind(this)
                     });
                }

            },

            bootstrapLocalslaves: function() {
                if (this.deferreds.localslaves.state() !== 'resolved') {
                    this.collection.localslaves.fetch({
                        success: function(model, response) {
                            this.deferreds.localslaves.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.localslaves.resolve();
                        }.bind(this)
                     });
                }
            },

            bootstrapUsages: function() {
                if (this.deferreds.usages.state() !== 'resolved') {
                    this.collection.usages.fetch({
                        success: function(model, response) {
                            this.deferreds.usages.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.usages.resolve();
                        }.bind(this)
                     });
                }
            },

            initializeAndRenderSummary: function() {
                var licenseSummaryView = new LicenseSummaryView({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        searchResults: this.searchResults,
                        searchJob: this.searchJob
                    },
                    collection: {
                        users: this.collection.users,
                        licenses: this.collection.licenses,
                        stacks: this.collection.stacks,
                        pools: this.collection.pools,
                        groups: this.collection.groups,
                        slaves: this.collection.slaves,
                        messages: this.collection.messages,
                        localslaves: this.collection.localslaves,
                        usages: this.collection.usages
                    }
                });
                this.pageView.$('.main-section-body').html(licenseSummaryView.render().el);
            }
        });
    }
);