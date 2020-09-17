define(
[
    'underscore',
    'jquery',
    'module',
    'views/shared/PopTart',
    'views/shared/Icon',
    'views/shared/splunkbar/find/results/DashboardResults',
    'views/shared/splunkbar/find/results/ReportResults',
    'views/shared/splunkbar/find/results/AlertResults',
    'views/shared/splunkbar/find/results/DatasetResults',
    'views/shared/splunkbar/find/results/DataModelResults',
    './Master.pcssm',
    'uri/route',
    'splunk.util'
],
function(
    _,
    $,
    module,
    PopTartView,
    IconView,
    DashboardResults,
    ReportResults,
    AlertResults,
    DatasetResults,
    DataModelResults,
    css,
    route,
    splunkUtils
){
    return PopTartView.extend({
        moduleId: module.id,
        css: css,
            /**
             * @param {Object} options {
             *     collection: {
             *         dashboards: <collections.shared.Dashboards>,
             *         reports: <collections.search.Reports>,
             *         alerts: <collections.search.Reports>,
             *         datasets: <collections.search.Reports>,
             *         datamodels: <collections.services.datamodel.DataModels>,
             *         apps: <collections.services.appLocal>
             *     model: {
             *         state: <models.State>,
             *         application: <models.shared.Application>,
             *         rawSearch: <models.Base>
             *     },
             *     mode: <string>,
             *     onHiddenRemove: <Boolean>
             * }
             */
        initialize: function() {
            PopTartView.prototype.initialize.apply(this, arguments);

            this.children.external = new IconView({icon: 'external'});

            this.$el.attr('class', css.view);
        },

        showNoResults: function() {
            this.$el.append('<div class="' + css.noResults + '">' + _("No Results for this search.").t() + '</div>');
        },

        getAlternateApp: function() {
            var currentApp = this.model.application.get('app'),
                alternateApp = currentApp !== 'system' ? currentApp : 'search';
            var searchApp = _.find(this.collection.apps.models, function(app) {
                return app.entry.get('name') === 'search';
            });

            if (alternateApp === 'search' && searchApp && searchApp.entry.content.get("disabled")) {
                this.collection.apps.sortWithString(this.model.userPref.entry.content.get('appOrder'));
                alternateApp = this.collection.apps.models[0].entry.get('name');
            }
            return alternateApp;
        },

        render: function() {
            this.el.innerHTML = PopTartView.prototype.template_menu;
            var searchLink = route.search(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                'search',
                {
                    data: {
                        q: this.model.rawSearch.get('rawSearch')
                    }
                }
            );
            if (!this.collection.reports.size() &&
                !this.collection.dashboards.size() &&
                !this.collection.alerts.size() &&
                !this.collection.datasets.size() &&
                !this.collection.datamodels.size()) {
                this.showNoResults();
            } else {
                var alternateApp = this.getAlternateApp();
                // Report Results
                if (this.collection.reports.size()) {
                    this.children.reportResults = new ReportResults({
                        collection: {
                            reports: this.collection.reports,
                            apps: this.collection.apps
                        },
                        model: {
                            application: this.model.application,
                            state: this.model.state,
                            rawSearch: this.model.rawSearch
                        },
                        alternateApp: alternateApp
                    });
                    this.$el.append(this.children.reportResults.render().el);
                }

                // Dashboard Results
                if (this.collection.dashboards.size()) {
                    this.children.dashboardResults = new DashboardResults({
                        collection: {
                            dashboards: this.collection.dashboards,
                            apps: this.collection.apps
                        },
                        model: {
                            application: this.model.application,
                            state: this.model.state,
                            rawSearch: this.model.rawSearch
                        },
                        alternateApp: alternateApp
                    });
                    this.$el.append(this.children.dashboardResults.render().el);
                }

                // Alert Results
                if (this.collection.alerts.size()) {
                    this.children.alertResults = new AlertResults({
                        collection: {
                            alerts: this.collection.alerts,
                            apps: this.collection.apps
                        },
                        model: {
                            application: this.model.application,
                            state: this.model.state,
                            rawSearch: this.model.rawSearch
                        },
                        alternateApp: alternateApp
                    });
                    this.$el.append(this.children.alertResults.render().el);
                }

                // Dataset Results
                if (this.collection.datasets.size()) {
                    this.children.datasetResults = new DatasetResults({
                        collection: {
                            datasets: this.collection.datasets,
                            apps: this.collection.apps
                        },
                        model: {
                            application: this.model.application,
                            state: this.model.state,
                            rawSearch: this.model.rawSearch
                        },
                        alternateApp: alternateApp
                    });
                    this.$el.append(this.children.datasetResults.render().el);
                }

                // Data Model Results
                if (this.collection.datamodels.size()) {
                    this.children.dataModelResults = new DataModelResults({
                        collection: {
                            datamodels: this.collection.datamodels,
                            apps: this.collection.apps
                        },
                        model: {
                            application: this.model.application,
                            state: this.model.state,
                            rawSearch: this.model.rawSearch
                        },
                        alternateApp: alternateApp
                    });
                    this.$el.append(this.children.dataModelResults.render().el);
                }
            }

            var html = this.compiledTemplate({
                _: _,
                splunkUtils: splunkUtils,
                searchLink: searchLink,
                rawSearch: this.model.rawSearch.get('rawSearch'),
                css: this.css
            });
            this.$el.append(html);
            this.children.external.render().prependTo(this.$("[data-role=secondary-search-more-link]"));

            return this;
        },
        template: '\
        <div class="<%=css.arrow %>" data-popdown-role="arrow"></div>\
        <ul class="<%=css.list%>" data-popdown-role="body"><li>\
            <a class="<%=css.primaryLink%>" href="<%- searchLink %>" data-role="search-more-link">\
                <%- splunkUtils.sprintf(_("Open %s in search").t(), rawSearch) %>\
            </a>\
            <a class="<%=css.secondaryLink%>" data-role="secondary-search-more-link" href="<%- searchLink %>" target="_blank" title="<%- splunkUtils.sprintf(_("Open %s in search in new tab").t(), rawSearch) %>">\
            </a>\
        </li></ul>\
        '
    });
});
