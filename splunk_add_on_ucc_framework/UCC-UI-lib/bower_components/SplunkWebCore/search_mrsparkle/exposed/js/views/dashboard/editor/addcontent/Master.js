define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/shared/Sidebar',
        'views/shared/controls/TextControl',
        'views/dashboard/editor/addcontent/list/DashboardList',
        'views/dashboard/editor/addcontent/list/InlineList',
        'views/dashboard/editor/addcontent/list/PrebuiltPanelList',
        'views/dashboard/editor/addcontent/list/ReportList',
        'views/dashboard/editor/addcontent/preview/Inline',
        'views/dashboard/editor/addcontent/preview/Report',
        'views/dashboard/editor/addcontent/preview/PrebuiltPanel',
        'views/dashboard/editor/addcontent/preview/DashboardPanel',
        'helpers/VisualizationRegistry',
        'controllers/dashboard/helpers/ModelHelper',
        'views/dashboard/editor/addcontent/Utils',
        'splunk.util',
        'bootstrap.collapse'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseView,
             Sidebar,
             TextControl,
             DashboardList,
             InlineList,
             PrebuiltPanelList,
             ReportList,
             InlinePreview,
             ReportPreview,
             PrebuiltPanelPreview,
             DashboardPanelPreview,
             VisualizationRegistry,
             ModelHelper,
             AddContentUtils,
             SplunkUtil) {

        return BaseView.extend({
            moduleId: module.id,
            className: "add-content-master",
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.deferreds = options.deferreds;
                this.model = _.extend({
                    sidebarState: new Backbone.Model()
                }, this.model);
                this.collection = _.extend(
                    this._loadCollections(),
                    this._loadInlineCollection(),
                    this.collection
                );
                this._initSidebar();
                this._initFilter();
                this._initBodyViews();
            },
            _initSidebar: function() {
                this.children.sidebar = new Sidebar();
                this.listenTo(this.children.sidebar, 'sidebarsRemoved', this._clearPreviewState);
            },
            _initFilter: function() {
                this.children.filter = new TextControl({
                    placeholder: _('find...').t(),
                    updateOnKeyUp: true,
                    canClear: true,
                    model: this.model.sidebarState,
                    modelAttribute: 'filter'
                });
                this.listenTo(this.model.sidebarState, 'change:filter', this.filter);
            },
            _initBodyViews: function() {
                this.children.dashboardlist = new DashboardList({
                    model: this.model,
                    collection: this.collection.dashboards,
                    title: _('Clone from Dashboard').t()
                });
                this.listenTo(this.children.dashboardlist, 'preview', this._previewDashboardPanel);

                this.children.inlinelist = new InlineList({
                    collection: this.collection.inlines,
                    model: this.model,
                    title: _('New').t()
                });
                this.listenTo(this.children.inlinelist, 'preview', this._previewInline);

                this.children.panellist = new PrebuiltPanelList({
                    collection: this.collection.panels,
                    model: this.model,
                    title: _('Add Prebuilt Panel').t()
                });
                this.listenTo(this.children.panellist, 'preview', this._previewPrebuiltPanel);

                this.children.reportlist = new ReportList({
                    collection: this.collection.reports,
                    model: this.model,
                    title: _('New from Report').t()
                });
                this.listenTo(this.children.reportlist, 'preview', this._previewReport);
            },
            _loadCollections: function() {
                var app = this.model.application.get('app');
                var owner = this.model.application.get('owner');
                return {
                    panels: ModelHelper.getCachedModel('panels', {
                        sort_key: 'panel.title',
                        app: app,
                        count: 10
                    }),
                    dashboards: ModelHelper.getCachedModel('dashboards', {
                        sort_key: 'label',
                        app: app,
                        search: 'eai:type="views" AND (eai:data="*<dashboard*" OR eai:data="*<form*")',
                        count: 10
                    }),
                    reports: ModelHelper.getCachedModel('reports', {
                        app: app,
                        owner: owner,
                        search: 'is_visible=1 AND disabled=0',
                        count: 10
                    })
                };
            },
            _loadInlineCollection: function() {
                var inlineTypes = _(VisualizationRegistry.getAllVisualizations()).chain()
                    .where({ isSelectable: true })
                    .sortBy(function(vizConfig) {
                        var generalType = vizConfig.matchConfig['display.general.type'];
                        return _(['events', 'statistics', 'visualizations']).indexOf(generalType);
                    })
                    .map(function(vizConfig) {
                        return {value: vizConfig.id, label: vizConfig.label, icon: vizConfig.icon};
                    }).value();
                return {
                    inlinesClean: new Backbone.Collection(inlineTypes),
                    inlines: new Backbone.Collection(inlineTypes)
                };
            },
            render: function() {
                this.$main = $(_.template(this.template, {}));
                this.$main.appendTo(this.$el);
                this.children.filter.render().$el.appendTo(this.$('.header'));
                this.children.sidebar.render().$el.appendTo('body');
                this.children.sidebar.addSidebar(this.$el);
                this.focus();
                this._renderSidebarBody();
            },
            filter: function() {
                var rawFilter = this.model.sidebarState.get('filter').toLowerCase();
                var reportFilter = rawFilter ? '*' + rawFilter + '* AND ' : '';
                var panelFilter = rawFilter ? SplunkUtil.sprintf('((panel.title="*%s*") OR (panel.description="*%s*") OR (eai.data="*%s*"))', rawFilter, rawFilter, rawFilter) : '';
                var dashboardFilter = rawFilter ? SplunkUtil.sprintf('((label="*%s*") OR (eai:data="*%s*")) AND ', rawFilter, rawFilter) : '';

                this.collection.panels.fetchData.set({
                    count: this.collection.panels.original_count,
                    search: panelFilter
                });
                this.collection.dashboards.fetchData.set({
                    count: this.collection.dashboards.original_count,
                    search: dashboardFilter + 'eai:type="views" AND (eai:data="*<dashboard*" OR eai:data="*<form*")'
                });
                this.collection.reports.fetchData.set({
                    count: this.collection.reports.original_count,
                    search: reportFilter + 'is_visible=1 AND disabled=0'
                });
                this.collection.inlines.reset(this.collection.inlinesClean.filter(function(inlineModel) {
                    return (inlineModel.get('label').toLowerCase().indexOf(rawFilter) != -1);
                }));
                // inline data changes are not obtained from fetchData so we need to manually trigger 'reset' to invoke updateInlineView()
                this.collection.inlines.trigger('reset');
            },
            _renderSidebarBody: function() {
                var $panelContents = this.$('.panel-contents');
                this.children.inlinelist.render().$el.appendTo($panelContents);
                this.children.reportlist.render().$el.appendTo($panelContents);
                this.children.dashboardlist.render().$el.appendTo($panelContents);
                this.children.panellist.render().$el.appendTo($panelContents);
            },
            _removePreview: function() {
                if (this.children.preview) {
                    this.stopListening(this.children.preview);
                    this.children.preview.remove();
                    this.children.preview = null;
                }
            },
            _showPreview: function(View, options) {
                this._removePreview();
                this.children.preview = new View(options);
                this.listenTo(this.children.preview, 'addToDashboard', this._addToDashboard);
                var $preview = this.children.preview.render().$el;
                if (this.children.sidebar.contents.length > 1) {
                    this.children.sidebar.replaceLastSidebar($preview);
                }
                else {
                    this.children.sidebar.addSidebar($preview);
                }
            },
            _previewDashboardPanel: function(parsedPanel) {
                this._showPreview(DashboardPanelPreview, {
                    model: _.extend({}, {
                        parsedPanel: parsedPanel
                    }, this.model),
                    collection: this.collection,
                    deferreds: this.deferreds
                });
            },
            _previewInline: function(inlineModel) {
                this._showPreview(InlinePreview, {
                    model: _.extend({}, {
                        inline: inlineModel
                    }, this.model),
                    collection: this.collection,
                    deferreds: this.deferreds
                });
            },
            _previewPrebuiltPanel: function(prebuiltPanelModel) {
                this._showPreview(PrebuiltPanelPreview, {
                    model: _.extend({}, {
                        panel: prebuiltPanelModel
                    }, this.model),
                    collection: this.collection,
                    deferreds: this.deferreds
                });
            },
            _previewReport: function(reportModel) {
                this._showPreview(ReportPreview, {
                    model: _.extend({}, {
                        report: reportModel
                    }, this.model),
                    collection: this.collection,
                    deferreds: this.deferreds
                });
            },
            _addToDashboard: function(event) {
                // send models back to controller
                this.model.controller.trigger(event.type, event.payload);
                this.children.sidebar.popSidebar();
            },
            _clearPreviewState: function(e) {
                this._removePreview();
            },
            focus: function() {
                // focus on currently selected item else on search filter
                var $selectedElem = this.$el.find('.selected');
                if ($selectedElem.size() > 0) {
                    $selectedElem.find('a').focus();
                } else {
                    this.children.filter.focus();
                }
            },
            template: '\
            <div class="header">\
                <h3><%- _("Add Panel").t() %></h3>\
            </div>\
            <div class="panel-contents">\
            </div>\
            '
        });
    });