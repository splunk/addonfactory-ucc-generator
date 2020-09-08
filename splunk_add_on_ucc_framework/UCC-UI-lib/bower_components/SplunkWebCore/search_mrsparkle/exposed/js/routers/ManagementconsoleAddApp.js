define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/ManagementconsoleBase',
        'routers/AppsRemote',

        /* Views */
        'views/managementconsole/apps/add_app/Header',
        'views/managementconsole/apps/add_app/steps/SelectApp',
        'views/managementconsole/apps/add_app/SetProperties',
        'views/managementconsole/apps/add_app/steps/Review',
        'views/managementconsole/apps/add_app/steps/Done',
        'views/managementconsole/shared/LoadingDialog',

        /* Models */
        'models/managementconsole/App',
        'models/apps_remote/Login',
        'models/managementconsole/DmcFetchData',
        'models/url',

        /* Collections*/
        'collections/services/appsbrowser/v1/Apps',
        'collections/services/Messages',
        'collections/services/appsbrowser/v1/app/Options',
        'collections/managementconsole/Groups',
        'collections/managementconsole/Apps',

        'util/general_utils'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseRouter,
        AppsRemoteRouter,

        /* Views */
        HeaderView,
        SelectAppView,
        SetPropertiesView,
        ReviewView,
        DoneView,
        LoadingDialog,

        /* Models */
        AppModel,
        LoginModel,
        DmcFetchData,
        UrlModel,

        /* Collections */
        AppsBrowserCollection,
        MessagesCollection,
        OptionsCollection,
        GroupsCollection,
        AppsCollection,

        GeneralUtils
    ) {
        var DEFAULT_APP_BROWSER_FETCH_PARAMS = {offset: 0, count: 20, order: 'latest'};
        var INITIAL_STEP = 'selectapp';

        return DmcBaseRouter.extend({
            initialize: function() {
                DmcBaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Add App').t());
                this.children = this.children || {};

                this.model = $.extend(true, this.model, {
                    appModel: new AppModel({groups: []}),
                    auth: new LoginModel(),
                    groupFetchData: new DmcFetchData({
                        type: 'custom'
                    }),
                    metadata: new Backbone.Model(),
                    wizard: new Backbone.Model({
                        currentStep: 'selectapp',
                        appInstallType: 'upload',
                        hideFilter: true
                    })
                });

                this.collection = $.extend(true, this.collection, {
                    appsRemote: new AppsBrowserCollection(),
                    messages: new MessagesCollection(),
                    options: new OptionsCollection,
                    groups: new GroupsCollection(null, {
                        fetchData: this.model.groupFetchData
                    }),
                    apps: new AppsCollection()
                });

                this.children.headerView = new HeaderView({
                    model: {
                        wizard: this.model.wizard
                    }
                });

                this.model.wizard.on('change:currentStep', this._renderCurrentStep, this);
            },
            _renderCurrentStep: function(model, step) {
                var args = arguments;
                step = step || INITIAL_STEP;

                if (_.isFunction(this._steps[step])) {
                    this._steps[step].apply(this, args);
                }
            },
            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);

                this.model.metadata.set(DEFAULT_APP_BROWSER_FETCH_PARAMS);
                $.when(this.deferreds.pageViewRendered).done(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    this.pageView.$('.main-section-body').append(this.children.headerView.render().el);
                    this.pageView.$('.main-section-body').append('<div class="section-body add-app-body"></div>');

                    this._renderCurrentStep();
                }.bind(this));
            },
            _steps: {
                selectapp: function() {
                    this.model.metadata.on('change', function(model) {
                        if (!model.changed.offset) {
                            this.model.metadata.set({offset: 0}, {silent: true});
                        }

                        this.fetchAppsRemote();
                    }, this);

                    var view = new SelectAppView({
                        model: {
                            wizard: this.model.wizard,
                            appModel: this.model.appModel,
                            auth: this.model.auth,
                            metadata: this.model.metadata,
                            serverInfo: this.model.serverInfo,
                            application: this.model.application,
                            user: this.model.user
                        },
                        collection: {
                            options: this.collection.options,
                            appsRemote: this.collection.appsRemote,
                            appLocals: this.collection.apps,
                            messages: this.collection.messages
                        }
                    });

                    this.fetchAppsRemote();
                    $.when(this.deferreds.appLocals, this.collection.options.fetch(), this.collection.apps.fetch()).done(function() {
                        this._renderMainView(view);
                    }.bind(this));
                },
                setproperties: function() {
                    $.when(this.collection.groups.fetch()).done(function() {
                        var view = new SetPropertiesView({
                            model: {
                                wizard: this.model.wizard,
                                appModel: this.model.appModel
                            },
                            collection: {
                                groups: this.collection.groups
                            },
                            showFlashMessages: true
                        });

                        this._renderMainView(view);
                    }.bind(this));
                },
                review: function() {
                    var view = new ReviewView({
                        model: {
                            wizard: this.model.wizard,
                            appModel: this.model.appModel
                        }
                    });

                    this._renderMainView(view);
                },
                done: function() {
                    var installingDialog = new LoadingDialog({
                        title: _('Installing App...').t(),
                        text: _('Please wait while we install your app.').t()
                    }),
                        uploadFile = !!this.model.appModel.entry.content.get('data');

                    $('body').append(installingDialog.render());
                    installingDialog.show();

                    this.model.appModel.save({}, {uploadFile: uploadFile}).always(function(response, responseStatus) {
                        installingDialog.hide();
                        var errorMsg;

                        if (responseStatus !== 'success') {
                            errorMsg = response.responseJSON.error.message || _('Failed to save app.').t();
                            this.model.wizard.trigger('enablePrev');
                        }

                        var view = new DoneView({
                            model: {
                                wizard: this.model.wizard,
                                appModel: this.model.appModel
                            },
                            errorMsg: errorMsg
                        });

                        this._renderMainView(view);
                    }.bind(this));
                }
            },

            fetchAppsRemote: function() {
                AppsRemoteRouter.prototype.fetchAppsRemote.apply(this, arguments);
            },

            _renderMainView: function(view) {
                this.pageView.$('.add-app-body').html(view.render().el);
            }
        });
    }
);