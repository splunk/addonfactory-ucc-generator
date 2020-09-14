define([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/utils',
    './factory_config',
    'util/console'
], function(_, $, mvc, utils, FACTORY_CONTENT_TEXT, console) {

    var SEARCH_MANAGER_CONSUMER_CLASSES = {viz: true, input: true};

    var DEFAULT_OPTIONS = {
        replaceDuplicateIDs: true
    };
    
    var DashboardFactory = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(DashboardFactory.prototype, {
        initialize: function(config, options) {
            options = _.defaults(options || {}, DEFAULT_OPTIONS);
            _.bindAll(this, "_calculateSettings", "_normalizeConfig", "_updateComponentSettings", "getComponentList", "_getComponentList",
                "getComponentTypeConfig", "getModuleForType", "groupComponents", "initialize",
                "instantiateComponent", "isComponentOfClass", "isDomComponent", "materialize", "materializeComponent");
            this.config = this._normalizeConfig(config);
            this.registry = options.registry || mvc.Components;
            this.idSeq = {};
            this.replaceDuplicateIDs = options.replaceDuplicateIDs;
            this._app = options.app;
        },
        /**
         * Instantiate the full set of components defined from the parsed dashboard output
         * @param {Object} normalizedParserOutput - the parsed and normalized object
         * @param {Node} targetDomNode - target DOM node to insert the the component into
         * @param options {Object}
         * {
         *      "waitForReady": wait for all child components being ready before resolving the promise (enabled by default)
         *      "loadPanels": trigger load for panelrefs after they are materialized (disabled by default)
         *      "idPrefix": a prefix for all identifiers (id and ref) for all materialized components,
         *      "createStateObjects": true to create dashboard state instances alongside the actual components
         * }
         *
         * @returns {*} promise for instance of that component
         */
        materialize: function(normalizedParserOutput, targetDomNode, options) {
            options || (options = {});
            var parserOutput = $.extend(true, {}, normalizedParserOutput);
            var components = this.getComponentList(parserOutput, options);
            return this.materializeComponents(components, targetDomNode, options).promise();
        },
        materializeComponents: function(components, targetDomNode, options) {
            options || (options = {});
            var factory = this;
            var materializeResult = $.Deferred();
            var instantiateFn = factory.instantiateComponent;
            var materializeComponentFn = factory.materializeComponent;

            var stateObjects = null;
            if (options.createStateObjects) {
                stateObjects = [];
                instantiateFn = function(component) {
                    var instance = factory.instantiateComponent.apply(factory, arguments);
                    if (component.state) {
                        stateObjects.push(factory.createStateObject(component, instance));
                    }
                    return instance;
                };
                materializeComponentFn = function(component) {
                    var instance = factory.materializeComponent.apply(factory, arguments);
                    if (component.state) {
                        stateObjects.push(factory.createStateObject(component, instance));
                    }
                    return instance;
                };
            }

            var groupedComponents = factory.groupComponents(components);
            // Instantiate search managers first
            var managers = _(groupedComponents.managers || []).map(instantiateFn);
            // Materialize other components
            var materializedComponents = _(groupedComponents.others || [])
                .map(_.partial(materializeComponentFn, _, targetDomNode, options));
            // Instantiate event handlers
            var events = _(groupedComponents.events || []).map(instantiateFn);
            if (options.waitForReady !== false) {
                $.when.apply($, _.map(materializedComponents, DashboardFactory.whenComponentReady)).then(function() {
                    materializeResult.resolve(materializedComponents[0], managers, materializedComponents, events, stateObjects);
                }, function() {
                    materializeResult.reject();
                });
            } else {
                materializeResult.resolve(materializedComponents[0], managers, materializedComponents, events, stateObjects);
            }
            return materializeResult.promise();
        },
        createStateObject: function(component, instance) {
            var StateClass = component.state.getModule();
            return new StateClass(instance, component.rawXML, {
                id: component.id,
                autoId: component.autoId
            });
        },
        materializeExisting: function(existingComponent, parserResult, options) {
            options || (options = {});
            parserResult = $.extend(true, {}, parserResult);
            parserResult.id = existingComponent.id;
            parserResult.omit = true;
            var components = this.getComponentList(parserResult, options);
            var root = components[0];

            var rootDomNode = _.result(existingComponent, 'getChildContainer');
            var materializeResult = $.Deferred();
            // Materialize all child components
            this.materializeComponents(components, rootDomNode, options).done(function(r, managers, components, events) {
                // Update existing components' settings once children are materialized
                if (_.isFunction(existingComponent.applySettings)) {
                    existingComponent.applySettings(root.settings);
                } else if (existingComponent.settings) {
                    existingComponent.settings.set(root.settings);
                }
                materializeResult.resolve(existingComponent, managers, components, events);
            }).fail(materializeResult.reject);
            return materializeResult.promise();
        },
        /**
         * Instantiates a single component (no children) from the configuration after normalizing settings
         * @param component
         * @param options
         * @return the component instnance
         */
        instantiate: function(component, options) {
            this._normalizeComponentConfig(component, null, null, options);
            return this.instantiateComponent(component);
        },
        /**
         * Creates an instance of the given component
         * @param component the component definition
         * @returns {*} component instance
         */
        instantiateComponent: function(component) {
            var ComponentType = this.getModuleForType(component.type);
            var settings = _.defaults({id: component.id}, component.settings);
            var settingsOptions = _.extend({}, component.settingsOptions);
            if (component.reportContent) {
                settings.reportContent = component.reportContent;
            }
            console.debug('Instantiating component', component.type, 'with settings', settings, settingsOptions);
            return new ComponentType(settings, settingsOptions);
        },
        /**
         * Creates instance of the given component definition and renders it into the given DOM node
         * @param {Object} component - a definition of an individual component
         * @param {Object} rootDomNode
         * @param {Object} options
         * @returns {*} instance of that component
         */
        materializeComponent: function(component, rootDomNode, options) {
            options || (options = {});
            var parent, instance;
            if (!component.omit) {
                instance = this.instantiateComponent(component);

                if (this.isDomComponent(component)) {
                    if (component.parent) {
                        parent = this.registry.get(component.parent);
                        console.debug('Attaching component to parent', component.parent, parent);
                        if (parent) {
                            DashboardFactory.addChildToContainer(instance, parent);
                        }
                    } else if (rootDomNode) {
                        instance.render().$el.appendTo(rootDomNode);
                    }
                    else if (options.renderRoot) {
                        instance.render();
                    }
                    if (options.loadPanels === true && component.type === "panelref") {
                        instance.load(component.settings.ref, component.settings.app || this._app);
                    }
                }
            }
            return instance;
        },
        isDomComponent: function(component) {
            return this.getComponentTypeConfig(component).dom === true;
        },
        isSearchManagerConsumer: function(component) {
            return !!SEARCH_MANAGER_CONSUMER_CLASSES[this.getComponentTypeConfig(component)['class']];
        },
        isComponentOfClass: function(component, cls) {
            return this.getComponentTypeConfig(component)['class'] == cls;
        },
        getComponentTypeConfig: function(component) {
            var typeSettings = this.config.typeMap[component.type];
            if (!typeSettings) {
                throw new Error('No factory settings for component type ' + JSON.stringify(component.type));
            }
            return typeSettings;
        },
        getTypeConfigByClass: function(cls) {
            return _(this.config.typeMap).chain()
                .values()
                .filter(function(component) {
                    return component['class'] === cls;
                })
                .value();
        },
        /**
         * Creates a flat list of components and replaces the children list with a list of IDs of the child components
         * @param parserOutput result of the dashboard parser/normalizer
         * @param options - options object
         * @returns {Array} of components
         */
        getComponentList: function(parserOutput, options) {
            options || (options = {});
            var predefinedIds = [];
            var globalSearchId = null;
            var factory = this;
            this._walk(function(component) {
                if (component.id) {
                    predefinedIds.push(component.id);
                }
                if (factory.isComponentOfClass(component, 'manager') && (component.id == 'global')) {
                    globalSearchId = component.id;
                }
                factory._generateEmptyManager(component, globalSearchId);
            }, parserOutput);

            return this._getComponentList(parserOutput, null, _.extend({}, options, {
                predefinedIDs: _.extend(predefinedIds, options.predefinedIDs),
                globalSearchId: globalSearchId
            }));
        },
        _generateEmptyManager: function(component, globalSearchId) {
            // generate empty inline search for elements which have no managers defined
            var factory = this;
            var manager = _(component.children).chain().find(function(child) {
                return factory.isComponentOfClass(child, 'manager');
            }, this).value();

            if (!manager && factory.isComponentOfClass(component, 'viz') && !globalSearchId) {
                component.children.push({
                    "type": "inline-search",
                    "settings": {
                        "query": ""
                    }
                });
            }
        },
        _getComponentList: function(parserOutput, parent, options) {
            var result = [];
            if (parserOutput == null) {
                return result;
            }

            var component = _.omit(parserOutput, 'children', 'leaf');
            this._normalizeComponentConfig(component, parserOutput.children, parent, options);
            if (options.createStateObjects) {
                this._updateStateObjectProps(component, options);
            }
            if (parserOutput.type) {
                result.push(component);
            }

            if (parserOutput.children && parserOutput.children.length) {
                if (parserOutput.leaf) {
                    component.children = [].concat(parserOutput.children);
                } else {
                    var subComponents = _(parserOutput.children).chain()
                        .each(function(child) {
                            child.parent = component.id;
                        })
                        .map(_.partial(this._getComponentList, _, component, options))
                        .flatten()
                        .value();
                    if (subComponents.length) {
                        result = result.concat.apply(result, subComponents);
                        component.children = _(parserOutput.children).pluck('id');
                    }
                }
            }

            return result;
        },

        _normalizeComponentConfig: function(component, children, parent, options) {
            this._normalizeIdentifier(component, options);
            this._updateComponentSettings(component, children, parent, options);
            this._updateComponentSettingsOptions(component, children, parent);
        },
        
        /**
         * Group the given component list into categories of components (managers and others)
         * @param componentList
         * @returns {*} object containing the categories as keys and arrays of component as values
         */
        groupComponents: function(componentList) {
            var factory = this;
            return _(componentList).groupBy(function(component) {
                if (factory.isComponentOfClass(component, "manager")) {
                    return 'managers';
                } else if (factory.isComponentOfClass(component, "event")) {
                    return 'events';
                }
                else {
                    return 'others';
                }
            });
        },
        _updateStateObjectProps: function(component, options) {
            var componentTypeConfig = this.getComponentTypeConfig(component);
            if (componentTypeConfig.state) {
                component.state = componentTypeConfig.state;
            }
        },
        _updateComponentSettings: function(component, children, parent, options) {
            var componentTypeConfig = this.getComponentTypeConfig(component);
            var settingsToCreate = componentTypeConfig.settingsToCreate || {};
            var defaultSettings = componentTypeConfig.defaultSettings || {};
            var calculatedSettings = this._calculateSettings(component, children, parent, options);
            component.settings = _.extend({}, defaultSettings, component.settings || {}, settingsToCreate, calculatedSettings);

            if (componentTypeConfig.reportContent) {
                component.reportContent = _.extend(component.reportContent || {}, componentTypeConfig.reportContent);
            }

            if (componentTypeConfig.renameSettings) {
                _(componentTypeConfig.renameSettings).each(function(newName, oldName) {
                    if (component.settings.hasOwnProperty(oldName) && !component.settings.hasOwnProperty(newName)) {
                        component.settings[newName] = component.settings[oldName];
                        delete component.settings[oldName];
                    }
                });
            }
            component.settingsOptions = _.extend({}, componentTypeConfig.settingsOptions, component.settingsOptions);

            return component;
        },
        _calculateSettings: function(component, children, parent, options) {
            var calculatedSettings = {};
            options = options || {};
            // set the component model and collection if specified in options
            options.model && (calculatedSettings.model = options.model);
            options.collection && (calculatedSettings.collection = options.collection);
            // set the deferreds if specified in options
            options.deferreds && (calculatedSettings.deferreds = options.deferreds);
            if (this.isSearchManagerConsumer(component)) {
                // if this is a viz grab the first manager child for the managerid
                var manager = _(children).chain().find(function(child) {
                    return this.isComponentOfClass(child, 'manager');
                }, this).value();
                if (manager) {
                    calculatedSettings['managerid'] = this._normalizeIdentifier(manager, options);
                }
                // fallback to global search if specified for viz element
                else if (options.globalSearchId && this.isComponentOfClass(component, 'viz')) {
                    calculatedSettings['managerid'] = options.globalSearchId;
                }
            }

            if (this.isComponentOfClass(component, 'manager')) {
                calculatedSettings['app'] = this._app;
                if (options && options.idPrefix && component.settings.base) {
                    calculatedSettings.base = options.idPrefix + component.settings.base;
                }
            }

            if (this.isComponentOfClass(component, 'event') && parent) {
                if (this.isComponentOfClass(parent, 'manager')) {
                    calculatedSettings['managerid'] = parent.id;
                } else {
                    calculatedSettings['viewid'] = parent.id;
                }
            }

            if (this.isComponentOfClass(component, 'input')) {
                if (component.type === 'time-input') {
                    calculatedSettings['earliest_time'] = component.settings.token ? '$form.' + component.settings.token + '.earliest$' : '$earliest$';
                    calculatedSettings['latest_time'] = component.settings.token ? '$form.' + component.settings.token + '.latest$' : '$latest$';
                } else if (component.settings.token) {
                    calculatedSettings['value'] = '$form.' + component.settings.token + '$';
                }
            }

            return calculatedSettings;
        },
        _updateComponentSettingsOptions: function(component, children, parent) {
            if (this.isComponentOfClass(component, "manager")) {
                if (parent && this.isComponentOfClass(parent, "input")) {
                    // Search managers of inputs are bound to the default token namespace
                    component.settingsOptions.tokenNamespace = "default";
                } else {
                    // Search managers of elements around bound to the submitted token namespace
                    component.settingsOptions.tokenNamespace = "submitted";
                }
            }
            return component;
        },
        _walk: function(callback, root) {
            // bfs walk through all the components
            var queue = [];
            root && queue.push(root);
            var component = queue.shift();
            while (component) {
                callback(component);
                Array.prototype.push.apply(queue, component.children);
                component = queue.shift();
            }
        },
        _normalizeIdentifier: function(component, options) {
            if (component.omit) {
                return;
            }
            var existingIDs = this.registry.toJSON();
            var generatedBlacklist = _.extend({}, existingIDs);
            if (options && options.predefinedIDs) {
                _(options.predefinedIDs).each(function(id) {
                    generatedBlacklist[id] = true;
                });
            }
            var idPrefix = options && options.idPrefix || '';
            if (!component.id) {
                var config = this.getComponentTypeConfig(component);
                if (config.autoId) {
                    var id;
                    var prefix = config.autoId;
                    var seq = this.idSeq[prefix];
                    if (seq == null) {
                        seq = 1;
                    }
                    do {
                        id = idPrefix + prefix + (seq++);
                    } while (generatedBlacklist[id]);
                    this.idSeq[prefix] = seq;
                    component.id = id;
                    component.autoId = true;
                }
            }

            if (component.id.indexOf(idPrefix) !== 0) {
                component.id = idPrefix + component.id;
            }

            var replaceDuplicateIDs = 'replaceDuplicateIDs' in options ? options.replaceDuplicateIDs : this.replaceDuplicateIDs;
            if (replaceDuplicateIDs && existingIDs[component.id]) {
                delete component.id;
                return this._normalizeIdentifier(component, options);
            }
            return component.id;
        },
        /**
         * Find the require path for a component type
         * @param {String} type of component
         * @returns {String} path of required asset
         */
        getModuleForType: function(type) {
            var typeConfig = this.config.typeMap[type];
            if (!typeConfig) {
                throw new Error('Unknown component type ' + JSON.stringify(type));
            }
            return typeConfig.getModule();
        },
        _normalizeConfig: function(config) {
            var flatConfig = {typeMap: {}};

            _(config['typeMap']).each(function(value, key, obj) {
                var cls = {};
                if (value['class']) {
                    cls = config['classes'][value['class']];
                }
                flatConfig['typeMap'][key] = $.extend(true, {}, cls, value);
            });
            return flatConfig;
        }
    });

    var defaultInstance;
    // Class methods
    _.extend(DashboardFactory, {
        /**
         * Returns a shared instance of a dashboard factory using the default configuration
         * @returns {*} dashboardFactory
         */
        getDefault: function() {
            return defaultInstance || (defaultInstance = DashboardFactory.createDefault());
        },
        /**
         * Creates an instance of a dashboard factory using the default configuration
         * @returns {*} dashboardFactory
         */
        createDefault: function() {
            return new DashboardFactory(DashboardFactory.getDefaultConfig(), {app: utils.getCurrentApp()});
        },
        resetDefault: function() {
            defaultInstance = null;
        },
        /**
         * Returns the parsed json of the default configuration
         * @returns {Object} the default dashboard factory configuration
         */
        getDefaultConfig: _.once(function() {
            return FACTORY_CONTENT_TEXT;
        }),

        getDashboardPanels: function(dashboardParserResult) {
            if (dashboardParserResult.type !== 'dashboard') {
                throw new Error('Expected root type to be a dashboard');
            }
            var panels = [];
            DashboardFactory.prototype._walk(function(node) {
                if (node.type === "panel" || node.type === "panelref") {
                    panels.push(node);
                }
            }, dashboardParserResult);
            return panels;
        },

        addChildToContainer: function(child, container) {
            if (typeof container.getChildContainer == 'function') {
                var el = container.getChildContainer();
                child.render().$el.appendTo(el);
            } else if (typeof container.addChild == 'function') {
                container.addChild(child);
            } else {
                console.warn("Can't add child to container - no addChild or getChildContainer method found",
                    child, container);
            }
        },

        /**
         * Returns a promise for when the component is ready. This uses the components "componentReady" property, which
         * may be a promise itself or a method returning a promise.
         *
         * @param component
         * @returns {*} promise for when the component is ready
         */
        whenComponentReady: function(component) {
            return _.result(component, 'componentReady') || $.Deferred().resolve();
        }
    });

    return DashboardFactory;

});