define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('splunkjs/mvc');
    var Backbone = require('backbone');
    var DashboardParser = require('../parser');
    var DashboardFactory = require('../factory');
    var SharedModels = require('../../sharedmodels');
    var SplunkdUtils = require('util/splunkd_utils');
    var PanelModel = require('models/services/data/ui/Panel');
    var BasePanel = require('./basepanel');
    var Messages = require('../../messages');
    var sprintf = require('splunk.util').sprintf;
    var utils = require('../../utils');
    var DashboardPanelEditor = require('./paneleditor');
    var TextDialog = require('views/shared/dialogs/TextDialog');

    var RefPanelEditor = DashboardPanelEditor.extend({
        className: 'ref-panel-editor',
        initialize: function(options) {
            DashboardPanelEditor.prototype.initialize.call(this, _.extend({
                popdownLabel: _('Prebuilt Panel').t()
            }, options));
            this.listenTo(this.model.state, 'change', this.render);
        },
        getActions: function() {
            return [
                { className: this.canConvert() ? 'convert-panel' : 'disabled', label: _("Convert to Inline Panel").t(), tooltip: this.convertTooltip },
                { className: 'delete-panel', label: _("Delete").t() }
            ];
        },
        canConvert: function() {
            var canConvert = DashboardPanelEditor.prototype.canConvert.apply(this, arguments);
            if (canConvert) {
                var state = this.model.state.toJSON();
                canConvert = state.ready && state.loaded && !state.error;
            }
            return canConvert;
        }
    });
    
    var PanelRef = BasePanel.extend({
        initialize: function() {
            BasePanel.prototype.initialize.apply(this, arguments);
            if (!this.model.panel) {
                this.model.panel = new PanelModel();
            }
            this.model.state = new Backbone.Model({
                loaded: this.model.panel.isNew(),
                ready: false,
                error: false
            });
        },
        load: function(panelName, app, options) {
            this.model.state.set({ loaded: false, error: false, ready: false });
            // Set panel model attributes for persistence in case of an error
            this.model.panel.entry.set('name', panelName);
            this.model.panel.entry.acl.set('app', app);
            this.renderMessage({
                icon: "info-circle", 
                level: "info", 
                message: _("Loading panel...").t()
            });
            var appModel = SharedModels.get('app');
            app || (app = appModel.get('app'));
            var panelRendered = $.Deferred();
            var that = this;
            this.model.panel.fetch({
                url: SplunkdUtils.fullpath(this.model.panel.url + "/" + encodeURIComponent(panelName), {
                    app: app,
                    owner: appModel.get("owner")
                }),
                success: function() {
                    that.parsePanel(options)
                        .then(_.bind(that.removeMessage, that))
                        .then(_.bind(panelRendered.resolve, panelRendered))
                        .fail(_.bind(panelRendered.reject, panelRendered));
                },
                error: function(model, xhr){
                    var errorMsg = xhr.status === 404 ?
                        sprintf(_("Dashboard panel \"%s\" not found.").t(), _.escape(panelName)) :
                        sprintf(_("Error loading dashboard panel \"%s\".").t(), _.escape(panelName));
                    that.onLoadError(errorMsg, panelName, app);
                    panelRendered.reject();
                }
            });
            
            return panelRendered.promise();
        },
        clearPanel: function(){
            this.fieldset.removeChildren();
            this.removeChildren();
        },
        parsePanel: function(options) {
            options || (options = {});
            var state = this.model.state;
            state.set({ loaded: true, error: false, ready: false });
            var panelXml = this.model.panel.entry.content.get('eai:data');
            try {
                var parser = DashboardParser.getDefault();
                var parserResult = parser.parsePanel(panelXml);
                if (options.clear !== false) {
                    this.clearPanel();
                }
                options.idPrefix = this.id + '_';
                return DashboardFactory.getDefault().materializeExisting(this, parserResult, options).done(function() {
                    state.set('ready', true);
                });
            } catch (e) {
                this.onParserError(e);
                return $.Deferred().reject(e);
            }
        },
        applySettings: function(settings){
            // Called by the factory once all child elements are added
            this.settings.set(settings);
            this.onEditStateChange();
        },
        onLoadError: function(msg, panelName) {
            this.model.state.set('error', true);
            this.renderError(msg);
        },
        onParserError: function() {
            this.model.state.set('error', true);
            this.renderError(_("Error parsing prebuilt dashboard panel.").t());
        },
        renderError: function(msg){
            this.renderMessage({
                icon: "warning-sign",
                level: "error",
                message: msg
            });
        },
        renderMessage: function(msg) {
            this.removeMessage();
            var ct = $('<div class="dashboard-element panel-message"></div>');
            var ctInner = $('<div class="panel-body"></div>').appendTo(ct);
            Messages.render(msg, ctInner);
            this.$panel().append(ct);
        },
        removeMessage: function(){
            this.$panel().children('.panel-message').remove();
        },
        addChild: function(child) {
            this.removeMessage();
            if (child && child.settings) {
                child.settings.set('editable', false);
            }
            BasePanel.prototype.addChild.apply(this, arguments);
        },
        createFieldset: function(options) {
            return BasePanel.prototype.createFieldset.call(this, _.extend({ editable: false }, options));
        },
        serializeStructure: function(options) {
            options || (options = {});
            if (options.flatten && this.model.state.get('loaded')) {
                // Serialize the panel structure as if it was inline when creating the flattened dashboard structure
                return BasePanel.prototype.serializeStructure.call(this, options);
            }
            return {
                ref: this.model.panel.entry.get('name'),
                app: this.model.panel.entry.acl.get('app'),
                tokenDependencies: this.settings.get('tokenDependencies', { tokens: true }),
                id: this.settings.get('originalId'),
                inputs: [],
                elements: []
            };
        },
        createPanelEditor: function(){
            this.removePanelEditor();
            var hasChildWithBaseSearch = this.hasChildWithBaseSearch();
            return new RefPanelEditor({
                model: { state: this.model.state },
                canConvert: !hasChildWithBaseSearch,
                convertTooltip: hasChildWithBaseSearch ? _('Unable to convert to inline panel due to dependency on base search.').t() : null
            });
        },
        createTitleEditor: function(){
            // Don't create a title editor but make sure the empty title element is present
            this.createPanelTitle(this.settings.get('title'));
        },
        onPanelConverted: function() {
            this.model.state.set({ loaded: true, ready: true, error: false });
            BasePanel.prototype.onPanelConverted.apply(this, arguments);
        },
        convertPanel: function(e) {
            e.preventDefault();
            var panel = this;
            TextDialog.confirm(_("Conversion to an inline panel lets you edit and customize the panel on this dashboard.").t(), {
                id: 'modal_convert_to_inline',
                title: _("Convert to Inline Panel").t(),
                primaryButtonLabel: _("Convert").t(),
                primaryAction: function() {
                    var curStructure = BasePanel.prototype.serializeStructure.call(panel);
                    var elementNodes = panel.model.panel.getElementNodes();
                    var inputNodes = panel.model.panel.getInputNodes();
                    if (curStructure.elements.length !== elementNodes.length || curStructure.inputs.length !== inputNodes.length) {
                        throw new Error('Error converting to inline panel - unable to obtain correct structure information.');
                    }
                    var itemMap = _.object(curStructure.elements, elementNodes);
                    var inputMap = _.object(curStructure.inputs, inputNodes);
                    
                    panel.convertPanelTo('panel').then(function(newPanel){
                        var dashboardView = mvc.Components.get('dashboard');
                        dashboardView.updateDashboardStructure({
                            itemMap: itemMap,
                            inputMap: inputMap
                        });
                        newPanel.$el.trigger('resetDragAndDrop');
                    });
                } 
            });
        }
    });

    return PanelRef;
});