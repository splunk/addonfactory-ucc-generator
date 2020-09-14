define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'models/dashboard/DashboardElementReport',
        'views/dashboard/element/Body',
        'views/dashboard/editor/addcontent/preview/content/SearchDetail',
        'views/shared/reportcontrols/details/Master',
        'splunkjs/mvc/savedsearchmanager',
        'splunkjs/mvc/tokenawaremodel'
    ],
    function(module,
             $,
             _,
             BaseView,
             DashboardElementReport,
             ElementBody,
             SearchDetail,
             ReportDetails,
             SavedSearchManager,
             TokenAwareModel) {

        var PREVIEW_SEARCH_ID = 'previewSearch';
        var PREVIEW_ELEMENT_ID = 'previewElement';

        var ReportView = BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.reportDetails = new ReportDetails({
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection,
                    showLinks: false
                });
                this.children.searchDetail = new SearchDetail({
                    model: {
                        report: this.model.report
                    }
                });
                this._createSavedSearch();
                this._createVizElement();
            },
            _createSavedSearch: function() {
                this.searchManager = new SavedSearchManager({
                    "id": PREVIEW_SEARCH_ID,
                    "searchname": this.model.report.entry.get('name'),
                    "app": this.model.application.get('app'),
                    "cancelOnUnload": true,
                    "auto_cancel": 90,
                    "status_buckets": 0,
                    "preview": true,
                    "cache": "scheduled"
                }, {replace: true});
            },
            _createVizElement: function() {
                var reportModel = new TokenAwareModel();
                var reportName = this.model.report.entry.get('name');
                reportModel.set(this.model.report.entry.content.toJSON({tokens: true}), {tokens: true});
                this.model.report = new DashboardElementReport({delegate: reportModel});
                this.model.report.entry.set('name', reportName);
                this.children.element = new ElementBody({
                    model: this.model,
                    deferreds: {
                        reportReady: $.Deferred().resolve(),
                        vizCreated: $.Deferred()
                    },
                    id: PREVIEW_ELEMENT_ID,
                    managerid: PREVIEW_SEARCH_ID
                }, {tokens: true});
            },
            render: function() {
                this.$el.html(this.compiledTemplate());
                var $details = this.children.reportDetails.render().$el;
                this.children.searchDetail.render().$el.appendTo($details);
                $details.prependTo(this.$el);
                this.children.element.render().$el.appendTo(this.$el.find('.dashboard-panel'));
                return this;
            },
            remove: function() {
                // dispose preview search
                this.searchManager && this.searchManager.dispose();
                BaseView.prototype.remove.apply(this, arguments);
            },
            template: '\
            <div class="dashboard-row">\
                <div class="dashboard-cell">\
                    <div class="dashboard-panel">\
                    </div>\
                </div>\
            </div>\
            '
        });

        return ReportView;
    });