define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'views/SearchPrefs',
        'models/shared/TimeRange',
        'models/services/data/UserPrefGeneralDefault',
        'collections/services/data/ui/Times'
    ],
    function(
        $,
        _,
        BaseRouter,
        SearchPrefs,
        TimeRangeModel,
        UserPrefGeneralDefaultModel,
        TimesCollection
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments); 
                
                this.model.userPrefGeneralDefault = new UserPrefGeneralDefaultModel();
                this.model.timeRange = new TimeRangeModel();
                this.collection.times = new TimesCollection();

                this.deferreds.userPrefGeneralDefault = $.Deferred();
                this.deferreds.timeRangeDeferred = $.Deferred();
                this.deferreds.timesCollectionDeferred = $.Deferred();

                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                this.model.userPrefGeneralDefault.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    },
                    success: function(model, response) {
                        this.deferreds.userPrefGeneralDefault.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.userPrefGeneralDefault.resolve();
                    }.bind(this)
                 });
                 
                this.collection.times.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    },
                    success: function(model, response) {
                        this.deferreds.timesCollectionDeferred.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.timesCollectionDeferred.resolve();
                    }.bind(this)
                });
                
                $.when(this.deferreds.userPrefGeneralDefault).then(function() {
                    this.model.timeRange.save(
                        {
                            'earliest': this.model.userPrefGeneralDefault.entry.content.get('default_earliest_time'),
                            'latest': this.model.userPrefGeneralDefault.entry.content.get('default_latest_time')
                        },
                        {
                            validate: false,
                            success: function(model, response) {
                                this.deferreds.timeRangeDeferred.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.timeRangeDeferred.resolve();
                            }.bind(this)
                        }
                    );
                }.bind(this));

                $.when(this.deferreds.pageViewRendered, this.deferreds.timeRangeDeferred, this.deferreds.timeCollectionDeferred).then(function() {
                    this.searchPrefsView = new SearchPrefs({
                        model: {
                            userPrefGeneralDefault: this.model.userPrefGeneralDefault,
                            timeRange: this.model.timeRange,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            application: this.model.application
                        },
                        collection: {
                            times: this.collection.times 
                        }
                    });

                    this.setPageTitle(_('Search Preferences').t());
                    this.pageView.$('.main-section-body').html(this.searchPrefsView.render().el);
                    $('.preload').replaceWith(this.pageView.el);
                }.bind(this));
            }
        });
    }
);
