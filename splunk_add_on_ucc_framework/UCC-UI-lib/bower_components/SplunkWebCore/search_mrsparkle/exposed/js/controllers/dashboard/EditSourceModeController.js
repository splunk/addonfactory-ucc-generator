define([
    "module",
    "underscore",
    "jquery",
    'backbone',
    "ace/ace",
    'controllers/Base',
    'models/Base',
    'dashboard/DashboardParser',
    "views/dashboard/editor/XMLEditor",
    'splunk.util',
    'util/console',
    'util/Profiler'
], function(module,
            _,
            $,
            Backbone,
            ace1,
            BaseController,
            BaseModel,
            DashboardParser,
            XMLEditor,
            SplunkUtils,
            console,
            Profiler) {
    return BaseController.extend({
        initialize: function(options) {
            BaseController.prototype.initialize.apply(this, arguments);
            this.dashboardParser = DashboardParser.getDefault();
            this.deferreds = options.deferreds;
            this.model.editor = new BaseModel();
            this.state = options.state;
            this.setupProfiler();
        },
        setupProfiler: function() {
            if (Profiler.isEnabled()) {
                Profiler.get('Dashboard').module(module.id).profileFunctions(this, 'validateXML');
            }
        },
        enter: function(newMode) {
            var xml = this.state.getDashboardXML();
            this.model.editor.set('code', xml);
            this.editorView = new XMLEditor({
                model: {
                    application: this.model.application,
                    editor: this.model.editor,
                    state: this.model.state
                },
                collection: {
                    dashboardMessages: this.collection.dashboardMessages
                },
                readOnly: newMode == "source",
                autoAdjustHeight: true
            });
            if (newMode == "source") {
                this.header = $("<div/>").addClass("dashboard-header");
                $("<h2/>").text(SplunkUtils.sprintf(_("Source: %s").t(), this.model.view.entry.content.get("label"))).appendTo(this.header);
                this.header.appendTo($('body>.main-section-body'));
            }
            this.editorView.render().appendTo($('body>.main-section-body'));
            this.validateXML();
            this.listenTo(this.model.editor, 'change:code', _.debounce(this.validateAndSaveXML, 500));
            return $.Deferred().resolve();
        },

        validateAndSaveXML: function() {
            var xml = this.model.editor.get('code');
            var annotations = this.validateXML(xml);

            // TODO: Only propagate XML if we don't have errors?
            // if (_(annotations).filter(function(a) { return a.type == 'error'; }).length === 0) {}

            this.saveDashboard(xml);
        },

        validateXML: function() {
            // Potentially move to XMLEditor view or separate validation helper

            var xml = this.editorView.getEditorValue();
            var annotations = [];
            var parser = this.dashboardParser;
            var result = parser.validateDashboard(xml);
            this.model.editor.set('parseResults', result);
            this.editorView.applyAnnotations();
            return annotations;
        },

        tearDown: function() {
            //TODO validate before teardown, and interrupt the tear down if there's error or warning
            //var result = this.validateXML();
            //if (result.length){
            //    return false;
            //}
            this._tearDownEditor();
        },

        _tearDownEditor: function() {
            this.editorView.remove();
            this.$editor = null;
        },

        saveDashboard: function(xml) {
            console.log('Triggering edit:xml');
            this.model.controller.trigger("edit:xml", {xml: xml});
        }
    });
});
