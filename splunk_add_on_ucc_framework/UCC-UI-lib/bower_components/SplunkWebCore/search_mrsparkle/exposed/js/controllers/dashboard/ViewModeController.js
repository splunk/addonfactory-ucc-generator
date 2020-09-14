define([
    'module',
    'underscore',
    'jquery',
    'backbone',
    'controllers/Base',
    'models/Base',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/controller',
    'dashboard/DashboardParser',
    'dashboard/DashboardFactory',
    'dashboard/manager/FormManager',
    'dashboard/DashboardRefresher',
    'dashboard/EnvironmentTokenModel',
    'controllers/dashboard/helpers/ActionHelper',
    'controllers/dashboard/helpers/EditingHelper',
    'views/dashboard/layout/row_column/RowColumnLayout',
    'views/dashboard/layout/row_column/Row',
    'views/dashboard/form/Input',
    'views/dashboard/element/DashboardElement',
    'views/dashboard/element/Html',
    'views/dashboard/layout/Panel',
    'views/dashboard/layout/PanelRef',
    'views/dashboard/Master',
    'views/dashboard/LoadingStatus',
    'views/dashboard/ErrorStatus',
    'util/console',
    'util/xml',
    'util/Profiler'
], function(module,
            _,
            $,
            Backbone,
            BaseController,
            BaseModel,
            mvc,
            LegacyController,
            DashboardParser,
            DashboardFactory,
            FormManager,
            DashboardRefresher,
            EnvironmentTokenModel,
            ActionHelper,
            EditingHelper,
            RowColumnLayout,
            Row,
            Input,
            DashboardElement,
            HtmlElement,
            Panel,
            PanelRef,
            Dashboard,
            LoadingStatus,
            ErrorStatus,
            console,
            XML,
            Profiler) {

    return BaseController.extend({
        initialize: function(options) {
            BaseController.prototype.initialize.apply(this, arguments);
            this.model = _.extend({
                // In-flight state of dashboard renderer, ie. where we want to get to
                renderState: new BaseModel(),
                // Committed state of the dashboard renderer, ie. this is where we are
                committedState: new BaseModel()
            }, this.model);
            this.deferreds = options.deferreds;

            this.state = options.state;

            this.componentRegistry = mvc.Components;
            this.dashboardParser = DashboardParser.getDefault();
            this.dashboardFactory = DashboardFactory.getDefault();

            this.scripts = [];
            this.stylesheets = [];
            this.managers = [];
            this.components = [];
            this.layouts = [];
            this.events = [];
            this.refreshInterval = null;

            this.extensionLoader = options.extensionLoader;

            this.listenTo(this.extensionLoader, 'all', this.checkAddExtensionWarnings);
            this.checkAddExtensionWarnings();
            this.setupProfiler();
        },
        setupProfiler: function() {
            this.profiler = Profiler.get('Dashboard', {dashboard_name: this.model.view.entry.get('name')}).module(module.id);
            Profiler.isEnabled() && this.profiler.profileFunctions(this,
                'parseDashboardXML',
                'captureComponents',
                'captureState',
                'tearDown');
        },
        checkAddExtensionWarnings: function() {
            if (this.extensionLoader.hasExtensionScript()) {
                if (!this.collection.dashboardMessages.get('warn-script-ext')) {
                    this.collection.dashboardMessages.add(new BaseModel({
                        id: 'warn-script-ext',
                        mode: 'edit',
                        level: 'warning',
                        text: _('Warning: Custom scripts included on this page may cause unexpected behavior.').t(),
                        linkText: _('Learn more about custom scripts').t(),
                        docsLink: 'learnmore.dashboards.extensions.scripts',
                        dismissable: true
                    }));
                }
            }
        },
        handleControllerEvent: function(event, data) {
            var eventParts = event.split(':');
            var eventGroup = eventParts[0];
            switch (eventGroup) {
                case 'action':
                    return ActionHelper.handleAction.call(this, event, this.state, this.model, this.collection, this.deferreds);
                case 'edit':
                    return this.handleEditEvent(event, data);
                case 'new':
                    return this.handleNewEvent(event, data);
                default:
                    console.error('Unknown event %o', event);
            }
        },
        handleEditEvent: function(event, data) {
            if (this.model.state.get('mode') != 'edit') {
                return;
            }
            var dashboard, element, fieldset, panel, input, manager;
            var layout = _.first(this.layouts);
            switch (event) {
                // edit events
                case 'edit:make-prebuilt-panel':
                    var panelModel = data.panelModel;
                    EditingHelper.convertToPrebuiltPanel(data.panelComponent, panelModel, data.panelProperties, {
                        model: this.model,
                        deferreds: this.deferreds,
                        state: this.state
                    }).done(function() {
                        this.state.updateLayout(layout.captureStructure());
                    }.bind(this));
                    return true;

                case 'edit:make-inline-panel':
                    var currentPanel = data.panelComponent;
                    EditingHelper.convertToInlinePanel(currentPanel, {
                        model: this.model,
                        deferreds: this.deferreds
                    }).then(function(inlinePanel, managers, components, events, stateObjects) {
                        _(stateObjects).each(this.state.addStateObject.bind(this.state));
                        this.state.updateLayout(layout.captureStructure());
                    }.bind(this));
                    return true;

                case 'edit:save-inline-as-report':
                case 'edit:search':
                    manager = this.componentRegistry.get(data.managerId);
                    this.state.updateSearch(data.managerId, manager);
                    return true;
                case 'edit:update-report-id':
                case 'edit:save-report-as-inline':
                    manager = this.componentRegistry.get(data.managerId);
                    element = this.componentRegistry.get(data.elementId);
                    this.state.updateSearch(data.managerId, manager);
                    this.state.updateElement(data.elementId, element);
                    return true;
                case 'edit:use-report-formatting':
                    element = this.componentRegistry.get(data.elementId);
                    this.state.updateElement(data.elementId, element);
                    return true;

                case 'edit:dashboard':
                    dashboard = this.componentRegistry.get(data.dashboardId);
                    if (dashboard) {
                        this.state.updateDashboard(dashboard);
                    } else {
                        console.warn('Unable to update dashboard state, dashboard id=%o not found', data.dashboardId);
                    }
                    return true;
                case 'edit:fieldset':
                    fieldset = this.componentRegistry.get(data.fieldsetId);
                    if (fieldset) {
                        this.state.updateFieldset(fieldset);
                    } else {
                        console.warn('Unable to update fieldset state, fieldset id=%o not found', data.fieldsetId);
                    }
                    return true;
                case 'edit:element':
                    element = this.componentRegistry.get(data.elementId);
                    if (element) {
                        this.state.updateElement(data.elementId, element);
                    } else {
                        console.warn('Unable to update element state, element id=%o not found', data.elementId);
                    }
                    return true;

                case 'edit:panel':
                    panel = this.componentRegistry.get(data.panelId);
                    if (panel) {
                        this.state.updatePanel(data.panelId, panel);
                        if (layout) {
                            this.state.updateLayout(layout.captureStructure());
                        }
                    } else {
                        console.warn('Unable to update panel state, panel id=%o not found', data.panelId);
                    }
                    return true;

                case 'edit:input':
                    input = this.componentRegistry.get(data.inputId);
                    if (input) {
                        this.state.updateInput(data.inputId, input);
                        var managerId = input.settings.get('managerid');
                        if (managerId) {
                            manager = this.componentRegistry.get(managerId);
                            if (this.state.searches.has(managerId)) {
                                this.state.updateSearch(managerId, manager);
                            } else {
                                this.state.addSearch(managerId, manager);
                            }
                        } else {
                            // TODO remove search if we had a managerid previously
                        }
                    } else {
                        console.warn('Unable to update input state, input id=%o not found', data.inputId);
                    }
                    return true;

                case 'edit:layout':
                    this.state.updateLayout(layout.captureStructure());
                    return true;

                case 'edit:delete-element':
                    element = this.componentRegistry.get(data.elementId);
                    element && (element.remove());
                    this.state.removeElement(data.elementId);
                    this.state.updateLayout(layout.captureStructure());
                    layout.$el.trigger('resetDragAndDrop');
                    layout.$el.trigger('elementRemoved');
                    return true;

                case 'edit:delete-panel':
                    panel = this.componentRegistry.get(data.panelId);
                    panel && (panel.remove());
                    this.state.removePanel(data.panelId);
                    this.state.updateLayout(layout.captureStructure());
                    layout.$el.trigger('resetDragAndDrop');
                    layout.$el.trigger('elementRemoved');
                    return true;

                case 'edit:delete-input':
                    input = this.componentRegistry.get(data.inputId);
                    input && (input.remove());
                    this.state.removeInput(data.inputId);
                    this.state.updateLayout(layout.captureStructure());
                    layout.$el.trigger('inputRemoved');
                    return true;

            }
        },
        handleNewEvent: function(event, data) {
            if (this.model.state.get('mode') != 'edit') {
                return;
            }
            var layout = _.first(this.layouts);
            var fieldset;
            // new events
            switch (event) {
                case 'new:element-inline':
                case 'new:element-report':
                case 'new:element-refpanel':
                case 'new:element-panel':
                    this.dashboardFactory.materialize(data, null, {
                        model: this.model,
                        collection: this.collection,
                        deferreds: this.deferreds,
                        loadPanels: true,
                        createStateObjects: true
                    }).then(function(panel, managers, components, events, stateObjects) {
                        layout.addChild(panel);
                        layout.$el.trigger('elementCreated');
                        _(stateObjects).each(this.state.addStateObject.bind(this.state));
                        this.captureComponents(components, managers, events);
                        this.state.updateLayout(layout.captureStructure());
                    }.bind(this));
                    return true;

                case 'new:submit-button':
                    fieldset = layout.getFieldset();
                    if (fieldset) {
                        fieldset.settings.set('submitButton', true);
                    }
                    this.state.updateFieldset(fieldset);
                    return true;
                case 'new:input':
                    // get default settings from parser
                    this.dashboardFactory.materialize(data, null, {
                        model: this.model,
                        deferreds: this.deferreds,
                        createStateObjects: true
                    }).then(function(input, managers, components, events, stateObjects) {
                        layout.addChild(input);
                        layout.$el.trigger('inputCreated');
                        _(stateObjects).each(this.state.addStateObject.bind(this.state));
                        this.captureComponents(components, managers, events);
                        this.state.updateLayout(layout.captureStructure());
                    }.bind(this));
                    return true;
                case 'new:fieldset':
                    fieldset = this.componentRegistry.get(data.fieldsetId);
                    this.state.updateFieldset(fieldset);
                    return true;

            }
        },

        enter: function(mode) {
            console.debug('Entering', mode, 'mode');
            this.unbindDashboardRenderer();
            this.bindDashboardRenderer();
            this.createEnvironmentTokenModel();
            FormManager.bootstrapTokenModels();
            return !this.model.renderState.get('structure') ? this.parseDashboardXML() : $.Deferred().resolve();
        },
        tearDown: function() {
            console.debug('Tearing down view-mode controller');
            this.hideLoadingStatus();
            this.hideErrorStatus();
            DashboardRefresher.teardown();
            this.tearDownDashboardBody();
            this.removeEnvironmentTokenModel();
            this.stopListening();
            this.resetStateModel();
        },
        unbindDashboardRenderer: function() {
            this.stopListening(this.model.state);
            this.stopListening(this.model.renderState);
        },
        bindDashboardRenderer: function() {
            this.model.renderState.set({
                xml: this.state.getDashboardXML()
            });
            this.listenTo(this.model.renderState, 'change:xml', this.parseDashboardXML);
            this.listenTo(this.model.renderState, 'change:structure', _.debounce(this.applyDashboardStructure));
        },
        createEnvironmentTokenModel: function() {
            if (!this.componentRegistry.has('env')) {
                this.componentRegistry.registerInstance('env', EnvironmentTokenModel.createEnvironmentTokenModel({
                    model: {
                        application: this.model.application,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user,
                        view: this.model.view
                    },
                    deferreds: {
                        serverInfo: this.deferreds.serverInfo,
                        user: this.deferreds.user,
                        view: this.deferreds.view
                    }
                }));
            }
        },
        removeEnvironmentTokenModel: function() {
            var curModel = this.componentRegistry.get('env');
            if (curModel && curModel instanceof EnvironmentTokenModel) {
                curModel.stopListening();
                this.componentRegistry.revokeInstance('env');
            }
        },
        parseDashboardXML: function() {
            try {
                var newXml = this.model.renderState.get('xml');
                if (newXml && newXml != this.model.committedState.get('xml')) {
                    this.showLoadingStatus();
                    console.debug('Parsing dashboard XML', {xml: newXml});
                    this.model.committedState.set('xml', newXml);
                    this.model.renderState.set('structure', this.dashboardParser.parseDashboard(newXml, {retainRawXML: true}));
                } else {
                    console.debug('XML did not change');
                }
                return $.Deferred().resolve();
            } catch (e) {
                console.error('Error parsing XML', e);
                this.showErrorStatus(_("Error parsing dashboard XML: ").t() + e.message);
                return $.Deferred().resolve();
            }
        },
        readyForDashboardBody: function() {
            return $.when(this.deferreds.pageViewRendered, this.deferreds.times);
        },
        applyDashboardStructure: function() {
            var timer = this.profiler.newTimer();
            if (this.readyForDashboardBody().state() !== 'resolved' && !this._applyPending) {
                this._applyPending = true;
                $.when(this.readyForDashboardBody()).then(this.applyDashboardStructure.bind(this));
                return;
            }
            if (this.renderPromise && this.renderPromise.state() !== 'resolved' && !this._applyPending) {
                this._applyPending = true;
                $.when(this.renderPromise).then(this.applyDashboardStructure.bind(this));
                return;
            }
            this._applyPending = false;
            this.showLoadingStatus();
            var renderPromise = this.renderPromise = $.Deferred();
            var newStructure = this.model.renderState.get('structure');

            if (!_.isEmpty(newStructure.settings.script)) {
                this.scripts = this.scripts.concat(newStructure.settings.script);
            }
            if (!_.isEmpty(newStructure.settings.stylesheet)) {
                this.stylesheets = this.stylesheets.concat(newStructure.settings.stylesheet);
            }
            newStructure.settings.refresh && (this.refreshInterval = newStructure.settings.refresh);

            if (!_.isEqual(newStructure, this.model.committedState.get('structure'))) {
                this.model.page.setFromDashboardXML(newStructure.settings);
                this.deferreds.componentReady = $.Deferred();
                this.tearDownDashboardBody();
                DashboardRefresher.teardown();
                this.$dashboard = this.$dashboard || $('body>.main-section-body');
                this.dashboardFactory
                    .materialize(newStructure, this.$dashboard, {
                        waitForReady: true,
                        model: this.model,
                        collection: this.collection,
                        deferreds: this.deferreds,
                        loadPanels: true,
                        createStateObjects: true
                    })
                    .then(function(rootComponent, managers, components, events, stateObjects) {
                        this.hideLoadingStatus();
                        this.rootComponent = rootComponent;
                        var groupedComponents = this._groupComponents(components);
                        this.layouts = groupedComponents.layouts;
                        this.captureComponents(groupedComponents.components, managers, events);
                        this.model.committedState.set('structure', newStructure);
                        this.captureState(stateObjects);
                        this.profiler.log({
                            'function': 'applyDashboardStructure',
                            'duration': timer.fromNow()
                        });
                    }.bind(this))
                    .then(this.applyCustomExtension.bind(this))
                    .then(this.submitTokens.bind(this))
                    .then(this.dashboardReady.bind(this))
                    .then(this.applyAutoRefresh.bind(this))
                    .then(renderPromise.resolve);
            }
        },
        captureComponents: function(components, managers, events) {
            var args = {
                components: components,
                managers: managers,
                events: events
            };
            _.each(['components', 'managers', 'events'], function(type) {
                var existingIds = _.pluck(this[type], 'id');
                var toAdd = _.filter(args[type], function(component) {
                    return !_.contains(existingIds, component.id);
                });
                this[type] = _.union(this[type], toAdd);
            }, this);
        },
        captureState: function(stateObjects) {
            this.state.suspend();
            this.state.reset(stateObjects);
            this.state.updateLayout(this.layouts[0].captureStructure());
            this.state.commit();
            this.state.resume();
        },
        tearDownDashboardBody: function() {
            console.trace('tearDownDashboardBody()');

            _(this.events).invoke('dispose');
            _(this.components).invoke('remove');
            _(this.layouts).invoke('remove');
            _(this.managers).invoke('dispose');

            this.events = [];
            this.components = [];
            this.layouts = [];
            this.managers = [];

            if (this.$dashboard) {
                this.$dashboard.empty();
            }
        },
        resetStateModel: function() {
            // unset xml and structure except for xml state
            this.model.committedState.unset('xml');
            this.model.committedState.unset('structure');
            this.model.renderState.unset('structure');
            this.model.renderState.unset('xml');
        },
        submitTokens: function() {
            var layout = _.first(this.layouts);
            LegacyController._signalReadyByMainController({
                model: this.model,
                collection: this.collection
            });
            var autoRun = !layout.getFieldset() || layout.getFieldset().settings.get('autoRun');
            var hasSubmit = FormManager.hasSubmitButton();
            var hasUrlTokens = FormManager.hasUrlTokens();
            if (autoRun || !hasSubmit || hasUrlTokens) {
                FormManager.submitForm({replaceState: false});
            }
        },
        dashboardReady: function() {
            this.rootComponent.trigger("dashboard:init", {});
            this.deferreds.componentReady.resolve();
        },
        applyCustomExtension: function() {
            var locale = this.model.application.get('locale');
            var root = this.model.application.get('root');
            this.extensionLoader.loadDefaultExtensions(this.model.application.get('app'), locale, root);
            // load custom js/css from the app that dashboard is defined
            _.each(this.scripts, function(js) {
                this.extensionLoader.loadScriptExtension(this.model.view.entry.acl.get('app'), locale, root, js);
            }, this);
            _.each(this.stylesheets, function(css) {
                this.extensionLoader.loadStylesheetExtension(this.model.view.entry.acl.get('app'), locale, root, css);
            }, this);
        },
        applyAutoRefresh: function() {
            if (this.refreshInterval) {
                DashboardRefresher.setup(this.refreshInterval, this.managers);
            }
        },
        _groupComponents: function(components) {
            return _.groupBy(components, function(component) {
                if (component instanceof RowColumnLayout) {
                    return 'layouts';
                } else {
                    return 'components';
                }
            });
        },
        showLoadingStatus: function() {
            this.hideErrorStatus();
            var $dashboardContainer = $('body>.main-section-body');
            $dashboardContainer.addClass('dashboard-rendering');
            if (!this.children.loadingStatus) {
                this.children.loadingStatus = new LoadingStatus({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });
                this.children.loadingStatus.render().prependTo($dashboardContainer);
            }
        },

        hideLoadingStatus: function() {
            var $dashboardContainer = $('body>.main-section-body');
            $dashboardContainer.removeClass('dashboard-rendering');
            if (this.children.loadingStatus) {
                this.children.loadingStatus.remove();
                this.children.loadingStatus = null;
            }
        },

        showErrorStatus: function(message) {
            this.hideLoadingStatus();
            this.hideErrorStatus();
            var $dashboardContainer = $('body>.main-section-body');
            $dashboardContainer.addClass('dashboard-error');
            this.children.errorStatus = new ErrorStatus({
                model: this.model,
                collection: this.collection,
                deferreds: this.deferreds,
                message: message
            });
            this.children.errorStatus.render().prependTo($dashboardContainer);
        },

        hideErrorStatus: function() {
            var $dashboardContainer = $('body>.main-section-body');
            $dashboardContainer.removeClass('dashboard-error');
            if (this.children.errorStatus) {
                this.children.errorStatus.remove();
                this.children.errorStatus = null;
            }
        }
    });
});