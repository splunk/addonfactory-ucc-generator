define([
    'underscore',
    'jquery',
    'backbone',
    'controllers/Base',
    'views/dashboard/DashboardPage',
    'util/console',
    'uri/route',
    'controllers/dashboard/ViewModeController',
    'controllers/dashboard/EditSourceModeController',
    'controllers/dashboard/helpers/ActionHelper',
    'dashboard/ExtensionLoader',
    'dashboard/state/DashboardState',
    'util/readonly',
    'util/splunkd_utils',
    'util/env',
    'util/sprintf'
], function(_,
            $,
            Backbone,
            BaseController,
            DashboardPageView,
            console,
            route,
            ViewModeController,
            EditSourceModeController,
            ActionHelper,
            ExtensionLoader,
            DashboardState,
            ReadOnlyUtil,
            SplunkdUtils,
            env,
            sprintf) {
    return BaseController.extend({
        initialize: function(options) {
            if (env.DEBUG) {
                window._mainController = this;
            }
            BaseController.prototype.initialize.apply(this, arguments);
            _.extend(this.model, {
                controller: new Backbone.Model()
            });
            _.extend(this.collection, {
                dashboardMessages: new Backbone.Collection()
            });

            this.state = new DashboardState();

            this.readOnlyModel = {
                state: ReadOnlyUtil.readOnlyModel(this.model.state),
                controller: ReadOnlyUtil.readOnlyModel(this.model.controller)
            };

            this.extensionLoader = new ExtensionLoader({
                model: {
                    application: this.model.application
                },
                collection: {
                    appLocals: this.collection.appLocals
                }
            });

            this.listenTo(this.model.state, 'change:mode', this.handleModeChange);
            this.listenTo(this.model.controller, 'all', this.handleControllerEvent);
            this.deferreds = options.deferreds;
            this.removePreload = _.once(this.removePreload);
            this.initState = _.once(this.initState);
        },
        handleControllerEvent: function(event, data) {
            console.debug(sprintf('Handling controller event %(event)s', {
                event: event
            }));
            var args = Array.prototype.slice.call(arguments, 1);
            var eventParts = event.split(':');
            var eventGroup = eventParts[0];

            switch (eventGroup) {
                case 'mode':
                    this.handleModeChangeEvent(eventParts[1]);
                    return;
                case 'state':
                    if(this.handleStateEvent(eventParts[1], data)) {
                        return;
                    }
                    break;
                case 'edit':
                    if (this.handleEditEvent(event, data)) {
                        return;
                    }
            }

            switch (event) {
                case 'action:save':
                    this.saveState().then(function() {
                        this.handleModeChangeEvent('view');
                    }.bind(this));
                    return;
                case 'action:edit-cancel':
                    this.revertState().then(function() {
                        this.handleModeChangeEvent('view');
                    }.bind(this));
                    return;
                case 'action:save-as':
                    ActionHelper.saveAs(this.state.getDashboardXML({updateState: true}), this.model, this.collection, this.deferreds).then(function(model) {
                        this.tearDownController();
                        this.model.view.setFromSplunkD(model.toSplunkD());
                        this.state.reset();
                        this.state.setXML(model.entry.content.get('eai:data'));
                        this.state.commitXML();
                        this.handleModeChange();
                    }.bind(this));
                    return;
                case 'action:hideFilters':
                    this.model.page.set('hideFilters', true);
                    return;
                case 'action:showFilters':
                    this.model.page.set('hideFilters', false);
                    return;
            }

            if (this.controller) {
                if (!this.controller.handleControllerEvent(event, data)) {
                    console.warn('Unhandled controller event', event, data);
                }
            }
        },
        handleModeChangeEvent: function(newMode) {
            switch (newMode) {
                case 'edit':
                    this.model.state.set('mode', 'edit');
                    break;
                case 'editxml':
                    this.model.state.set('mode', 'editxml');
                    break;
                case 'source':
                    this.model.state.set('mode', 'source');
                    break;
                case 'view':
                    this.model.state.set('mode', 'view');
                    break;
            }
        },
        handleStateEvent: function(eventPart, data) {
            switch(eventPart) {
                case 'globalFieldsetChildren':
                    // globalFieldsetEmpty should NOT be set by URL param, that is
                    // why it does not have a default in DashboardDisplayProps.js
                    this.model.page.set('globalFieldsetEmpty', data.isEmpty);
                    return true;
                default:
                    console.error('Unknown state event %o', eventPart);
                    return false;
            }
        },
        handleEditEvent: function(event, data) {
            switch (event) {
                case 'edit:xml':
                    this.state.setXML(data.xml);
                    break;
                default:
                    return false;
            }

            return true;
        },
        handleModeChange: function() {
            // init state model
            this.initState();
            // bootstrap the dashboard structure first
            this.bootstrapDashboardPage().then(this._handleModeChange.bind(this));
        },
        _handleModeChange: function() {
            var newMode = this.model.state.get('mode');
            if (newMode) {
                // todo state machine to intelligently transition between modes
                switch (newMode) {
                    case 'view':
                        this.switchToController(ViewModeController);
                        this.model.page.set({
                            showToolbar: false
                        });
                        this.controller.enter(newMode).then(this.removePreload.bind(this));
                        break;
                    case 'edit':
                        this.model.page.set({
                            showToolbar: true
                        });
                        this.switchToController(ViewModeController);
                        this.controller.enter(newMode).then(this.removePreload.bind(this));
                        break;
                    case 'editxml':
                        this.model.page.set({
                            showToolbar: true
                        });
                        this.switchToController(EditSourceModeController);
                        this.controller.enter(newMode).then(this.removePreload.bind(this));
                        break;
                    case "source":
                        this.model.page.set({
                            showToolbar: false
                        });
                        this.switchToController(EditSourceModeController);
                        this.controller.enter(newMode).then(this.removePreload.bind(this));
                        break;
                }
            }
        },
        tearDownController: function() {
            if (this.controller) {
                this.controller.tearDown();
                this.controller = null;
            }
        },
        switchToController: function(Controller) {
            if (!(this.controller instanceof Controller)) {
                this.tearDownController();
                this.controller = new Controller({
                    model: _.extend({}, this.model, this.readOnlyModel),
                    collection: _.extend({}, this.collection, this.readOnlyCollection),
                    deferreds: _.extend({}, this.deferreds),
                    state: this.state,
                    extensionLoader: this.extensionLoader
                });
            }
            return this.controller;
        },
        bootstrapDashboardPage: function() {
            if (this.deferreds.pageViewRendered.state() !== 'resolved') {
                this.pageView = new DashboardPageView({
                    el: document.body,
                    model: {
                        application: this.model.application,
                        appNav: this.model.appNav,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        config: this.model.config,
                        tour: this.model.tour,
                        userPref: this.model.userPref,
                        page: this.model.page,
                        state: this.readOnlyModel.state,
                        controller: this.readOnlyModel.controller,
                        url: this.model.url,
                        reportDefaults: this.model.reportDefaults,
                        userPrefGeneralDefault: this.model.userPrefGeneralDefault,
                        scheduledView: this.model.scheduledView
                    },
                    collection: {
                        apps: this.collection.appLocals,
                        tours: this.collection.tours,
                        managers: this.collection.managers
                    },
                    deferreds: {
                        tour: this.deferreds.tour,
                        scheduledView: this.deferreds.scheduledView,
                        reportDefaults: this.deferreds.reportDefaults
                    }
                });
                this.pageView.render();
                this.deferreds.pageViewRendered.resolve();
            }
            return this.deferreds.pageViewRendered;
        },
        removePreload: function() {
            this.model.page.set({
                loading: false
            });
            $('body>.preload').remove();
        },
        initState: function() {
            // set initial value
            var xml = this.model.view.entry.content.get('eai:data');

            this.state.setXML(xml);
            this.state.commitXML();
            this.listenTo(this.state, 'dirty clean', this.updateDirtyState);
            this.listenTo(this.state.xml, 'dirty clean', this.updateDirtyState);
            this.state.commit();
        },
        updateDirtyState: function() {
            this.model.state.set({
                dirty: this.state.isDirty() || this.state.xml.isDirty()
            });
        },
        saveState: function() {
            console.info('SAVING STATE');
            this.collection.dashboardMessages.remove('save-server-error');
            var newXML = this.state.getDashboardXML();
            this.model.view.entry.content.set('eai:data', newXML);
            return this.model.view.save()
                .then(function() {
                    this.state.commitAll();
                }.bind(this))
                .fail(function(response) {
                    var errorMessage = _(SplunkdUtils.xhrErrorResponseParser(response)).where({type: 'error'})[0];
                    this.collection.dashboardMessages.add({
                        id: 'save-server-error',
                        level: 'error',
                        dismissable: true,
                        text: errorMessage ? errorMessage.message : _('Server error').t()
                    });
                }.bind(this));
        },
        revertState: function() {
            if (this.state.isDirty() || this.state.xml.isDirty()) {
                this.tearDownController();
            }
            // revert xml state with the value from savedState
            this.state.restoreAll();
            return $.Deferred().resolve();
        }
    });
});
