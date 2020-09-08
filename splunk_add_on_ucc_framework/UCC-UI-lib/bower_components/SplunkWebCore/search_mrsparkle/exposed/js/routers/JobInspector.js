define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'models/classicurl',
        'models/search/Job',
        'models/services/saved/Search',
        'views/job_inspector/Master',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        BaseRouter,
        classicurlModel,
        SearchJobModel,
        SavedSearchModel,
        JobInspectorView,
        splunkd_utils
    ) {
        /**
         * @constructor
         * @memberOf routers
         * @name JobInspector
         * @description
         * @extends {BaseRouter}
         */
        return BaseRouter.extend(/** @lends views.Base.prototype */{
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableSplunkBar = false;
                this.enableAppBar = false;
                this.enableFooter = false;
                this.showAppsList = false;
                this.fetchManagers = false;
                this.fetchAppLocal = false;
                
                //Models
                this.model.searchJob = new SearchJobModel();
                this.model.savedSearch = new SavedSearchModel();
                
                //Deferred
                this.deferreds.searchJobDeferred = $.Deferred();
                this.deferreds.savedSearchJobDeferred = $.Deferred();
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                
                classicurlModel.fetch({
                    success: function() {
                        if (classicurlModel.get('sid')) {
                            this.model.searchJob.set(this.model.searchJob.idAttribute, classicurlModel.get('sid'));
                            this.model.searchJob.fetch({
                                data : {
                                    message_level: 'debug'
                                },
                                success: function(model, response) {
                                    var savedSearchId = this.model.searchJob.getSavedSearchId();
                                    if(savedSearchId) {
                                        this.model.savedSearch.set(this.model.savedSearch.idAttribute, savedSearchId);
                                        this.model.savedSearch.fetch({
                                            success: function() {
                                                this.deferreds.savedSearchJobDeferred.resolve();
                                            }.bind(this),
                                            error: function() {
                                                this.model.savedSearch.unset(this.model.savedSearch.idAttribute);
                                                this.deferreds.savedSearchJobDeferred.resolve();
                                            }.bind(this)
                                        });
                                    } else {
                                        this.deferreds.savedSearchJobDeferred.resolve();
                                    }
                                    this.deferreds.searchJobDeferred.resolve();
                                }.bind(this),
                                error: function(model, response) {
                                    this.model.searchJob.unset(this.model.searchJob.idAttribute);
                                    this.deferreds.searchJobDeferred.resolve();
                                    this.deferreds.savedSearchJobDeferred.resolve();
                                }.bind(this)
                            });
                        } else {
                            var noSidError = splunkd_utils.createSplunkDMessage(splunkd_utils.FATAL,
                                                _("No sid was specified.").t());
                            this.model.searchJob.trigger('error', this.model.searchJob, noSidError);
                            this.deferreds.searchJobDeferred.resolve();
                            this.deferreds.savedSearchJobDeferred.resolve();
                        }
                    }.bind(this)
                });
                
                $.when(this.deferreds.pageViewRendered, this.deferreds.searchJobDeferred, this.deferreds.savedSearchJobDeferred).then(function() {
                    this.jobInspector = new JobInspectorView({
                        model : {
                            searchJob: this.model.searchJob,
                            savedSearch: this.model.savedSearch,
                            application: this.model.application,
                            serverInfo: this.model.serverInfo
                        }
                    });
                    
                    this.setPageTitle(_('Search job inspector').t());
                    this.pageView.$('.main-section-body').html(this.jobInspector.render().el);
                    $('.preload').replaceWith(this.pageView.el);
                }.bind(this));
            
            }
        });
    }
);