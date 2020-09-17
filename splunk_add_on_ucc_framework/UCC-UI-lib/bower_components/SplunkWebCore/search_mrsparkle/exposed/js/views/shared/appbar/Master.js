define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/appbar/AppNav',
    'views/shared/appbar/AppLabel',
    'views/shared/appbar/more/Master',
    'models/shared/Application',
    'models/services/data/ui/Nav',
    'models/services/AppLocal',
    'collections/services/data/ui/Views',
    'collections/services/saved/Searches',
    './Master.pcssm',
    'helpers/AppNav',
    'uri/route',
    'util/color_utils',
    'util/console',
    'util/xml'
],
function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    AppNavView,
    AppLabelView,
    MoreMenu,
    ApplicationModel,
    NavModel,
    AppModel,
    ViewsCollection,
    SavedSearchesCollection,
    css,
    appNavParser,
    route,
    color_utils,
    console,
    XML
) {
    var View = BaseView.extend({
        moduleId: module.id,
        css: css,
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.appNav = new AppNavView({
                model: {
                    user: this.model.user,
                    serverInfo: this.model.serverInfo,
                    appNav: this.model.appNav,
                    application: this.model.application
                },
                collection: this.collection
            });

            this.children.appLabel = new AppLabelView({
                model: this.model,
                collection: this.collection
            });

            this.setBannerColor();
            this.model.appNav.on('change:color', this.setBannerColor, this);

            if(options.autoRender !== false) {
                this.debouncedRender();
            }
        },

        renderMoreMenu: function() {
            this.children.moreMenu = new MoreMenu({
                model: {
                    serverInfo: this.model.serverInfo
                },
                navData: {submenu: this.model.appNav.get('nav')}
            });
            this.children.appNav.$el.append(this.children.moreMenu.render().el);
        },

        removeMoreMenu: function() {
            if (this.children.moreMenu) {
                this.children.moreMenu.remove();
            }
        },

        collapseAppNav: function() {
            this.removeMoreMenu();
            this.$('[data-role=right-nav]').removeAttr('data-action');
            var mainWidth = this.$el.outerWidth(),
                diff = this._getNavWidthDiff(mainWidth),
                $appNav = this.children.appNav.$el.find('[data-role=app-nav-container]'),
                links = $appNav.children().show(),
                offsetLinks = [];

            if (diff <= 0) {return false;}

            $appNav.width(diff);
            _.each(links, function(link) {
                if (link.offsetTop > 0) {
                    offsetLinks.push(link);
                }
            });

            var numOffsetLinks = offsetLinks.length;
            if (numOffsetLinks > 0) {
                $(offsetLinks).hide();
                this.renderMoreMenu();
                this.children.moreMenu.$('[data-role=slidelist-menu] > li').hide().slice(-numOffsetLinks).show();
            }
            $appNav.width('auto');
        },

        _getNavWidthDiff: function(mainWidth) {
            var appLabelWidth = this.children.appLabel.$el.outerWidth();
            return mainWidth - appLabelWidth || 0;
        },

        render: function() {
            this.$el.html('');
            this.children.appLabel.render().appendTo(this.$el);
            this.children.appNav.render().prependTo(this.$el);

            return this;
        },

        setBannerColor: function(){
            if(!this.model.appNav){return false;}

            var navColor = color_utils.normalizeHexString(this.model.appNav.get('color')||'');
            var isHexColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(navColor);
            if (!isHexColor ){
                return false;
            }
            this.$el.css('background-color', navColor);
        }
    },
    {
        END_GRADIENT_LUMINOSITY: 0.90,
        createWithAppNavUrl: function(options){
            var self = this;
            var app = self._getApp(options);
            var owner = options.model.application.get('owner');
            var applicationDfd = new $.Deferred();

            if (app && owner) {
                applicationDfd.resolve(app, owner);
            } else {
                options.model.application.once('change', function() {
                    var app = self._getApp(options),
                        owner = options.model.application.get('owner');
                    if (app && owner) {
                        applicationDfd.resolve(app, owner);
                    }
                });
            }

            applicationDfd.done(function(){
                var url = route.appNavUrl(options.model.application.get('root'), options.model.application.get('locale'), self._getApp(options));
                $.ajax({
                    url: url,
                    dataType:'json'
                }).done(function(data){
                    self._applyAppNavData(data, options.model.appNav, options, false);
                }).fail(function() {
                    self.createWithBackbone(options);
                });
            });
        },
        _getApp: function(options) {
            return options.model.application.get('app') || 'search';
        },
        createWithAppNavModel: function(options) {
            var appNav = options.model.appNav;
            this._applyAppNavData(appNav.entry.content.toJSON(), appNav, options, false);
        },
        createWithBackbone: function(options){
            var self = this;
            var applicationDfd = $.Deferred();
            var appNavDfd = $.Deferred();
            var viewsDfd = $.Deferred();
            var savedSearchesDfd = $.Deferred();
            var appDfd = $.Deferred();
            function updateNavData() {
                var data = appNavParser.parseNavModel(
                    options.model.splunkDappNav,
                    options.collection.views,
                    options.collection.savedSearches,
                    options.model.application.get('root')
                );
                var appLabel;
                if (data.appLabel) {
                    appLabel = data.appLabel;
                } else if (options.model.app && options.model.app.entry && options.model.app.entry.content && options.model.app.entry.content.get('label')) {
                    appLabel = options.model.app.entry.content.get('label') || '';
                }
                self._applyAppNavData({
                    nav: data.nav,
                    color: data.color,
                    label: appLabel,
                    defaultView: data.defaultView,
                    searchView: data.searchView
                }, options.model.appNav, options, false);
            }

            var app = self._getApp(options),
                owner = options.model.application.get('owner');
            if (app && owner) {
                applicationDfd.resolve(app, owner);
            } else {
                options.model.application.once('change', function() {
                    var app = self._getApp(options);
                    var owner = options.model.application.get('owner');
                    if (app && owner) {
                        applicationDfd.resolve(app, owner);
                    }
                });
            }

            if (!options.model.app) {
                options.model.app = new AppModel();
                applicationDfd.done(function(app, owner) {
                    options.model.app.set({id: 'apps/local/' + app});
                    options.model.app.fetch({data: {app: app, owner: owner}});
                });
            }

            if (!options.collection.views) {
                options.collection.views = new ViewsCollection();
                applicationDfd.done(function(app, owner) {
                    options.collection.views.fetch({data: {app: app, owner: owner, count: -1, digest: 1}});
                });
            }

            if (!options.collection.savedSearches) {
                options.collection.savedSearches = new SavedSearchesCollection();
                applicationDfd.done(function(app, owner) {
                    appNavDfd.then(function() {
                        var xml = this.entry.content.get('eai:data');
                        // Only fetch the savedsearhes collection if we're referencing saved searches in the nav
                        if (XML.parse(xml).find('saved[match],saved[source]').length > 0) {
                            options.collection.savedSearches.fetch({
                                data: {
                                    app: app,
                                    owner: '-',
                                    search: 'is_visible=1 AND disabled=0',
                                    count: 500 // Limited to 500 saved searches to match appserver behavior
                                }
                            });
                        } else {
                            savedSearchesDfd.resolve();
                        }
                    });
                });
            }

            if (!options.model.splunkDappNav) {
                options.model.splunkDappNav = new NavModel();
                applicationDfd.done(function(app, owner) {
                    options.model.splunkDappNav.fetch({data: {app: app, owner: owner}});
                });
            }

            options.collection.views.once('reset', viewsDfd.resolve);
            options.collection.savedSearches.once('reset', savedSearchesDfd.resolve);
            options.model.splunkDappNav.once('sync', appNavDfd.resolve);
            options.model.app.once('sync', appDfd.resolve);

            $.when(viewsDfd, savedSearchesDfd, appNavDfd).then(updateNavData);
        },
        _applyAppNavData: function(data, appNav, options, fromCache) {
            var root = options.model.application.get('root'),
                locale = options.model.application.get('locale'),
                app = this._getApp(options),
                owner = options.model.application.get('owner'),
                appLink = route.page(root, locale || '', app),
                appIcon = route.appIcon(root, locale || '', owner, app),
                appLogo = route.appLogo(root, locale || '', owner, app);

            if (console.DEBUG_ENABLED) {
                if (this._lastApply) {
                    console.debug('Applying app nav data %o after %o ms', data, new Date().getTime() - this._lastApply);
                } else {
                    this._lastApply = new Date().getTime();
                    console.debug('Applying app nav data: %o', data);
                }
            }
            appNav.set({
                nav: data.nav,
                color: data.color,
                label: data.label,
                icon: appIcon,
                logo: appLogo,
                link: appLink,
                defaultView: data.defaultView,
                searchView: data.searchView
            });

            if (!fromCache) {
                this._cacheValue(data, options);
            }
        },
        _supportsSessionStorage: function() {
            return 'sessionStorage' in window && window.sessionStorage;
        },
        _cachePrefix: 'splunk-appnav',
        _cacheKey: function(app, options) {
            return [this._cachePrefix, this._getApp(options), app.get('owner'), app.get('locale')].join(':');
        },
        _cacheValue: function(data, options) {
            if (this._supportsSessionStorage()) {
                data = _(data).pick('nav', 'color', 'label', 'defaultView', 'searchView');
                console.debug('Caching app nav data: %o', data);
                try {
                    window.sessionStorage.setItem(this._cacheKey(options.model.application, options), JSON.stringify(data));
                } catch (e) {
                    console.warn('Update to store app nav data in sessionStorage: ', e);
                }
            }
        },
        _createFromCache: function(options) {
            if (this._supportsSessionStorage()) {
                try {
                    var cacheKey = this._cacheKey(options.model.application, options);
                    var cachedData = JSON.parse(window.sessionStorage.getItem(cacheKey));
                    if (cachedData) {
                        console.debug('Applying cached app nav data: %o', cachedData);
                        var appNav = new Backbone.Model();
                        this._applyAppNavData(cachedData, appNav, options, true);
                        options.model.appNav = appNav;
                        _.delay(_.bind(this._loadDefault, this, options), 1000);
                        return;
                    }
                } catch (e) {
                    console.warn('Unable load cached app nav data: ', e);
                }
            }
            this._createDefault(options);
        },
        _loadDefault: function(options){
            if (options.appServerUrl) {
                this.createWithAppNavUrl(options);
            } else {
                this.createWithBackbone(options);
            }
        },
        _createDefault: function(options) {
            if (options.model.appNav) {
                this.createWithAppNavModel(options);
            } else {
                options.model.appNav = new Backbone.Model();
                this._loadDefault(options);
            }
        },
        create: function(options) {
            options = options || {};
            options.collection = options.collection || {};
            options.model = options.model || {};
            if (options.useSessionStorageCache === true) {
                this._createFromCache(options);
            } else {
                this._createDefault(options);
            }
            return new View(options);
        }
    });
    return View;
});
