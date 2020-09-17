/**
 * @author sfishel
 *
 * The master view for the pivot interface.
 */

define([
            'jquery',
            'underscore',
            'backbone',
            'module',
            'models/Base',
            'models/search/Job',
            'models/pivot/PivotReport',
            'models/pivot/datatable/PivotableDataTable',
            'collections/shared/FlashMessages',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/pivot/VisualizationTypeMenu',
            'views/pivot/DocumentActionBar',
            'views/pivot/VisualizationConfigMenu',
            'views/pivot/PivotContent',
            'views/pivot/JobActionBar',
            'views/shared/FlashMessages',
            'helpers/FlashMessagesHelper',
            'helpers/pivot/PivotVisualizationManager',
            './PivotView.pcss',
            './PivotEditorForms.pcss'
        ],
        function(
            $,
            _,
            Backbone,
            module,
            BaseModel,
            Job,
            PivotReport,
            PivotableDataTable,
            FlashMessagesCollection,
            DeclarativeDependencies,
            Base,
            VisualizationTypeMenu,
            DocumentActionBar,
            VisualizationConfigMenu,
            PivotContent,
            JobActionBar,
            FlashMessagesView,
            FlashMessagesHelper,
            pivotVizManager,
            css,
            cssEditorForms
        ) {

    var PivotView = Base.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         application: <models/shared/Application> the application state model
         *         report: <models/pivot/PivotReport> the pivot report
         *         dataModel: <models/services/datamodel/DataModel> the data model being reported on
         *         searchJob: <models/pivot/PivotJob> the current pivot job
         *         appLocal <models.services.AppLocal> the local splunk app
         *         user <models.services/admin.User> the current user
         *         pivotSearch <models.pivot.PivotSearch> the current pivot query
         *     }
         *     collection: {
         *         dataModels <collections/services/datamodel/DataModels> the list of available data models
         *         timePresets <collections/services/data/ui/Times> the user-specific preset time preferences
         *     }
         *     flashMessages: <views.shared.FlashMessages> a messages view with upstream models/collections already registered
         * }
         */

        initialize: function(options) {
            Base.prototype.initialize.call(this, options);

            this.vizConfigMenuOffset = 0;
            var dataTableHasIndexTime = this.model.dataTable.hasIndexTimeField(),
                vizMenuItems = _(pivotVizManager.schema).map(function(vizConfigObject) {
                    var item = _(vizConfigObject).pick('id', 'icon', 'label');
                    if(!dataTableHasIndexTime && vizConfigObject.requiresIndexTime) {
                        item.disabled = true;
                    }
                    return item;
                });
            this.children.vizTypeMenu = new VisualizationTypeMenu({
                apiResources: this.apiResources.vizTypeMenu,
                items: vizMenuItems
            });
            this.children.docStatusBar = new DocumentActionBar({
                apiResources: this.apiResources.docStatusBar
            });
            this.children.jobStatusBar = new JobActionBar({
                apiResources: this.apiResources.jobStatusBar
            });

            var debouncedUpdateInitializingMessgae = _.bind(_.debounce(this.updateInitializingMessage, 100), this);
            this.model.searchJob.on('change:id', function() {
                if(!this.model.searchJob.isNew()) {
                    this.hideInitializingMessage();
                }
                debouncedUpdateInitializingMessgae();
            }, this);

        },

        render: function() {
            this.$el.html(this.compiledTemplate({}));
            this.children.vizTypeMenu.render().replaceAll(this.$('.viz-type-menu-placeholder'));
            this.children.docStatusBar.render().replaceAll(this.$('.doc-status-bar-placeholder'));
            this.children.jobStatusBar.render().replaceAll(this.$('.job-status-bar-placeholder'));
            this.showVizConfigMenu = this.model.report.entry.content.get('display.general.type') !== 'statistics';
            if(this.showVizConfigMenu) {
                this.initVizConfigMenu();
                this.children.vizConfigMenu.render().appendTo(this.$('.viz-builder-wrapper'));
            }
            this.initVizContent();
            this.children.vizContent.render().appendTo(this.$('.viz-builder-wrapper'));
            this.updateInitializingMessage();
            return this;
        },

        renderContainer: function(options) {
            options = options || {};
            this.showVizConfigMenu = this.model.report.entry.content.get('display.general.type') !== 'statistics';
            if(this.showVizConfigMenu) {
                this.initVizConfigMenu();
                this.children.vizConfigMenu.render().appendTo(this.$('.viz-builder-wrapper'));
                if(options.disabled) {
                    this.children.vizConfigMenu.disable();
                }
            }
            else {
                this.removeVizConfigMenu();
            }
            this.initVizContent();
            this.children.vizContent.appendTo(this.$('.viz-builder-wrapper'));
            this.children.vizContent.renderContainer();
            if(options.disabled) {
                this.children.vizContent.disable();
            }
        },

        renderData: function() {
            if(this.children.vizContent) {
                this.children.vizContent.renderData();
                this.children.vizContent.updateData();
            }
            this.children.jobStatusBar.render();
        },

        clearData: function() {
            // SPL-74219, kind of a hacky fix but the safest one...
            // before we empty out the job status bar view, detach its children to avoid un-binding their listeners
            _(this.children.jobStatusBar.children).invoke('detach');
            this.children.jobStatusBar.$el.empty();
            if(this.children.vizContent) {
                this.children.vizContent.clearData();
            }
        },

        renderErrors: function(flashMessages) {
            this.clearData();
            if(flashMessages) {
                flashMessages.appendTo(this.children.jobStatusBar.el);
            }
        },

        updateInitializingMessage: function() {
            if(this.model.searchJob.isNew()) {
                this.showInitializingMessage();
            }
            else {
                this.hideInitializingMessage();
            }
        },

        showInitializingMessage: function() {
            this.$initializingMessage = $('<div class="initializing-message">' + _('Starting job...').t() + '</div>').prependTo(this.children.jobStatusBar.el);
            if(this.children.vizContent) {
                this.children.vizContent.renderMessage('info', _('Starting job...').t());
            }
        },

        hideInitializingMessage: function() {
            if(this.$initializingMessage) {
                this.$initializingMessage.remove();
            }
        },

        initVizConfigMenu: function() {
            this.removeVizConfigMenu();
            this.children.vizConfigMenu = new VisualizationConfigMenu({
                apiResources: this.apiResources.vizConfigMenu,
                panels: this.getCurrentVizConfig().configMenuPanels,
                scrollOffset: this.vizConfigMenuOffset
            });
        },

        removeVizConfigMenu: function() {
            if(this.children.vizConfigMenu) {
                this.vizConfigMenuOffset = this.children.vizConfigMenu.getScrollOffset();
                this.children.vizConfigMenu.remove();
                delete this.children.vizConfigMenu;
            }
        },

        initVizContent: function() {
            if(this.children.vizContent) {
                this.children.vizContent.remove();
                this.children.vizContent.off(null, null, this);
                delete this.children.vizContent;
            }
            this.children.vizContent = new PivotContent({
                apiResources: this.apiResources.vizContent,
                flashMessages: this.options.flashMessages
            });
            this.children.vizContent.$el.addClass(this.showVizConfigMenu ? 'viz-content-with-menu' : 'viz-content-full-width');
        },

        getCurrentVizConfig: function() {
            return pivotVizManager.getConfigByVizType(this.model.report.getVisualizationType());
        },

        template: '\
            <div class="doc-status-bar-placeholder"></div>\
            <div class="viz-type-menu-placeholder"></div>\
            <div class="job-status-bar-placeholder"></div>\
            <div class="viz-builder-wrapper"></div>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport,
            dataTable: PivotableDataTable,
            searchJob: Job,

            vizTypeMenu: VisualizationTypeMenu,
            docStatusBar: DocumentActionBar,
            jobStatusBar: JobActionBar,
            vizConfigMenu: VisualizationConfigMenu,
            vizContent: PivotContent
        }
    });

    return DeclarativeDependencies(PivotView);

});
