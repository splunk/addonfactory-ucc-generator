define([
    'module',
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'splunkjs/mvc/tokenawaremodel',
    'views/dashboard/Base',
    'views/dashboard/element/Config'
], function(module,
            $,
            _,
            Backbone,
            mvc,
            TokenAwareModel,
            BaseDashboardView,
            ElementConfig) {

    var DashboardElementBody = BaseDashboardView.extend({
        moduleId: module.id,
        viewOptions: {
            register: false
        },
        className: 'panel-body',
        initialize: function(options) {
            BaseDashboardView.prototype.initialize.apply(this, arguments);
            this.model = _.extend({}, options.model);
            this.deferreds = _.extend({}, options.deferreds);
            this.createVisualization = _.debounce(this.createVisualization);
            this.listenTo(this.model.report.entry.content, 'change:dashboard.element.viz.type', this.createVisualization);
        },
        createVisualization: function() {
            this.deferreds.reportReady.then(function() {
                this.removeViz();
                var vizType = this.model.report.entry.content.get('dashboard.element.viz.type');
                var vizCreatedDfd = this.deferreds.vizCreated;
                var vizConfig = ElementConfig[vizType];
                var Visualization = vizConfig.getView();
                this.applyManagerDefault(vizConfig);
                var options = _.defaults({
                    managerid: this.settings.get('managerid'),
                    reportModel: this.model.report.entry.content,
                    normalizeSettings: false,
                    el: $('<div />').appendTo(this.$el),
                    resizable: true,
                    saveOnApply: true,
                    saveOnResize: true,
                    enableEditingReportProperty: 'dashboard.element.edit',
                    refreshDisplayReportProperty: 'dashboard.element.refresh.display'
                }, Visualization.prototype.options);
                var viz = new Visualization(options);
                viz.render();

                this.viz = viz;
                this.listenTo(this.viz, 'all', this.trigger);
                this.trigger('create:visualization', this.viz);

                vizCreatedDfd.resolve(viz);
            }.bind(this));
        },
        applyManagerDefault: function(vizConfig) {
            // set default settings on search manager
            if (vizConfig.managerDefaults && this.settings.get('managerid')) {
                var manager = mvc.Components.get(this.settings.get('managerid'));
                manager.settings.set(vizConfig.managerDefaults);
            }
        },
        removeViz: function() {
            if (this.viz) {
                this.stopListening(this.viz);
                this.viz.remove();
                this.viz = null;
            }
        },
        remove: function() {
            this.removeViz();
            BaseDashboardView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            this.createVisualization();
            return this;
        }
    });

    return DashboardElementBody;
});

