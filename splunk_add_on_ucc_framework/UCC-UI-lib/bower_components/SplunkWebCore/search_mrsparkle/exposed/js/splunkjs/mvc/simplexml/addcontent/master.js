define(function(require, definition, module) {
    var BaseView = require('views/Base');
    var controller = require('../controller');
    var _ = require('underscore');
    var $ = require('jquery');
    var utils = require('../../utils');
    var ReportContent = require('./reportcontent');
    var SideBar = require('views/shared/Sidebar');
    var PanelList = require('./panellist/master');
    var DashboardList = require('./dashboardlist/master');
    var InlineList = require('./inlinelist/master');
    var ReportList = require('./reportlist/master');
    var sharedModels = require('../../sharedmodels');
    var accordionGroupTemplate = require('contrib/text!./accordionGroupTemplate.html');
    var PanelContentPreview = require('./panelcontentpreview');
    var DashboardContentPreview = require('./dashboardcontentpreview');
    var InlineContentPreview = require('./inlinecontentpreview');
    var PanelRef = require('../dashboard/panelref');
    var mvc = require('../../mvc');
    var DashboardFactory = require('../factory');
    var VisualizationRegistry = require('helpers/VisualizationRegistry');
    var backbone = require('backbone');
    var SplunkUtil = require('splunk.util');
    var TextControlView = require('views/shared/controls/TextControl');
    var AddContentUtils = require('./addcontentutils');
    require('bootstrap.collapse');

    return BaseView.extend({
        moduleId: module.id,
        className: "add-content-master",
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            
            this.model = this.model || {};
            this.model.application = sharedModels.get('app');
            this.model.appLocal = sharedModels.get('appLocal');
            this.model.state = new backbone.Model();
            this.model.user = sharedModels.get('user');

            // tracks state of sidebar's panels that can be toggled
            this.initializePanelStates();
            this.currentFilter = '';
            
            this.collection = this.collection || {};
            this.collection.roles = sharedModels.get('roles');
            this.collection.panels = sharedModels.get('panels');
            this.listenTo(this.collection.panels, 'reset', this.updatePanelView);
            this.collection.dashboards = sharedModels.get('dashboards');
            this.listenTo(this.collection.dashboards, 'reset', this.updateDashboardView);
            this.collection.reports = sharedModels.get('reports');
            this.listenTo(this.collection.reports, 'reset', this.updateReportView);
            // Grab all visualizations from the registry, sort them so that event types are on top -
            // followed by statistics then visualizations - then pare them down to a simple data structure
            // to be consumed by child views.
            var inlineTypes = _(VisualizationRegistry.getAllVisualizations()).chain()
                .where({ isSelectable: true })
                .sortBy(function(vizConfig) {
                    var generalType = vizConfig.matchConfig['display.general.type'];
                    return _(['events', 'statistics', 'visualizations']).indexOf(generalType);
                })
                .map(function(vizConfig) {
                    return { value: vizConfig.id, label: vizConfig.label, icon: vizConfig.icon };
                }).value();
            this.collection.inlinesClean = new backbone.Collection(inlineTypes);
            this.collection.inlines = new backbone.Collection(inlineTypes);
            this.listenTo(this.collection.inlines, 'reset', this.updateInlineView);

            this.children.sidebar = new SideBar();
            this.listenTo(this.children.sidebar, 'sidebarsRemoved', this.clearPreviewState);
            this.listenTo(this.children.sidebar, 'accordionToggleClicked', this.toggleAccordion);

            this.children.filter = new TextControlView({
                placeholder: _('find...').t(),
                updateOnKeyUp: true,
                canClear: true,
                model: this.model.state,
                modelAttribute: 'filter'
            });
            this.listenTo(this.children.filter, 'clearSearchFilter', this.clearSidebarBody);
            this.listenTo(this.model.state, 'change:filter', this.filter);

            this.children.dashboardlist = new DashboardList({
                collection: this.collection.dashboards,
                model: {
                    highlightSelectedModel: this.model.state
                }
            });
            this.listenTo(this.children.dashboardlist, 'previewPanel', this.previewDashboardPanel);

            this.children.panellist = new PanelList({
                collection: this.collection.panels,
                model: {
                    highlightSelectedModel: this.model.state
                }
            });
            this.listenTo(this.children.panellist, 'panelSelected', this.previewPrebuiltPanel);

            this.children.inlinelist = new InlineList({
                collection: this.collection.inlines,
                model: {
                    highlightSelectedModel: this.model.state
                }
            });
            this.listenTo(this.children.inlinelist, 'previewPanel', this.previewInlinePanel);

            this.children.reportlist = new ReportList({
                collection: this.collection.reports,
                model: {
                    highlightSelectedModel: this.model.state
                }
            });
            this.listenTo(this.children.reportlist, 'previewPanel', this.previewReportPanel);

            this.previewState = null; //report, dashboardpanel, inline, panel
        },
        render: function() {
            this.$main = $(_.template(this.template, {}));
            this.$main.appendTo(this.$el);
            this.children.filter.render().$el.appendTo(this.$('.header'));
            this.children.sidebar.render().$el.appendTo('body');
            this.children.sidebar.addSidebar(this.$el);
            this.focus();
            this.renderSidebarBody();
        },
        clearSidebarBody: function() {
            this.$('.panel-contents').children().remove();
            this.renderSidebarBody();
            this.initializePanelStates();
        },
        renderSidebarBody: function() {
            var $panelContents = this.$('.panel-contents');
            _.each([
                {title: _('New').t(), id: 'inlinelist', show: false},
                {title: _('New from Report').t(), id: 'reportlist', show: false},
                {title: _('Clone from Dashboard').t(), id: 'dashboardlist', show: false},
                {title: _('Add Prebuilt Panel').t(), id: 'panellist', show: false}
            ], function(ag) {
                var $ag = $(_.template(accordionGroupTemplate, ag));
                if (this.children && this.children[ag.id]) {
                    $ag.find('.accordion-inner').append(this.children[ag.id].render().$el);
                }
                $panelContents.append($ag);
            }, this);

            this.updateAllCounts();
            return this;
        },
        expandSidebarToggleBlock: function(id) {
            if (this.isPanelInitialized[id]) {
                this.updateSidebarToggleBlock(id);
            } else {
                this.isPanelInitialized[id] = true;
            }
        },
        updateSidebarToggleBlock: function(id) {
            var countMap = {
                '#inlinelist': this.getInlineCount(),
                '#reportlist': this.getReportCount(),
                '#dashboardlist': this.getDashboardCount(),
                '#panellist': this.getPanelCount()
            };
            if(countMap[id] > 0) {
                this.$el.find(id).addClass('in');
                this.$el.find(id).parent().find('.accordion-toggle').removeClass('collapsed');
                this.$el.find(id).css('height', 'auto');
            } else if (countMap[id] === 0) {
                this.$el.find(id).removeClass('in');
                this.$el.find(id).parent().find('.accordion-toggle').addClass('collapsed');
                this.$el.find(id).css('height', '0px');
            }
        },
        initializePanelStates: function() {
            this.isPanelInitialized = {
                '#inlinelist': false,
                '#reportlist': false,
                '#panellist': false,
                '#dashboardlist': false
            };
        },
        updateInlineView: function() {
            var id = '#inlinelist';
            this.updateInlineCount();
            this.expandSidebarToggleBlock(id);
        },
        updateReportView: function() {
            var id = '#reportlist';
            this.updateReportCount();
            this.expandSidebarToggleBlock(id);            
        },
        updateDashboardView: function() {
            var id = '#dashboardlist';
            this.updateDashboardCount();
            this.expandSidebarToggleBlock(id);            
        },
        updatePanelView: function() {
            var id = '#panellist';
            this.updatePanelCount();
            this.expandSidebarToggleBlock(id);
        },
        updateInlineCount: function() {
            var total = this.getInlineCount();
            this.$('[href=#inlinelist] .total').remove();
            if (total != undefined) {
                this.$('[href=#inlinelist]').append($('<span class="total"/>').text(' (' + total + ')'));
            }
        },
        updateReportCount: function() {
            var total = this.getReportCount();
            this.$('[href=#reportlist] .total').remove();
            if (total != undefined) {
                this.$('[href=#reportlist]').append($('<span class="total"/>').text(' (' + total + ')'));
            }
        },
        updateDashboardCount: function() {
            var total = this.getDashboardCount();
            this.$('[href=#dashboardlist] .total').remove();
            if (total != undefined) {
                this.$('[href=#dashboardlist]').append($('<span class="total"/>').text(' (' + total + ')'));
            }
        },
        updatePanelCount: function() {
            var total = this.getPanelCount();
            this.$('[href=#panellist] .total').remove();
            if (total != undefined) {
                this.$('[href=#panellist]').append($('<span class="total"/>').text(' (' + total + ')'));
            }
        },
        getInlineCount: function() {
            return this.collection.inlines.length;
        },
        getReportCount: function() {
            return this.collection.reports.paging.get('total');
        },
        getDashboardCount: function() {
            return this.collection.dashboards.paging.get('total');
        },
        getPanelCount: function() {
            return this.collection.panels.paging.get('total');
        },
        updateAllCounts: function() {
            this.updateInlineCount();
            this.updateReportCount();
            this.updateDashboardCount();
            this.updatePanelCount();
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
        toggleAccordion: function(evt) {
            /*
            * code to prevent toggling of sidebar's four major panel blocks if any of them is empty and toggle 
            * request is fired for them.
            * This prevents accordion-collapse state from becoming inconsistent and not allowing further toggle
            * as was the case previously
            * Also refer to changes in filter()
            */
            var id = $(evt.currentTarget).parent().parent().find('.collapse').attr('id');
            var idCountMap = {
                'inlinelist': this.getInlineCount(),
                'reportlist': this.getReportCount(),
                'dashboardlist': this.getDashboardCount(),
                'panellist': this.getPanelCount()
            };

            if(idCountMap[id] < 1) {
                evt.stopPropagation();
                evt.preventDefault();
                $(evt.currentTarget).addClass('collapsed');
                $(evt.currentTarget).parent().parent().find('.collapse').removeClass('in');
            }
        },
        filter: function() {
            var rawFilter = this.model.state.get('filter').toLowerCase();
            if (this.currentFilter === rawFilter) {
                return;
            } else {
                this.currentFilter = rawFilter;
            }
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

            if(rawFilter === "") {
                this.clearSidebarBody();
                return;
            }
        },
        removePreview: function() {
            if (this.children.reportContent) {
                this.stopListening(this.children.reportContent, 'addToDashboard');
                this.children.reportContent.remove();
                this.children.reportContent = null;
            }
            if (this.children.panelPreview) {
                this.stopListening(this.children.panelPreview, 'addToDashboard');
                this.children.panelPreview.remove();
                this.children.panelPreview = null;
            }
        },
        previewReportPanel: function(report, e) {
            this.removePreview();
            this.children.reportContent = new ReportContent({
                model: {
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    report: report,
                    serverInfo: sharedModels.get('serverInfo')
                },
                collection: this.collection,
                $target: $(e.target)
            });
            this.children.reportContent.render();
            this.preview('report', this.children.reportContent.$el);
            this.listenTo(this.children.reportContent, 'addToDashboard', this.panelAdded);
            this.children.reportContent.focus();
        },
        previewPrebuiltPanel: function(panel) {
            this.removePreview();
            this.children.panelPreview = new PanelContentPreview({model: panel});
            this.children.panelPreview.render();
            this.listenTo(this.children.panelPreview, 'addToDashboard', this.addPanelContent);
            this.preview('panel', this.children.panelPreview.$el);
            this.children.panelPreview.focus();
        },
        addPanelContent: function(model) {
            var row = mvc.Components.get('dashboard').createNewRow();

            var panel = new PanelRef({
                model: {
                    panel: model
                }
            });

            // Render new panel to screen
            panel.render().$el.appendTo(row.getChildContainer());
            // Parse XML and render the result into this component
            panel.parsePanel({ waitForReady: true })
                .then(function(){
                    // Let dashboard view know to store the changed dashboard structure
                    panel.$el.trigger('structureChange');
                    // Reset drag and drop to make the new panel draggable and
                    // insert new drop rows accordingly
                    panel.$el.trigger('resetDragAndDrop');
                    AddContentUtils.highlightPanel(panel.$el);
                })
                .fail(function(){
                    // error msg?
                    panel.remove();
                });
            this.scrollTo(row.$el);
            this.panelAdded();
        },
        previewDashboardPanel: function(panel) {
            this.removePreview();
            this.children.panelPreview = new DashboardContentPreview({ panel: panel });
            this.children.panelPreview.render();
            this.listenTo(this.children.panelPreview, 'addToDashboard', this.addDashboardContent);
            this.preview('dashboard', this.children.panelPreview.$el);
            this.children.panelPreview.focus();
        },
        addDashboardContent: function(panel) {
            var row = mvc.Components.get('dashboard').createNewRow();
            var factory = DashboardFactory.getDefault();
            factory.materialize(panel, row.getChildContainer(), { waitForReady: true, loadPanels: true })
                .then(function(panel){
                    // Let dashboard view know to store the changed dashboard structure
                    panel.$el.trigger('structureChange');
                    // Reset drag and drop to make the new panel draggable and
                    // insert new drop rows accordingly
                    panel.$el.trigger('resetDragAndDrop');
                    AddContentUtils.highlightPanel(panel.$el);
                })
                .fail(function(){
                    // error msg?
                    panel.remove();
                });
            this.scrollTo(row.$el);
            this.panelAdded();
        },
        previewInlinePanel: function(model) {
            this.removePreview();

            this.children.panelPreview = new InlineContentPreview({
                model: {
                    report: model.panel,
                    timeRange: model.timeRange,
                    state: controller.getStateModel(),
                    application: sharedModels.get('app'),
                    appLocal: sharedModels.get('appLocal'),
                    user: sharedModels.get('user')
                },
                collection: {
                    timesCollection: sharedModels.get('times')
                }
            });
            this.children.panelPreview.render();
            this.preview('inline', this.children.panelPreview.$el);
            this.children.panelPreview.focus();
            this.listenTo(this.children.panelPreview, 'addToDashboard', this.panelAdded);
        },
        scrollTo: function($el) {
            var $body = $('html,body');
            $body.animate({
                scrollTop: $el.offset().top
            });
        },
        preview: function (state, $el) {
            if (this.previewState != null) {
               this.children.sidebar.replaceLastSidebar($el);
            } else {
                this.children.sidebar.addSidebar($el);
            }
            this.previewState = state;
        },
        clearPreviewState: function (removedSidebarsCount) {
            if(this.previewState){
                this.previewState = null;
                this.focus();
                if (removedSidebarsCount > 1) {
                    // handles edge case when 2 sidebars are closed and search filter is not reset giving inconsistent state when add panel sidebar is rendered again due to previous search parameters
                    this.resetSearchFilter();
                }
            }
            else {
                this.resetSearchFilter();
            }
        },
        resetSearchFilter: function() {
            this.model.state.set('filter', '');
            this.clearSidebarBody();
        },
        panelAdded: function() {
            this.children.sidebar.popSidebar();
        },
        template: '' +
            '<div class="header"><h3>' +
                    _('Add Panel').t() +
            '</h3></div>' +
            '<div class="panel-contents">' +
            '</div>'
    });
});
