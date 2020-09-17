define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var AppModel = require('models/shared/Application');
    var AppLocalModel = require('models/services/AppLocal');
    var UserModel = require('models/shared/User');
    var UserPrefModel = require('models/services/data/UserPrefGeneral');
    var TimeRangesCollection = require('collections/services/data/ui/Times');
    var utils = require('./utils');
    var splunkConfig = require('splunk.config');
    var splunkd_utils = require('util/splunkd_utils');
    var ServerInfo = require('models/services/server/ServerInfo');
    var AppLocalCollection = require('collections/services/AppLocals');
    var PanelCollection = require('collections/services/data/ui/Panels');
    var DashboardCollection = require('collections/shared/Dashboards');
    var RolesCollection = require('collections/services/authorization/Roles');
    var TourCollection = require('collections/services/data/ui/Tours');
    var SearchBNFsCollection =  require('collections/services/configs/SearchBNFs');
    var Reports = require('collections/search/Reports');
    var console = require('util/console');

    var pageInfo = utils.getPageInfo();

    // The format for this object is:
    //  model name:
    //      model: an instance of the model
    //      fetch: a function with no arguments to use the above model and call
    //          'fetch' on it, storing the returned deferred on the model and returning
    //          that deferred. If the model does not need a fetch, just have a
    //          function that returns a deferred.
    var createSharedModels = function() {
        var serverInfo = new ServerInfo();
        if (typeof __splunkd_partials__ !== 'undefined' &&
            __splunkd_partials__['/services/server/info']) {
            serverInfo.setFromSplunkD(__splunkd_partials__['/services/server/info']);
            serverInfo.set('id', ServerInfo.id);
        }
        return {
            appLocal: {
                model: new AppLocalModel(),
                fetch: _.memoize(function() {
                    var appModel = _STORAGE['app'].model;
                    var model = _STORAGE['appLocal'].model;
                    var data = {
                        app: appModel.get("app"),
                        owner: appModel.get("owner")
                    };
                    var dfd = model.dfd = model.fetch({
                        url: splunkd_utils.fullpath(model.url + "/" + encodeURIComponent(appModel.get("app"))),
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});

                    model.dfd = dfd;
                    return dfd;
                })
            },
            user: {
                model: new UserModel({}, {'serverInfoModel': serverInfo}),
                fetch: _.memoize(function() {
                    var appModel = _STORAGE['app'].model;
                    var model = _STORAGE['user'].model;
                    var serverInfoDfd = _STORAGE['serverInfo'].fetch();
                    var data = {
                        app: appModel.get("app"),
                        owner: appModel.get("owner")
                    };
                    var dfd = $.Deferred();
                    model.dfd = model.fetch({
                        url: splunkd_utils.fullpath(model.url + "/" + encodeURIComponent(appModel.get("owner"))),
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});

                    $.when(serverInfoDfd, model.dfd).then(function() {
                        dfd.resolve();
                    });
                    return dfd;
                })
            },
            userPref: {
                model: new UserPrefModel(),
                fetch: _.memoize(function() {
                    var model = _STORAGE['userPref'].model;
                    var dfd = model.dfd = model.fetch();
                    model.dfd = dfd;
                    return dfd;
                })
            },
            times: {
                model: new TimeRangesCollection(),
                fetch: _.memoize(function() {
                    var appModel = _STORAGE['app'].model;
                    var model = _STORAGE['times'].model;
                    var data = {
                        app: appModel.get("app"),
                        owner: appModel.get("owner"),
                        count: -1
                    };
                    var dfd = model.dfd = model.fetch({
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});

                    return dfd;
                })
            },
            app: {
                model: new AppModel({
                    owner: splunkConfig.USERNAME,
                    root: pageInfo.root,
                    locale: pageInfo.locale,
                    app: pageInfo.app,
                    page: pageInfo.page
                }),
                fetch: function() { return $.Deferred().resolve(_STORAGE['app'].model); }
            },
            serverInfo: {
                model: serverInfo,
                fetch: _.memoize(function() {
                    var model = _STORAGE['serverInfo'].model;
                    var dfd = model.dfd = model.fetch();
                    return dfd;
                })
            },
            appLocals: {
                model: new AppLocalCollection(),
                fetch: _.memoize(function() {
                    var appModel = _STORAGE['app'].model;
                    var model = _STORAGE['appLocals'].model;
                    var data = {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: '-',
                        owner: appModel.get('owner'),
                        search: 'visible=true AND disabled=0 AND name!=launcher',
                        count: -1
                    };
                    var dfd = model.dfd = model.fetch({
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});

                    return dfd;
                })
            },
            appLocalsUnfiltered: {
                model: new AppLocalCollection(),
                fetch: _.memoize(function() {
                    var appModel = _STORAGE['app'].model;
                    var model = _STORAGE['appLocalsUnfiltered'].model;
                    var data = {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: '-',
                        owner: appModel.get('owner'),
                        search: 'visible=true AND disabled=0',
                        count: -1
                    };
                    var dfd = model.dfd = model.fetch({
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});

                    return dfd;
                })
            },
            panels: {
                model: new PanelCollection(),
                fetch: _.memoize(function() {
                    var model = _STORAGE['panels'].model;
                    var appModel = _STORAGE['app'].model;
                    var data = {
                        sort_key: 'panel.title',
                        app: appModel.get("app"),
                        count: 10
                    };
                    var dfd = model.dfd = model.fetch({
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});
                    model.original_count = this.model.fetchData.get('count');

                    return dfd;
                })
            },
            dashboards: {
                model: new DashboardCollection(),
                fetch: _.memoize(function() {
                    var model = _STORAGE['dashboards'].model;
                    var appModel = _STORAGE['app'].model;
                    var data = {
                        sort_key: 'label',
                        app: appModel.get("app"),
                        search: 'eai:type="views" AND (eai:data="*<dashboard*" OR eai:data="*<form*")',
                        count: 10
                    };
                    var dfd = model.dfd = model.fetch({
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});
                    model.original_count = this.model.fetchData.get('count');

                    return dfd;
                })
            },
            roles: {
                model: new RolesCollection(),
                fetch: _.memoize(function() {
                    return _STORAGE['roles'].model.fetch();
                })
            },
            tours: {
                model: new TourCollection(),
                fetch: _.memoize(function() {
                    var appModel = _STORAGE['app'].model;
                    var collection = _STORAGE['tours'].model;
                    var dfd = collection.dfd = collection.fetch({
                        data: {
                            app: appModel.get('app'),
                            owner: appModel.get('owner'),
                            count: -1
                        }
                    });

                    return dfd;
                })
            },
            reports: {
                model: new Reports(),
                fetch: _.memoize(function() {
                    var model = _STORAGE['reports'].model;
                    var appModel = _STORAGE['app'].model;
                    var data = {
                        app: appModel.get("app"),
                        owner: appModel.get('owner'),
                        search: 'is_visible=1 AND disabled=0',
                        count: 10
                    };
                    var dfd = model.dfd = model.fetch({
                        data: data
                    });
                    model.fetchData.set(data, {silent: true});
                    model.original_count = this.model.fetchData.get('count');

                    return dfd;

                })
            },
            searchBNFs: {
                model: new SearchBNFsCollection(),
                fetch: _.memoize(function() {
                    var model = _STORAGE['searchBNFs'].model;
                    var dfd = model.dfd = $.Deferred();
                    $.when(model.fetch({
                        data: {
                            count: 0
                        },
                        parseSyntax: true
                    })).always(function() {
                        model.dfd.resolve();
                    });
                    return dfd;
                })
            }
        };
    };


    var _STORAGE = createSharedModels();

    return {
        get: function(name) {
            console.trace('SHAREDMODELS GET', name);
            if (!_STORAGE.hasOwnProperty(name)) {
                throw new Error("There is no shared model '" + name + "'");
            }

            var container = _STORAGE[name];
            container.fetch();

            return container.model;
        },

        // In independent mode, the USERNAME is provided by the
        // user, often after sharedModels are created. In this
        // scenario, models requiring splunkConfig.USERNAME
        // must be updated to use the username provided. At this
        // point the only model relying on splunkjsConfig.USERNAME
        // is the 'app' model. This method is provided so that
        // the ready loader can update the model when necessary.
        _setAppOwner: function(name) {
            this.get('app').set('owner', name);
        },

        // This method is intended for test usage only.
        _clear: function() {
            _STORAGE = createSharedModels();
        },

        _prepopulate: function(content) {
            _(content).each(function(data, name) {
                if (!data.model) {
                    console.error('Prepopulated shared model is null!', name, data);
                    return;
                }
                var sharedModel = {model: data.model};
                if (data.dfd) {
                    data.model.dfd = data.model.dfd || data.dfd;
                    sharedModel.fetch = function() { return data.dfd.promise(); };
                }
                _STORAGE[name] = _.extend({}, _STORAGE[name], sharedModel);
            });
        }
    };
});
