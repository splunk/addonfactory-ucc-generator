define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/search/initialhelp/What',
        'views/search/searchhistory/Master',
        'uri/route',
        'splunk.util'
    ],
    function(_, $, module, Base, What, SearchHistoryView, route, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            className:'section-content',
            /**
             * @param {Object} options {
             *     model: {
             *         appLocal: <models.services.AppLocal>,
             *         application: <models.Application>
             *         serverInfo: <models.services.server.ServerInfo>,
             *         report: <models.search.Report>,
             *         metaDataResult: <models.services.search.job.Result>,
             *         searchBar: <models.search.SearchBar>,
             *         uiPrefs: <models.services.data.ui.Pref>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.what = new What({
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        metaDataResult: this.model.metaDataResult,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.searchHistory = new SearchHistoryView({
                    model: {
                        application: this.model.application,
                        searchBar: this.model.searchBar,
                        uiPrefs: this.model.uiPrefs
                    }
                });
            },
            activate: function() {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                var enableMetaData = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.enableMetaData')),
                    showDataSummary = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.showDataSummary'));

                if (enableMetaData || showDataSummary) {
                    this.children.what.activate().$el.show();
                    this.$('.column:not(.column-what)').addClass('.column-how');
                } else {
                    this.children.what.deactivate().$el.hide();
                    this.$('.column-how').removeClass('.column-how');
                }
                this.children.searchHistory.activate();
                return Base.prototype.activate.call(this, arguments);
            },
            render: function() {
                var root = this.model.application.get("root"),
                    locale = this.model.application.get("locale"),
                    app = this.model.application.get("app"),
                    version = this.model.appLocal.entry.content.get('version'),
                    enableMetaData = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.enableMetaData')),
                    showDataSummary = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.showDataSummary'));

                this.$el.html(this.compiledTemplate({
                    _: _,
                    docRoute: route.docHelp(root, locale, 'splunkcore.homepage.docs'),
                    tutorialDocRoute: route.docHelp(root, locale, 'search_app.tutorial'),
                    whatIsShown: enableMetaData || showDataSummary
                }));

                this.children.what.render().appendTo(this.$el);
                this.children.searchHistory.render().appendTo(this.$el);
                return this;
            },
            template: '\
                <div class="column help-column <% if (whatIsShown) { %> column-how <% } %>">\
                    <h3><%- _("How to Search").t() %></h3>\
                    <p><%- _("If you are not familiar with the search features, or want to learn more, see one of the following resources.").t() %></p>\
                    <a href="<%- docRoute %>" target="_blank" title="<%- _("Splunk help").t() %>" class="btn btn-documentation" style="margin-bottom: 10px"><%- _("Documentation").t() %> <i class="icon-external"></i></a>\
                    <a href="<%- tutorialDocRoute %>" target="_blank" title="<%- _("Splunk help").t() %>" class="btn btn-documentation" style="margin-bottom: 10px"><%- _("Tutorial").t() %> <i class="icon-external"></i></a>\
                </div>\
            '
        });
    }
);
