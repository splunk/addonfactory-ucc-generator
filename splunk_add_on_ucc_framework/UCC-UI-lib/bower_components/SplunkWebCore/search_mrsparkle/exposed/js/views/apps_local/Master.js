define(
    [
        "jquery",
        "underscore",
        "models/services/admin/AppObjectsCounts",
        'models/services/search/jobs/ResultJsonRows',
        "models/search/Job",
        "collections/services/saved/Searches",
        "views/Base",
        "views/apps_local/App",
        "views/shared/controls/DefaultApp",
        'views/shared/ModalConfirmation/Master',
        "views/shared/Restart",
        "splunk.util",
        "views/shared/apps_remote/Master.pcss",
        "./Master.pcss"
    ],
    function(
        $,
        _,
        AppObjectsCountsModel,
        ResultJsonRows,
        SearchJob,
        SavedSearchesCollection,
        BaseView,
        AppView,
        DefaultAppControl,
        ConfirmDialog,
        RestartDialog,
        splunkUtil,
        remoteCss,
        css
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                var locals = {};
                this.appIds = [];
                this.appNames = [];
                this.defaultApp = 'search';
                this.errorMessage = _('Error saving default app. Please try again later.').t();

                this.getAppWhitelist();

                this.collection.appLocals.each(function(model, index) {
                    locals[model.getSplunkAppsId()] = model;
                });

                this.collection.appRemotes.each(function(model, index) {
                    var appId = model.getAppId(),
                        appType = model.get('type') || 'addon',
                        localModel = locals[appId], // undefined if app is not installed
                        enabledAndVisible = false;

                    this.children[appId] = new AppView({
                        model: {
                            remote: model,
                            local: localModel,
                            application: this.model.application,
                            appObjectsCounts: this.retrieveObjectsCountsForApp(this.model.allAppsObjectCounts, appId),
                            serverInfo: this.model.serverInfo,
                            user: this.model.user
                        },
                        collection: {
                            messages: this.collection.messages
                        },
                        installSuccessCallback : this.installSuccessCallback.bind(this),
                        type: appType,
                        isDefaultApp: (appId == this.defaultApp) ? true : false
                    });
                    this.appIds.push(appId);
                    this.appNames[appId] = model.getTitle();

                    if (localModel) {
                        enabledAndVisible = !splunkUtil.normalizeBoolean(localModel.entry.content.get('disabled')) &&
                                                splunkUtil.normalizeBoolean(localModel.entry.content.get('visible'));
                    }

                    this.updateWhitelist(appId, appType, enabledAndVisible);

                    this.children[appId].on('installed', function(appModel) {
                        var appId = appModel.getAppId(),
                            appType = appModel.get('type') || 'addon';

                        this.updateWhitelist(appId, appType, true);
                        this.setAppWhitelist();
                    }.bind(this));

                    this.children[appId].on('enableDisable', function(appModel, checked) {
                        var appId = appModel.getAppId(),
                            appType = appModel.get('type') || 'addon';

                        this.updateWhitelist(appId, appType, checked);
                        this.setAppWhitelist();
                    }.bind(this));

                }.bind(this));

                this.children.confirmDialog = new ConfirmDialog({
                    text: _("Are you sure you want to restart Splunk Light?").t()
                });
                this.children.confirmDialog.on('success', function() {
                    this.children.restartDialog = new RestartDialog({
                        model: {
                            serverInfo: this.model.serverInfo
                        }
                    });
                    $("body").append(this.children.restartDialog.render().el);
                    this.children.restartDialog.show();
                    splunkUtil.restart_server();
                }.bind(this));
            },

            installSuccessCallback: function(appId){
                this.collection.appLocals.fetch({
                    data: {
                        count: -1
                    },
                    success: function(collection, response) {
                        var searchJob = new SearchJob();
                        var appObjectsCountsRaw = new ResultJsonRows();

                        // Extension of search from routers/AppsLocal.js
                        var BASE_USAGE_SEARCH_STRING =
                            "| rest /servicesNS/nobody/-/admin/directory "+
                            "| search eai:acl.app="+appId+" | stats count as adminDirCt"+
                            "| append [| rest /services/data/ui/panels "+
                            "| search eai:acl.app="+appId+" | stats count as panelsCt] "+
                            "| append [| rest /services/data/indexes "+
                            "| search eai:acl.app="+appId+" | stats count as indexesCt] "+
                            "| append [| rest /services/saved/searches "+
                            "| search "+ SavedSearchesCollection.ALERT_SEARCH_STRING +" AND "+
                            " eai:acl.app="+appId+" | stats count as alertsCt] "+
                            "| append [| rest /services/saved/searches "+
                            "| search NOT "+ SavedSearchesCollection.ALERT_SEARCH_STRING +" AND "+
                            " eai:acl.app="+appId+" | stats count as reportsCt] "+
                            "| stats first(*) as *";

                        var jobPromise = searchJob.save({}, {
                            data: {
                                search: BASE_USAGE_SEARCH_STRING
                            }
                        });
                        jobPromise.done(function () {
                            searchJob.registerJobProgressLinksChild(
                                SearchJob.RESULTS,
                                appObjectsCountsRaw,
                                function () {
                                    if (searchJob.isDone()) {
                                        appObjectsCountsRaw.fetch();
                                    }
                                },
                                this);
                            searchJob.startPolling();
                        }.bind(this));

                        this.listenTo(appObjectsCountsRaw, "sync", function() {
                            var localModel = this.collection.appLocals.findByEntryName(appId);
                            var appRemoteModel = this.collection.appRemotes.findByEntryName(appId);
                            var appView = new AppView({
                                model: {
                                    remote: appRemoteModel,
                                    local: localModel,
                                    application: this.model.application,
                                    appObjectsCounts: this.retrieveObjectsCounts(appObjectsCountsRaw),
                                    serverInfo: this.model.serverInfo,
                                    user: this.model.user
                                },
                                collection: {
                                    messages: this.collection.messages
                                },
                                type: appRemoteModel.get('type') || 'addon',
                                isDefaultApp: appId == this.defaultApp
                            });
                            this.children[appId].$el.replaceWith(appView.render().$el);
                            this.children[appId] = appView;
                        }.bind(this));
                    }.bind(this)
                });
            },

            retrieveObjectsCounts: function(allObjectCounts) {
                var rows = allObjectCounts.get("rows"),
                    fields = allObjectCounts.get('fields'),
                    appObjectsCounts = new AppObjectsCountsModel();
                for (var i = 0; i < fields.length ; i++) {
                    appObjectsCounts.set(fields[i], rows[0][i]);
                }
                return appObjectsCounts;
            },

            retrieveObjectsCountsForApp: function(allAppsObjectCounts, appName) {
                var rows = allAppsObjectCounts.get("rows"),
                    fields = allAppsObjectCounts.get('fields'),
                    appObjectsCounts = new AppObjectsCountsModel();
                // Retrieve the results of the SearchJob defined is routers/AppsLocal
                // Feed the model with objects counts starting at index 1 because the index 0 is eai:acl.app
                for (var i = 0; i < rows.length ; i++) {
                    if (rows[i][0] === appName) {
                        for (var j = 1; j < fields.length ; j++) {
                            appObjectsCounts.set(fields[j], rows[i][fields.indexOf(fields[j])]);
                        }
                    }
                }
                return appObjectsCounts;
            },

            events: {
                'click .restart' : function(e) {
                    e.preventDefault();
                    this.children.confirmDialog.render().el;
                    this.children.confirmDialog.show();
                },
                'click [data-role=save-button]': function(e) {
                    if (this.children.defaultAppControl) {
                        this.model.userPrefGeneralDefault.entry.content.set(
                            {'default_namespace': this.children.defaultAppControl.selectedItem.value});
                        this.model.userPrefGeneralDefault.set({'id' : this.modelId});
                        this.model.userPrefGeneralDefault.save({}, {
                            success: function(userPrefGeneralDefault) {
                                this.defaultApp = this.children.defaultAppControl.selectedItem.value;
                                //update tiles to reflect ability to enable/disable
                                this.reRenderEnableBoxForApps();
                            }.bind(this),
                            error: function(userPrefGeneralDefault) {
                                this.createMessageBanner(this.errorMessage, 'error');
                            }.bind(this)
                        });
                    }
                    e.preventDefault();
                }
            },

            getAppWhitelist: function() {
                if (this.model.userPrefGeneralDefault) {
                    this.TA_list = this.model.userPrefGeneralDefault.entry.content.get('TA_list');
                    this.app_list = this.model.userPrefGeneralDefault.entry.content.get('app_list');
                    this.defaultApp = this.model.userPrefGeneralDefault.entry.content.get('default_namespace') || 'search';
                    if (this.defaultApp == '$default') {
                        this.defaultApp = 'search';
                    }
                    this.modelId = this.model.userPrefGeneralDefault.id;

                    if (this.TA_list) {
                        this.TA_list = this.TA_list.replace(/ /g,'').split(',');
                    } else {
                        this.TA_list = [];
                    }

                    if (this.app_list) {
                        this.app_list = this.app_list.replace(/ /g,'');
                        if (this.app_list.indexOf('search') == -1) {
                            this.app_list = 'search,' + this.app_list;
                        }
                        this.app_list = this.app_list.split(',');
                    } else {
                        this.app_list = ['search'];
                    }
                }
            },

            setAppWhitelist: function() {

                // save the app/TA lists and the default app
                // render drop down list control on success
                if (this.model.userPrefGeneralDefault) {
                    this.model.userPrefGeneralDefault.entry.content.set(
                        {'TA_list': this.TA_list.length > 0 ? this.TA_list.join() : ''});

                    this.model.userPrefGeneralDefault.entry.content.set(
                        {'app_list': this.app_list.length > 0 ? this.app_list.join() : 'search'});

                    this.model.userPrefGeneralDefault.entry.content.set(
                        {'default_namespace': this.defaultApp});

                    this.model.userPrefGeneralDefault.set({'id' : this.modelId});
                    this.model.userPrefGeneralDefault.save({}, {
                        success: function(userPrefGeneralDefault) {
                            this.children.defaultAppControl = new DefaultAppControl({
                                model: userPrefGeneralDefault,
                                collection: {
                                    appLocals: this.collection.appLocals
                                },
                                showDefaultLabel: false
                            });

                            this.$("tr.default-app-pair td.default-app-list").html('');
                            this.children.defaultAppControl.render().appendTo(this.$("tr.default-app-pair td.default-app-list"));

                            // on change event (clicking the defaultAppControl), the save button should be enabled.
                            this.model.userPrefGeneralDefault.on('change', function() {
                                this.$(".default-app-save-btn").removeAttr("disabled").attr('data-role', 'save-button');
                            }.bind(this));

                            // on sync event (after the save button is clicked and model is saved), the save button should be disabled.
                            this.model.userPrefGeneralDefault.on('sync', function() {
                                this.$(".default-app-save-btn").attr("disabled", "disabled").removeAttr('data-role');
                            }.bind(this));
                        }.bind(this),
                        error: function() {
                            this.$('.default-app-table').hide();
                        }.bind(this)
                    });
                }
            },

            updateWhitelist: function(appId, appType, enabledAndVisible) {
                var inList = false;
                if (appType == 'app' && this.app_list) {
                    inList = (this.app_list.indexOf(appId) > -1) ? true : false;
                    if (enabledAndVisible) {
                        //if local app is not in app list, append to app list
                        if (!inList) {
                            this.app_list.push(appId);
                        }
                    }
                    else {
                        //if local app is in app list, remove from app list
                        if (inList) {
                            this.app_list = this.app_list.filter(function(app_id) { app_id != appId; });
                        }
                    }
                }

                if (appType == 'addon' && this.TA_list) {
                    inList = (this.TA_list.indexOf(appId) > -1) ? true : false;
                    if (enabledAndVisible) {
                        //if local TA is not in TA list, append to TA list
                        if (!inList) {
                            this.TA_list.push(appId);
                        }
                    }
                    else {
                        //if local TA is in TA list, remove from TA list
                        if (inList) {
                            this.TA_list = this.TA_list.filter(function(TA_id) { TA_id != appId; });
                        }
                    }
                }
            },

            reRenderEnableBoxForApps: function() {
                this.eachChild(function(child) {
                    if (child.options && child.options.type === 'app') {
                        child.renderEnable(child.model.local.getAppId() == this.defaultApp);
                    }
                }.bind(this));
            },

            createMessageBanner: function(msg, type) {
                var alertType = type || 'info',
                    el = splunkUtil.sprintf('<div class="alert alert-%s"><i class="icon-alert"/>%s</div>', alertType, msg);
                this.$('.app-tiles').before(el);
            },

            checkForRestart: function() {
                if (this.collection.messages) {
                    var restartRequired = this.collection.messages.find(function(model) {
                            return model.entry.get('name') == 'restart_required';
                        }),
                        appMatches = [];

                    if (restartRequired) {
                        this.collection.messages.find(function(model) {
                            if (model.entry.get('name').indexOf('restart_required_reason') != -1) {
                                _.each(this.appIds, function(app) {
                                    if (model.entry.content.get('message').indexOf(app) != -1) {
                                        if (appMatches.indexOf(this.appNames[app]) == -1) {
                                            appMatches.push(this.appNames[app]);
                                        }
                                    }
                                }, this);
                            }
                        }.bind(this));

                        if (appMatches.length > 0) {
                            var appList = appMatches.join(', '),
                                message = _('Restart is required to configure updated add-ons').t(),
                                messageFull = splunkUtil.sprintf('%s: %s <a class="restart" href="#">%s</a>', message, appList, _('Click here to restart').t());

                            this.createMessageBanner(messageFull, 'warning');
                        }
                    }
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate());

                var addOnSection = this.$(".add-on-tiles"),
                    appSection = this.$(".app-tiles"),
                    addOnCount = 0,
                    appCount = 0;

                this.eachChild(function(child) {
                    if (child.options && child.options.type === 'app') {
                        appCount++;
                        child.render().$el.appendTo(appSection);
                    } else {
                        addOnCount++;
                        child.render().$el.appendTo(addOnSection);
                    }
                }.bind(this));

                if (appCount == 0) {
                    appSection.hide();
                }

                if (addOnCount == 0) {
                    addOnSection.hide();
                }

                this.setAppWhitelist();
                this.checkForRestart();

                return this;
            },

            template: ' \
                <div class="section-padded section-header"> \
                    <h2 class="section-title"><%- _("Apps and Add-Ons").t() %></h2> \
                </div> \
                <div> \
                    <table class="default-app-table"> \
                        <tr class="default-app-pair"> \
                            <td class="default-app-label"><%- _("Default app").t() %></td> \
                            <td class="default-app-list"></td> \
                            <td class="default-app-action"><button class="btn btn-primary default-app-save-btn" disabled="disabled"><%- _("Save").t() %></button></td> \
                        </tr> \
                    </table> \
                </div> \
                <div class="app-tiles"><h3 class="section-title"><%- _("Apps").t() %></h3></div> \
                <div class="add-on-tiles"><h3 class="section-title"><%- _("Add-Ons").t() %></h3></div> \
            '
        });
    }
);
