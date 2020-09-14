define(function(require, exports, module) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var BaseManager = require('./basemanager');
    var BaseSplunkView = require('./basesplunkview');
    var BaseTokenModel = require('./basetokenmodel');
    var SearchModels = require('./searchmodel');
    var console = window.console;

    var indent = function(count) {
        var str = '';
        for (var i = 0; i < count; i++) { 
            str += '    '; 
        }
        return str;
    };

    var warn = function(msg) {
        return ("WARNING: " + msg);
    };

    var categoryEnum = {
        MANAGER: 'manager',
        VIEW: 'view',
        NAMESPACE: 'namespace',
        UNKNOWN: 'unknown'
    };

    var Debugger = Backbone.Model.extend(/** @lends splunkjs.mvc.Debugger.prototype */{
        ready : false,

        initialize: function() { 
            var that = this;    

            that.registry = that.get('registry');

            if (!that.registry) {
                console.log("splunk.mvc debugging interface could not find the registry");
                return;
            }

            // For now this is a command-line tool, so we put information on the command line.
            console.log("The Splunkjs debugger is running. For help, enter 'splunkjs.mvc.Debugger.help()'");
        },

        isReady: function() {
            return this.ready;
        },

        getDebugData: function() {

            var that = this;
            var components = [];

            var registeredComponentKeys = that.registry.getInstanceNames();

            _.each(registeredComponentKeys, function(elementID) {
                var registryElement = that.registry.getInstance(elementID);
                var type = that._getComponentType(registryElement);
                var category = that._getComponentCategory(registryElement);
                var validOptions = [];
                
                var elementMetaData = { 
                    'id' : elementID,
                    'category' : category,
                    'type': type,
                    'warnings': []
                };

                // Add data to views
                if (category === categoryEnum.VIEW) {
                    var managerid = null;
                    var settings = {};
                    validOptions = that._getValidViewOptions(registryElement);

                    // If the view has settings we inspect them for issues
                    // JIRA: DVPL-3316
                    if (registryElement.settings) {
                        managerid = registryElement.settings.get('managerid') || null;
                        settings = _.clone(registryElement.settings.attributes);
                        
                        _.each(_.keys(settings), function(key) {

                            // If a setting is not known to be valid we add a warning
                            if (!_.contains(validOptions, key)) {

                                // Ignore unrecognized map and chart settings
                                // JIRA: DVPL-3317
                                var partOne = key.split('.')[0];
                                if (!(partOne === 'mapping' || partOne === 'charting')) {
                                    elementMetaData.warnings.push(warn(key + " is not a recognized setting."));
                                }
                            }
                        });
                    }
                    
                    elementMetaData.managerid = managerid;
                    elementMetaData.settings = settings;
                    elementMetaData.el = registryElement.el || "no element set";
                }
                // Add data to token namespaces
                if (category === categoryEnum.NAMESPACE) {
                    elementMetaData.tokens = [];

                    // For each token in the namespace, attach the value and an empty list of 
                    // listeners that will be populated later 
                    _.each(registryElement.attributes, function(value, key) {
                        var tokenData = {
                            name: key,
                            value : value,
                            listenerIds: []
                        };
                        elementMetaData.tokens.push(tokenData);
                    });
                }    
                // Add data to managers
                if (category === categoryEnum.MANAGER) {
                    validOptions = that._getValidManagerOptions(registryElement);
                    
                    if (registryElement.attributes) {
                        var attributes = _.clone(registryElement.attributes);
                        
                        _.each(_.keys(attributes), function(key) {
                            // If a setting is not known to be valid we add a warning
                            if (!_.contains(validOptions, key)) {
                                elementMetaData.warnings.push(warn(key + " is not a recognized attribute"));
                            }
                        });
                    }
                    
                    elementMetaData.attributes = registryElement.attributes;
                    elementMetaData.query = registryElement.query;
                    elementMetaData.search = registryElement.search;
                }

                // Add token data to everything but namespaces
                if (category !== categoryEnum.NAMESPACE) {
                    elementMetaData.bindings = that._getComponentBindings(elementID);
                }
                components.push(elementMetaData);                
            });
                
            // Now that we have our elements in place, we can check connections between them
            // and look for other potential issues. First, separate componenet types for convenience.
            var managers = _.where(components, {'category' : categoryEnum.MANAGER});
            var views = _.where(components, {'category' : categoryEnum.VIEW});
            var namespaces = _.where(components, {'category' : categoryEnum.NAMESPACE});
            
            // Enumerate views bound to each manager and check for issues
            _.each(managers, function(manager) {
                // Pluck the view ids from views where managerid is this manager's id
                manager.viewIds = _.pluck(_.where(views, {'managerid': manager.id}), 'id');

                // If there are no views bound to the search, push a warning
                if (manager.viewIds.length < 1) { 
                    manager.warnings.push(warn("no views bound to search manager."));
                }
            });

            // Check for views bound to non-existent managers
            _.each(views, function(view) {
                if (view.managerid) {
                    if (!_.contains(_.pluck(managers, 'id'), view.managerid)) {
                        view.warnings.push(warn(view.managerid + " is not a registered manager."));
                    }
                }
            });

            // Find components bound to each token and attach them to token metadata
            _.each(namespaces, function(namespace) {
                _.each(namespace.tokens, function(token) {
                    // Look through views and managers and find those that watch this
                    // token's name
                    var listeners = _.filter(_.union(managers, views), function(item) {
                        return _.some(item.bindings, function(binding) {
                            if (binding && binding.observes && binding.observes.length > 0) {
                                return _.some(binding.observes, function(observes) {
                                    return (observes.namespace === namespace.id && observes.name === token.name);        
                                });
                            }
                        });
                    });

                    // Attach just the ids of the listeners
                    token.listenerIds = _.pluck(listeners, 'id');
                });
            });

            return components;
        },

        _getValidViewOptions: function(element) {
            var options = ['id', 'name', 'managerid', 'manager', 'app', 'el', 'data'];

            // Again we check this is valid.
            if (element.constructor.prototype.options) {
                options = _.union(options, _.keys(element.constructor.prototype.options));
            }
            return options;
        },

        _getValidManagerOptions: function(element) {
            var validOptions = _.union(
                ['app', 'id', 'owner', 'name', 'data'], 
                _.keys(element.constructor.prototype.defaults) || [], 
                SearchModels.SearchSettingsModel.ALLOWED_ATTRIBUTES
            );
            
            return validOptions;
        },

        _getComponentType: function(component) {
            var type = "Unknown type";
            if (component.moduleId) {
                var name = component.moduleId.split('/').pop();
                if (name.length > 0) {
                    type = name;
                }                
            }
            return type;
        },

        _getComponentCategory: function(component) {
            var category = categoryEnum.UNKNOWN;

            if (component instanceof BaseSplunkView) {
                category = categoryEnum.VIEW;
            }
            else if (component instanceof BaseManager) {
                category = categoryEnum.MANAGER;
            }
            else if (component instanceof BaseTokenModel) {
                category = categoryEnum.NAMESPACE;
            }
            return category;
        },

        _getComponentTokenBoundProperties: function(componentId) {
            var tokenBoundProperties = [];
            var bindings = this._getComponentBindings(componentId);
            tokenBoundProperties = _.keys(bindings);
            return tokenBoundProperties;
        },

        _getComponentBindings: function(componentId) {
            var component = this.registry.getInstance(componentId);
            
            var bindings = {};
            if (component && component.settings) {
                bindings = _.extend(bindings, _.clone(component.settings._bindings));
            }
            return bindings;
        },
        
        createError: function(message) {            
            return message;
        },

        printViewInfo: function() {
            var that = this;
            var views = that.getInfoForViews();

            console.log("Views:");
            _.each(views, function(view) {
                console.log(indent(1) + "ID: " + view.id);
                console.log(indent(2) + "Type: " + view.type);
                console.log(indent(2) + "Manager: " + view.managerid);
                console.log(indent(2) + "Element: ", view.el);
                console.log(indent(2) + "Settings: ");
                _.each(_.keys(view.settings), function(key) {
                    var tokenInfo = "";
                    var binding = view.bindings[key];
                    var hasTokens = binding && binding.observes && binding.observes.length > 0;
                    if (hasTokens) {
                        var template = JSON.stringify(binding.template);
                        var partiallyResolvedValue = JSON.stringify(binding.computeValue(/*_retainUnmatchedTokens=*/true));
                        tokenInfo = " [bound: " + template + ", resolved: " + partiallyResolvedValue + "]";    
                    }
                    console.log(indent(3) + key + ": " + JSON.stringify(view.settings[key]) + tokenInfo); 
                });
                if(view.warnings.length>0) {
                    console.log(indent(2) + "WARNINGS: ");
                    _.each(view.warnings, function(warning) {
                        console.log(indent(3) + warning);
                    });
                }
            });
        },

        printSearchManagerInfo: function() {
            var that = this;
            var managers = that.getInfoForManagers();

            console.log("Search Managers:");
            _.each(managers, function(manager) {
                console.log(indent(1) + "ID: " + manager.id);
                console.log(indent(2) + "Type: " + manager.type);
                if (manager.attributes) {
                    console.log(indent(2) + "Attributes: " );
                    var propertiesToSkip = SearchModels.SearchSettingsModel.ALLOWED_ATTRIBUTES;
                    
                    _.each(manager.attributes, function(value, key) {
                        if (_.contains(propertiesToSkip, key)) {
                            return;
                        }
                        console.log(indent(3) + key + ": " + JSON.stringify(value)); 
                    });
                }
                if (manager.settings && manager.settings.attributes) {
                    console.log(indent(2) + "Search Properties: " );
                    _.each(manager.settings.attributes, function(value, key) {
                        var tokenInfo = "";
                        var binding = manager.bindings[key];
                        var hasTokens = binding && binding.observes && binding.observes.length > 0;
                        if (hasTokens) {
                            var template = JSON.stringify(binding.template);
                            var partiallyResolvedValue = JSON.stringify(binding.computeValue(/*_retainUnmatchedTokens=*/true));
                            tokenInfo = " [bound: " + template + ", resolved: " + partiallyResolvedValue + "]";    
                        }
                        console.log(indent(3) + key + ": " + JSON.stringify(value) + tokenInfo); 
                    });
                }
                console.log(indent(2) + "Views bound to manager: ");
                _.each(manager.viewIds, function(id) {
                    console.log(indent(3) + id);
                });
                if (manager.warnings.length > 0) {
                    console.log(indent(2) + "WARNINGS: ");
                    _.each(manager.warnings, function(warning) {
                        console.log(indent(3) + warning);
                    });
                }
            });
        },

        printTokenNamespaceInfo: function() {
            var that = this;
            var namespaces = that.getInfoForNamespaces();

            console.log("Token Namespaces:");
            _.each(namespaces, function(namespace) {
                console.log(indent(1) + "ID: " + namespace.id);
                console.log(indent(2) + "Type: " + namespace.type);
                console.log(indent(2) + "Tokens: ");
                _.each(namespace.tokens, function(token) {
                    console.log(indent(3) + token.name + ": ");
                    console.log(indent(4) + "value: " + JSON.stringify(token.value));
                    console.log(indent(4) + "listeners: " + token.listenerIds.join(', '));
                });
            });
        },

        /**
         * Prints all component info
         */
        printComponentInfo: function() {
            this.printViewInfo();
            this.printSearchManagerInfo();
            this.printTokenNamespaceInfo();
        },

        printWarnings: function() {
            var that = this;
            var components = that.getDebugData();
            console.log("WARNINGS:");
            _.each(components, function(item) {
                if (item.warnings.length > 0 ) {
                    console.log(indent(1), "ID: " + item.id + ": ");
                    _.each(item.warnings, function(warning) {
                        console.log(indent(2) + warning);
                    });
                }             
            });
        },

        _getInfoForComponents: function(ctype) {
            var components = this.getDebugData();
            if (ctype !== undefined) {
                return _.where(components, {'category': categoryEnum[ctype]});
            }
            return components;
        },

        getInfoForViews: function() { 
            return this._getInfoForComponents('VIEW'); 
        },

        getInfoForManagers: function() { 
            return this._getInfoForComponents('MANAGER'); 
        },

        getInfoForNamespaces: function() { 
            return this._getInfoForComponents('NAMESPACE'); 
        },

        help : function() { 
            console.log("Splunkjs Debugger Commands");
            console.log(indent(1) + "- printWarnings(): Prints all warnings to the console.");
            console.log(indent(1) + "- printComponentInfo(): Prints all debug info and warnings to the console by component.");
            console.log(indent(1) + "- printViewInfo(): Prints debug info for all Splunk views.");
            console.log(indent(1) + "- printSearchManagerInfo(): Prints debug info for all Splunk search managers.");
            console.log(indent(1) + "- printTokenNamespaceInfo(): Prints debug info for Splunk token namespaces.");
            console.log(indent(1) + "- getDebugData(): Returns all debug metadata for components and namespaces.");
            console.log(indent(1) + "- getInfoForViews(): Returns debug metadata for all Splunk views.");
            console.log(indent(1) + "- getInfoForManagers(): Returns debug metadata for all Splunk managers.");
            console.log(indent(1) + "- getInfoForNamespaces(): Returns debug metadata for all Splunk token namespaces.");
        }

    });
    
    return Debugger;
});
