define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/datasets/results/Master',
        'views/datasets/DatasetsAddonInstallDialog',
        'views/shared/datasetcontrols/createmenu/Master',
        'uri/route',
        'splunk.util',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ResultsView,
        DatasetsAddonInstallDialog,
        CreateMenu,
        route,
        splunkUtils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,

            /**
             * @param {Object} options {
             *      model: {
             *          state: <Backbone.Model>
             *          application: <models.Application>,
             *          uiPrefs: <models.services.admin.UIPrefs>
             *          appLocal: <models.services.AppLocal>
             *          user: <models.services.authentication.User>
             *          userPref: <models.services.data.UserPref>
             *          serverInfo: <models.services.server.ServerInfo>
             *          rawSearch: <Backbone.Model>
             *      }
             *      collection: {
             *          datasets: <collections.Datasets>,
             *          roles: <collections.services.authorization.Roles>,
             *          apps: <collections.services.AppLocals>
             *      }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.results = new ResultsView({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.model.rawSearch
                    },
                    collection: {
                        datasets: this.collection.datasets,
                        roles: this.collection.roles,
                        apps: this.collection.apps
                    }
                });

                this.children.createMenu = new CreateMenu({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        appLocal: this.model.appLocal
                    },
                    collection: {
                        apps: this.collection.apps
                    }
                });

                this.children.addonInstallDialog = new DatasetsAddonInstallDialog({
                    model: {
                        application: this.model.application,
                        datasetsAddonRemote: this.model.datasetsAddonRemote,
                        userPref: this.model.userPref
                    }
                });
            },

            render: function() {
                var showInstallDialog = splunkUtils.normalizeBoolean(this.model.userPref.entry.content.get('datasets:showInstallDialog')),
                    helpLink = route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'learnmore.datasets.listing'
                    ),
                    downloadLink = this.model.datasetsAddonRemote.get('path');

                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        helpLink: helpLink
                    }));
                    this.children.results.render().appendTo(this.$el);

                    if (this.model.user.canAccessSplunkDatasetExtensions()) {
                        this.children.createMenu.render().appendTo(this.$('.add-table-controls'));
                    } else if (this.collection.apps.links.get('create') &&
                            this.model.datasetsAddonRemote.isInstallable() &&
                            !this.model.datasetsAddonLocal.isDisabled()) {
                        // Always show the link to download it near the header
                        $(_.template(this.downloadTemplate, {
                            _: _,
                            downloadLink: downloadLink
                        })).insertAfter(this.$('.datasets-help-link'));

                        // Only show the dialog if the user hasn't said "don't show me this again"
                        if (showInstallDialog) {
                            this.children.addonInstallDialog.render().appendTo($('body'));
                            this.children.addonInstallDialog.show();
                        }
                    }
                }

                return this;
            },

            downloadTemplate: '\
                <div class="app-download-container">\
                    <%= _("Don\\\'t have the Splunk Datasets Add-on?").t() %>\
                    <a class="external app-download-link" href="<%- downloadLink %>" target="_blank"><span><%- _("Download it here.").t() %></span></a>\
                </div>\
            ',

            template: '\
                <div class="section-padded section-header">\
                    <div class="add-table-controls pull-right"></div>\
                    <h2 class="section-title"><i class="icon-table"></i>&nbsp;<%= _("Datasets").t() %></h2>\
                    <p class="section-description"><%= _("Use the Datasets listing page to view and manage your existing datasets. Click a dataset name to view its contents. Click Pivot to design a visualization-rich report based on the dataset. Click Explore in Search to extend a dataset in Search and save it as a new report, alert, or dashboard panel.").t() %></p>\
                    <a class="external datasets-help-link" href="<%- helpLink %>" target="_blank"><span><%- _("Learn more about Datasets.").t() %></span></a>\
                </div>\
                <div class="divider"></div>\
            '
        });
    }
);
