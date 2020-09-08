define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'models/Base',
        'models/services/data/ui/Pref',
        'collections/services/authorization/Roles',
        'util/splunkd_utils'
    ],
    function(
        _,
        $,
        BaseRouter,
        BaseModel,
        UIPrefsModel,
        RolesCollection,
        splunkd_utils
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.fetchUser = true;
                this.fetchAppLocals = true;
                //models
                this.stateModel = new BaseModel();
                this.uiPrefsModel = new UIPrefsModel();
                this.rawSearch = new BaseModel();
                //collections
                this.rolesCollection = new RolesCollection();
            },
            initializeAndRenderViews: function() {
                throw new Error("You must implement initializeAndRenderViews");
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                this.rolesCollectionDeferred = this.rolesCollection.fetch();

                if (!this.uiPrefsDeferred) {
                    this.uiPrefsDeferred = $.Deferred();
                    this.uiPrefsModel.bootstrap(this.uiPrefsDeferred, this.model.application.get("page"), this.model.application.get("app"), this.model.application.get("owner"));                    
                }

                this.deferreds.pageViewRendered.done(function(){
                    if (this.shouldRender) {
                        this.pageView.$('.section-padded').remove();//remove once all pages migrated to Page view class correctly
                        $('.preload').replaceWith(this.pageView.el);
                    }
                }.bind(this));

                this.$whenFetchCollectionDependencies().then(function() {
                    this.fetchListCollection();
                }.bind(this));

                this.$whenFetchInitializeDependencies().then(function() {
                    this.initializeAndRenderViews();
                }.bind(this));
            },
            $whenFetchCollectionDependencies: function() {
                return $.when(this.uiPrefsDeferred);
            },
            $whenFetchInitializeDependencies: function() {
                return $.when(this.rolesCollectionDeferred, this.uiPrefsDeferred, this.deferreds.pageViewRendered, this.deferreds.userPref);
            },
            populateUIPrefs: function() {
                var data = {};
                if (this.uiPrefsModel.isNew()) {
                    data = {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    };
                }

                this.uiPrefsModel.save({}, {
                    data: data
                });
            },
            fetchListCollection: function() {
                //must resolve deferred
                throw new Error("You must implement fetchListCollection");
            },
            getButtonFilterSearch: function() {
                var buttonFilter = this.uiPrefsModel.entry.content.get('display.prefs.aclFilter');
                if(_.isUndefined(buttonFilter) || buttonFilter === 'none') {
                    return '';
                } else {
                    switch(buttonFilter) {
                        case 'owner':
                            return '(eai:acl.owner=' + splunkd_utils.quoteSearchFilterValue(this.model.application.get('owner')) + ')';
                        case 'app':
                            return '(eai:acl.app=' + splunkd_utils.quoteSearchFilterValue(this.model.application.get('app')) + ')';
                    }
                }
            }
        });
    }
);
