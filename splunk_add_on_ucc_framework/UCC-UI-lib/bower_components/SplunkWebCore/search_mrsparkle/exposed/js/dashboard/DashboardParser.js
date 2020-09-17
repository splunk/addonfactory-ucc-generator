define([
    'underscore',
    'jquery',
    'contrib/text!dashboard/parser_config.json',
    'util/console',
    'util/general_utils',
    'util/xml',
    'splunk.util',
    'splunkjs/mvc/tokenutils',
    'util/dashboard_utils',
    'util/math_utils',
    'splunk/parsers/ArrayParser',
    'splunk/parsers/StringParser',
    'splunk/parsers/ObjectParser',
    'util/moment/relative'
], function(_,
            $,
            DEFAULT_PARSER_CONFIG_TEXT,
            console,
            GeneralUtils,
            XML,
            SplunkUtil,
            TokenUtils,
            DashboardUtils,
            MathUtils,
            ArrayParser,
            StringParser,
            ObjectParser,
            relativeTimeUtil) {

    var sprintf = SplunkUtil.sprintf;

    /**
     * Dashboard XML parser
     */
    var DashboardParser = function() {
        this.initialize.apply(this, arguments);
    };

    /**
     * Component definition format

     {
         // Logical name of the component, also used as tagName if not explicitly specified
         "name": "mycomponent",

         // Alternative tag name(s) for the component, can be a string or an array
         "alias": ["othername"],

         // Explicitly override the tag name to match for this component type
         "tagName": "foobar",

         TBD...
     }
     */

    _.extend(DashboardParser.prototype, {
        initialize: function(config) {
            this.config = config;
            _.bindAll(this, '_applyBaseDefinition', '_registerDefinition', '_registerComponentDefinition');
            var nodeTypes = this.nodeTypes = {};
            var definitions = this.definitions = {};
            _(config).chain()
                .flatten()
                .map(this._processDefinition)
                .each(function(nodeDef) {
                    definitions[nodeDef.name] = nodeDef;
                })
                .each(_.partial(this._applyBaseDefinition, _, definitions))
                .each(this._normalizeReportProperty)
                .filter(function(nodeDef) {
                    return !nodeDef['abstract'];
                })
                .each(_.partial(this._registerDefinition, _, nodeTypes));
        },
        /**
         * Create an internal representation of the node definition from the parser config
         * @private
         */
        _processDefinition: function(nodeDef) {
            if (nodeDef.settings) {
                _(nodeDef.settings).each(function(setting) {
                    // Because type attribute will be override, save the valueType for error handling
                    setting.valueType = setting.type;
                    switch (setting.type) {
                        case "attribute":
                            nodeDef.attributes || (nodeDef.attributes = {});
                            nodeDef.attributes[setting.attributeName || setting.name] = setting;
                            if (setting.alias) {
                                nodeDef.attributes[setting.alias] = setting;
                            }
                            setting.type = setting.dataType || 'string';
                            break;
                        case "node":
                            nodeDef.valueNodes || (nodeDef.valueNodes = []);
                            nodeDef.valueNodes.push(setting);
                            setting.type = setting.dataType || 'string';
                            break;
                        case "option":
                            nodeDef.options || (nodeDef.options = {});
                            nodeDef.requiredOptions || (nodeDef.requiredOptions = []);
                            nodeDef.options[setting.optionName || setting.name] = setting;
                            if (setting.alias) {
                                nodeDef.options[setting.alias] = setting;
                            }
                            if (setting.required) {
                                nodeDef.requiredOptions.push(setting.optionName || setting.name);
                            }
                            setting.type = setting.dataType || 'string';
                            break;
                    }
                });
            }
            return nodeDef;
        },
        /**
         * Apply configuration settings to a new definition its super-definition (if it extends one)
         * @private
         */
        _applyBaseDefinition: function(nodeDef, definitions) {
            var extendsDef = nodeDef['extends'];
            if (extendsDef) {
                var superDef = definitions[extendsDef];
                if (!superDef) throw new Error('Config error: super type ' + extendsDef + ' not found!');
                if (superDef.reportPropertyPrefix && !nodeDef.reportPropertyPrefix) {
                    nodeDef.reportPropertyPrefix = superDef.reportPropertyPrefix;
                }
                if (superDef.tagName && !nodeDef.tagName) {
                    nodeDef.tagName = superDef.tagName;
                }
                if (superDef.options) {
                    nodeDef.options = _.defaults(nodeDef.options || {}, superDef.options);
                }
                if (superDef.attributes) {
                    nodeDef.attributes = _.defaults(nodeDef.attributes || {}, superDef.attributes);
                }
                if (superDef.valueNodes) {
                    nodeDef.valueNodes = _.union(superDef.valueNodes || [], nodeDef.valueNodes || []);
                }
                if (superDef.children) {
                    nodeDef.children = _.union(nodeDef.children || [], superDef.children);
                }
                if (superDef.normalization) {
                    nodeDef.normalization = _.extend({}, superDef.normalization, nodeDef.normalization);
                }
                if (superDef.validation) {
                    nodeDef.validation = _.extend({}, superDef.validation, nodeDef.validation);
                }
                if (superDef.retainRawXML) {
                    nodeDef.retainRawXML = superDef.retainRawXML;
                }
            }
            if (nodeDef.children) {
                nodeDef.children.sort();
            }
        },
        _normalizeReportProperty: function(nodeDef) {
            if (nodeDef.settings) {
                _(nodeDef.settings).each(function(setting) {
                    if (!_.isUndefined(nodeDef.reportPropertyPrefix) && _.isUndefined(setting.reportProperty)) {
                        setting.reportProperty = nodeDef.reportPropertyPrefix + setting.name;
                    }
                    if (setting.reportProperty) {
                        // SPL-128439, delete default property for reportProperty as they should came from savedsearchs.conf
                        delete setting['default'];
                    }
                });
            }
        },
        _registerDefinition: function(nodeDef, definitions) {
            var parser = this;
            var tagName = nodeDef.tagName || nodeDef.name;
            parser._registerComponentDefinition(tagName, nodeDef, definitions);
            if (nodeDef.alias) {
                _([nodeDef.alias]).chain().flatten().each(function(alias) {
                    parser._registerComponentDefinition(alias, nodeDef, definitions);
                });
            }
        },
        _registerComponentDefinition: function(tagName, def, definitions) {
            if (definitions[tagName]) {
                var curDef = definitions[tagName];
                definitions[tagName] = _.isArray(curDef) ? curDef.concat(def) : [curDef, def];
            } else {
                definitions[tagName] = def;
            }
        },
        /**
         * Parse the given XML
         * @param xml {String|Node} - the XML as plain string or parsed document
         * @param options {Object} - {
         *      root {Array} - constrain valid root node (refers to definitions' names)
         *      validator {Validator} - pass in validator instance to collect parser warnings and errors
         * }
         */
        parse: function(xml, options) {
            options || (options = {});
            var config = _.extend({}, this.config, options);
            var result;
            var doc = XML.parseSaxDocument(xml);
            var rootNodeDefinition = this._findDefinitionForNode(doc, null, options);

            if (rootNodeDefinition) {
                if (this._isRootNodeAllowed(rootNodeDefinition, config)) {
                    result = this._parseNode(doc, rootNodeDefinition, options);
                } else {
                    this._error('Unable to parse dashboard XML: invalid root node', options.validator, doc);
                    return null;
                }
            } else {
                this._error('Unable to parse dashboard XML: unknown root node', options.validator, doc);
                return null;
            }

            return options.normalize !== false ? this.normalize(result, options) : result;
        },
        parsePanel: function(xml, options) {
            options = _.extend({root: ['panel']}, options);
            return this.parse(xml, options);
        },
        parseDashboard: function(xml, options) {
            options = _.extend({root: ['dashboard']}, options);
            return this.parse(xml, options);
        },
        validate: function(xml, options) {
            var validationResult = {warnings: [], errors: []};
            try {
                this.parse(xml, _.extend(options || {}, {validator: validationResult}));
            } catch (e) {
                return {errors: [{msg: e.message, line: e.line || -1}], warnings: []};
            }
            return validationResult;
        },
        validateDashboard: function(xml, options) {
            var validationResult = {warnings: [], errors: []};
            try {
                this.parseDashboard(xml, _.extend(options || {}, {validator: validationResult}));
            } catch (e) {
                return {errors: [{msg: e.message, line: e.line || -1}], warnings: []};
            }
            return validationResult;
        },
        validatePanel: function(xml, options) {
            var validationResult = {warnings: [], errors: []};
            try {
                this.parsePanel(xml, _.extend(options || {}, {validator: validationResult}));
            } catch (e) {
                return {errors: [{msg: e.message, line: e.line || -1}], warnings: []};
            }
            return validationResult;
        },
        /**
         * Normalize the result of a parser
         * @param parserResult
         * @param config
         * @param options
         * @returns {*}
         */
        normalize: function(parserResult, options) {
            options || (options = {});
            this._applyRowGrouping(parserResult, options);
            this._normalizeDrilldownDefaults(parserResult, options);
            this._normalizeLegacyElementSettings(parserResult, options);
            this._moveSettings(parserResult, options);
            this._inlineChildren(parserResult, options);
            this._convertResults(parserResult, options);
            this._normalizeIdentifiers(parserResult, options);
            this._omitFromResults(parserResult, options);
            this._applyLayout(parserResult, options);
            this._cleanupResults(parserResult, options);
            return parserResult;
        },
        _applyLayout: function(parserResult, options) {
            if (parserResult.def.layoutContainer) {
                var layoutNames = _.pluck(this.config.layout, "name");
                var formNames = _.pluck(this.config.form, "name");
                var groupComponents = _(parserResult.children).chain()
                    .groupBy(function(component) {
                        if (_.contains(layoutNames, component.type)) {
                            return 'layouts';
                        }
                        else if (_.contains(formNames, component.type)) {
                            return 'forms';
                        }
                        else if (component.type == 'row') {
                            return 'rows';
                        }
                        else {
                            return 'others';
                        }
                    }).value();
                groupComponents.layouts = groupComponents.layouts || [];
                groupComponents.rows = groupComponents.rows || [];
                groupComponents.forms = groupComponents.forms || [];
                groupComponents.others = groupComponents.others || [];
                // move rows into a dummy row-column
                if (groupComponents.rows.length > 0 || groupComponents.layouts.length === 0) {
                    groupComponents.layouts.push({
                        type: 'row-column',
                        settings: {},
                        children: groupComponents.rows
                    });
                }

                // move forms into the first layout manager(there will always be at least one layout manager)
                if (groupComponents.forms.length > 0) {
                    var layout = _.first(groupComponents.layouts);
                    layout.children = _.union(groupComponents.forms, layout.children);
                }

                // reconstruct the children
                parserResult.children = _.union(groupComponents.layouts, groupComponents.others);
            }
            return parserResult;
        },
        /**
         * Retrieve node definitions matching the given predicate function
         * @param {Function} predicate
         * @returns {Array} List of node definitions
         */
        findNodeDefinitions: function(predicate) {
            return _(this.definitions).filter(predicate);
        },
        /**
         * Walk the hierarchy of the parser result and call the given function for each of components in the result
         * @param parserResult the parser result
         * @param {Function} fn the function to call
         * @param {*} scope the scope to call the function with
         * @param {*} parent the parent
         * @param {Boolean} depthFirst - true to talk the tree depth-first, otherwise breadth-first
         * @private
         */
        _visit: function(parserResult, fn, scope, parent, depthFirst) {
            if (!depthFirst) fn.call(scope, parserResult, parent);
            if (parserResult.children && parserResult.children.length) {
                _(parserResult.children.slice())
                    .each(_.partial(_.bind(this._visit, this), _, fn, scope, parserResult, depthFirst));
            }
            if (depthFirst) fn.call(scope, parserResult, parent);
        },
        /**
         * Detect duplicate IDs in the parser result
         * @private
         */
        _normalizeIdentifiers: function(parserResult, options) {
            var parser = this;
            var seenIds = {};
            // capture all specified IDs - see if we have duplicates
            this._visit(parserResult, function(component) {
                var id = component.id = component.id || (component.settings || {}).id;
                if (id) {
                    if (seenIds[id]) {
                        parser._error('Duplicate ID: ' + JSON.stringify(id), options.validator);
                    }
                    seenIds[id] = true;
                }
            });
        },
        /**
         * Apply the "pullOutSettings" normalization rules on the parser result (moving settings from a component to
         * its parent)
         * @private
         */
        _moveSettings: function(parserResult, options) {
            this._visit(parserResult, function(component, parent) {
                var normalization = component.def.normalization;
                if (normalization && normalization.pullOutSettings) {
                    _(normalization.pullOutSettings).each(function(settingName) {
                        var val = component.settings[settingName];
                        if (val !== undefined && parent.settings[settingName] === undefined) {
                            parent.settings[settingName] = val;
                            delete component.settings[settingName];
                        }
                    });
                }
            }, this);
        },
        /**
         * Apply the "convertTo" normalization rules on the parser result (ie. change the type of a component in the
         * parser result and apply default settings of the target type)
         * @private
         */
        _convertResults: function(parserResult, options) {
            this._visit(parserResult, function(component, parent) {
                var normalization = component.def.normalization;
                if (normalization && normalization.convertTo) {
                    var convertTo = normalization.convertTo;
                    var convertToType = convertTo.type;
                    var instance;
                    if (convertTo.merge !== false) {
                        // Find existing target type instance if a fixed ID has been specified in the convertTo rule
                        instance = _(parent.children).find(function(child) {
                            return child.type == convertToType &&
                                (convertTo.id === undefined || child.id == convertTo.id);
                        });
                    }
                    var idx = _.indexOf(parent.children, component);
                    if (instance) {
                        // remove item from children of parent
                        parent.children.splice(idx, 1);
                    } else {
                        var targetTypeDef = this.definitions[convertToType];
                        if (!targetTypeDef) throw new Error('Config error: Cannot convert ' + component.def.name +
                            ' - target type ' + convertToType + ' not found');
                        instance = this._createComponent(targetTypeDef);
                        instance.id = convertTo.id;
                        parent.children[idx] = instance;
                    }

                    // Apply settings to the converted node
                    _.extend(instance.settings, component.settings);
                }
            }, this);
        },
        /**
         * Apply legacy row grouping ("rowGrouping" normalization rule in the parser config) on the parser result.
         * Note: row grouping is DEPRECATED
         * @private
         */
        _applyRowGrouping: function(parserResult, options) {
            options || (options = {});
            this._visit(parserResult, function(component, parent) {
                var normalization = component.def.normalization;
                if (normalization && normalization.rowGrouping) {
                    var groupType = normalization.rowGrouping;
                    var groupTypeDef = this.definitions[groupType];
                    var grouping = component.settings.grouping || '';

                    var curChildren = component.children;

                    var isPanel = function(child) { return child.def['extends'] == 'base-panel'; };
                    var isIgnored = function(child) { return child.def['extends'] == 'base-search'; };
                    var isElement = function(child) { return !isPanel(child) && !isIgnored(child); };

                    if (_.some(curChildren, isPanel) && _.some(curChildren, isElement)) {
                        return this._error('Rows can only contain visualization elements or panels, not both.', options.validator);
                    }

                    if (_.all(curChildren, function(child) { return isPanel(child) || isIgnored(child); })) {
                        if (grouping !== '') {
                            this._error('Row grouping can only applied to non-' + groupType + ' children', options.validator);
                        }
                        return;
                    }

                    var newChildren = _.filter(curChildren, isIgnored);
                    grouping = _(grouping.split(',')).map(function(g) { return parseInt($.trim(g), 10); });

                    var childrenToGroup = _.filter(curChildren, isElement);
                    while (childrenToGroup.length) {
                        var count = grouping.shift() || 1;
                        var group = [];
                        while (count--) {
                            var child = childrenToGroup.shift();
                            if (child) {
                                group.push(child);
                            }
                        }
                        if (group.length) {
                            var groupComponent = this._createComponent(groupTypeDef);
                            groupComponent.children = group;
                            newChildren.push(groupComponent);
                        }
                    }
                    while (grouping.length) {
                        grouping.shift();
                        var emptyGroup = this._createComponent(groupTypeDef);
                        emptyGroup.children = [];
                        newChildren.push(emptyGroup);
                    }
                    component.children = newChildren;
                }
            }, this);
        },
        _normalizeDrilldownDefaults: function(parserResult, options) {
            this._visit(parserResult, function(component) {
                if (component.def.name == 'single') {
                    // check the drilldown children if no reportConent or no drilldown property specified.
                    if (component.reportContent && !('display.visualizations.singlevalue.drilldown' in component.reportContent)) {
                        if (_.any(component.children, function(child) { return this._isChildOfType(child.def, 'drilldown'); }, this)) {
                            // Enable drilldown for single value by default if a dynamic drilldown block has been specified
                            component.reportContent['display.visualizations.singlevalue.drilldown'] = 'all';
                        }
                    }
                }
            }, this);
        },
        _normalizeLegacyElementSettings: function(parserResult, options) {
            options || (options = {});
            this._visit(parserResult, function(component) {
                if (component.def.name == 'event' && component.reportContent) {
                    if ('display.events.softWrap' in component.reportContent) {
                        _(['display.events.list.wrap', 'display.events.table.wrap']).each(function(prop) {
                            if (!(prop in component.reportContent)) {
                                component.reportContent[prop] = GeneralUtils.normalizeBoolean(component.reportContent['display.events.softWrap']);
                            }
                        });
                        delete component.reportContent['display.events.softWrap'];
                    }
                    if ('display.events.drilldown' in component.reportContent) {
                        var enabled = GeneralUtils.normalizeBoolean(component.reportContent['display.events.drilldown']);
                        _(['display.events.raw.drilldown', 'display.events.list.drilldown']).each(function(prop) {
                            if (!(prop in component.reportContent) && !enabled) {
                                component.reportContent[prop] = 'none';
                            }
                        });
                        _(['display.events.table.drilldown']).each(function(prop) {
                            if (!(prop in component.reportContent)) {
                                component.reportContent[prop] = enabled ? '1' : '0';
                            }
                        });
                    }
                    if ('display.events.segmentation' in component.reportContent) {
                        var value = component.reportContent['display.events.segmentation'];
                        _(['display.events.raw.drilldown', 'display.events.list.drilldown']).each(function(prop) {
                            if (!(prop in component.reportContent)) {
                                component.reportContent[prop] = value;
                            }
                        });
                        _(['display.events.table.drilldown']).each(function(prop) {
                            if (!(prop in component.reportContent)) {
                                component.reportContent[prop] = value != 'none' ? '1' : '0';
                            }
                        });
                    }
                }
            });
        },
        _inlineChildren: function(parserResult, options) {
            this._visit(parserResult, function(component, parent) {
                var idxSeqs = {};
                var normalization = component.def.normalization;
                if (normalization && normalization.inlineChildren) {
                    _(normalization.inlineChildren).each(function(inlineSettings) {
                        var children = _(component.children).partition(function(child) {
                            return child.type == inlineSettings.type ||
                                child.def['extends'] == inlineSettings.type;
                        });
                        var inlineChildren = children[0];
                        if (inlineChildren.length) {
                            // inline settings into a defined node
                            if (inlineSettings.setting) {
                                component.settings[inlineSettings.setting] = inlineSettings.single ?
                                    inlineChildren[0].settings :
                                    _(inlineChildren).pluck('settings');
                            }
                            /**
                             * inline report properties
                             */
                            if (!_.isUndefined(inlineSettings.reportProperty)) {
                                var reportPrefix = (component.def.reportPropertyPrefix || "") + (inlineSettings.reportProperty || "");
                                component.reportContent || (component.reportContent = {});
                                _(inlineChildren).chain().pluck('reportContent').each(function(reportContent) {
                                    var prefix = reportPrefix;
                                    if (inlineSettings.autoIndex) {
                                        var id = _.isUndefined(idxSeqs[reportPrefix]) ? 0 : idxSeqs[reportPrefix] + 1;
                                        idxSeqs[reportPrefix] = id;
                                        prefix += id;
                                    }
                                    _(reportContent).each(function(v, k) {
                                        component.reportContent[prefix + k] = v;
                                    });
                                });
                            }
                            component.children = children[1];
                        }
                    });
                }
            }, this, null, true);
        },
        _omitFromResults: function(parserResult) {
            this._visit(parserResult, function(component, parent) {
                var normalization = component.def.normalization;
                if (normalization && normalization.omitFromResults) {
                    parent.children.splice(_.indexOf(parent.children, component), 1);
                }
            }, this);
        },
        _cleanupResults: function(results) {
            this._visit(results, function(component, parent) {
                delete component.def;
                component.settings || (component.settings = {});
                delete component.settings.id;
                if (component.id === undefined) {
                    delete component.id;
                }
            }, this);
        },
        getNodeDefinition: function(nodeName) {
            return this.nodeTypes[nodeName];
        },
        _isRootNodeAllowed: function(rootNodeDef, config) {
            return (!config.root) || _.contains(config.root, rootNodeDef.name);
        },
        _createComponent: function(def) {
            var cmp = {
                type: def.name,
                settings: {},
                children: [],
                def: def
            };
            if (this._isChildOfType(def, 'element')) {
                cmp.reportContent = {};
            }
            var parser = this;
            _(def.settings).each(function(setting) {
                if (setting['default'] !== undefined) {
                    parser._applySetting(cmp, setting, setting['default']);
                }
            });

            return cmp;
        },
        _applySetting: function(result, settingDef, value) {
            if (!_.isUndefined(settingDef.reportProperty)) {
                result.reportContent || (result.reportContent = {});
                result.reportContent[settingDef.reportProperty] = value;
            } else {
                var target = result.settings;
                if (settingDef.parentObj) {
                    target = target[settingDef.parentObj] || (target[settingDef.parentObj] = {});
                }
                target[settingDef.name] = value;
            }
        },
        _parseNode: function(node, def, options) {
            var parser = this;
            var result = this._createComponent(def);
            if (def.retainRawXML && options.retainRawXML) {
                result.rawXML = node.raw();
            }
            if (def.attributes) {
                _(def.attributes).each(function(attributeDef, attributeName) {
                    if (!attributeDef.omit) {
                        var value = parser._parseValue(node.attr[attributeName], attributeDef, node, options);
                        if (value !== undefined) {
                            if (attributeDef.allowEmpty === false && !value) {
                                parser._warn(sprintf('Attribute "%s" must not be emtpy', attributeName), options.validator, node);
                            }
                            parser._applySetting(result, attributeDef, value);
                            if (attributeDef.legacy && options.validator) {
                                parser._warn(sprintf('Attribute "%s" is deprecated', attributeName), options.validator, node);
                            }
                        }
                    }
                });
            }

            if (options.validator) {
                var allowedAttributes = {};
                if (def.attributes) {
                    allowedAttributes = def.attributes;
                }
                _(node.attr).each(function(val, name) {
                    if (!allowedAttributes[name]) {
                        parser._warn(sprintf('Unknown attribute "%s" for node "%s"', name, node.name), options.validator, node);
                    }
                });
            }

            var contentSetting = _(def.settings || []).where({type: 'content'})[0];
            if (contentSetting) {
                var value;
                if (contentSetting.raw) {
                    value = GeneralUtils.normalizeBoolean(node.attr.encoded) ? node.val : node.rawContent();
                } else {
                    value = node.val;
                }
                value = this._parseValue(value, contentSetting, node, options);
                if (value !== undefined) {
                    parser._applySetting(result, contentSetting, value);
                }
            } else {
                var excludeChildNodes = [];

                if (def.valueNodes) {
                    _(def.valueNodes).each(function(valNodeDef) {
                        var nodeName = valNodeDef.nodeName || valNodeDef.name;
                        excludeChildNodes.push(nodeName);
                        var valNodes = node.childrenNamed(nodeName);
                        if (valNodes.length > 1) {
                            _.each(valNodes.slice(1), function(dup) {
                                parser._warn(sprintf("Ignoring duplicate <%s> node in %s", nodeName, def.name), options.validator, dup);
                            });
                            valNodes = [valNodes[0]];
                        }
                        if (valNodes.length) {
                            var valNode = valNodes[0];
                            if (options.validator) {
                                _(valNodes).each(function(valNode) {
                                    _(valNode.attr).each(function(val, attr) {
                                        parser._warn(sprintf('Unknown attribute "%s" for node "%s"', attr, valNode.name), options.validator, valNode);
                                    });
                                });
                            }
                            if (valNodeDef.legacy && options.validator) {
                                parser._warn(sprintf('Value node <%s> is deprecated', valNodeDef.name), options.validator, valNode);
                            }
                            if (!valNode.children.length && !valNodeDef.child) {
                                var value = parser._parseValue(valNode.val, valNodeDef, valNode, options);
                                if (value !== undefined) {
                                    parser._applySetting(result, valNodeDef, value);
                                }
                            } else if (valNodeDef.child && valNode.children.length) {
                                var childNode = valNode.childNamed(valNodeDef.child);
                                if (childNode) {
                                    if (options.validator) {
                                        _(childNode.attr).each(function(val, attr) {
                                            parser._warn(sprintf('Unknown attribute "%s" for node "%s"', attr, childNode.name), options.validator, childNode);
                                        });
                                    }
                                    var childVal = parser._parseValue(childNode.val, valNodeDef, childNode, options);
                                    if (childVal !== undefined) {
                                        parser._applySetting(result, valNodeDef, childVal);
                                    }
                                }
                            } else {
                                parser._warn(sprintf('Value node <%s> %s supposed to have children',
                                    valNode.name, valNodeDef.child ? 'is' : 'is not'), options.validator, valNode);
                            }
                        }
                    });
                }

                if (def.options) {
                    excludeChildNodes.push('option');
                    var requiredOptions = def.requiredOptions.slice(0);
                    _(node.childrenNamed('option')).each(_.bind(function(optionNode) {
                        var name = optionNode.attr.name;

                        if (!name) {
                            this._warn('Invalid option (no name attribute)', options.validator, optionNode);
                            return;
                        }
                        requiredOptions = _.without(requiredOptions, name);
                        if (options.validator) {
                            _(optionNode.attr).each(function(val, attr) {
                                if (attr !== 'name') {
                                    parser._warn(sprintf('Unknown attribute "%s" for node "%s"', attr, optionNode.name), options.validator, optionNode);
                                }
                            });
                        }

                        var optDef = def.options[name];
                        if (!optDef && def.wildcardOptions) {
                            var prefixes = (def.wildcardOptions.prefix || []).slice();
                            if (def.wildcardOptions.prefixReportProperty && result.reportContent) {
                                var prefixValue = result.reportContent[def.wildcardOptions.prefixReportProperty];
                                if (prefixValue) {
                                    prefixes.push(prefixValue);
                                }
                            }
                            var matchesPrefix = _.any(prefixes, function(prefix) {
                                return name.indexOf(prefix) === 0;
                            });
                            if (matchesPrefix) {
                                optDef = {
                                    name: name,
                                    reportProperty: !_.isUndefined(def.reportPropertyPrefix) ? def.reportPropertyPrefix + name : undefined
                                };
                            }
                        }
                        if (optDef) {
                            if (optDef.legacy && options.validator) {
                                parser._warn(sprintf('Option "%s" is deprecated', optDef.name), options.validator, optionNode);
                            }
                            var value = this._parseValue(optionNode.val, optDef, optionNode, options);
                            if (value !== undefined) {
                                parser._applySetting(result, optDef, value);
                            }
                        } else {
                            parser._warn('Unknown option name=' + JSON.stringify(name)
                                + ' for node=' + JSON.stringify(def.name), options.validator, optionNode);
                        }
                    }, this));
                    // check whether all required options are found
                    if (requiredOptions.length) {
                        this._error('Missing required option(s): ' + requiredOptions.join(','), options.validator, node);
                    }
                }

                //todo, remove me if sparkline migrated to new format syntax
                var formatSetting = _(def.settings || []).where({type: 'legacySparkline'})[0];
                if (formatSetting) {
                    var format = this._parseLegacySparklineSetting(node, formatSetting, options);
                    if (format !== undefined) {
                        _.each(format, function(v, k) {
                            // transform the key from 'format' to '[type].format'
                            k = sprintf('%s.format', k);
                            if (formatSetting.reportProperty && formatSetting.reportProperty.indexOf(k) < 0) {
                                formatSetting.reportProperty = formatSetting.reportProperty.replace('format', k);
                            }
                            else if (formatSetting.name.indexOf(k) < 0) {
                                formatSetting.name = formatSetting.name.replace('format', k);
                            }
                            parser._applySetting(result, formatSetting, v);
                        }, this);
                    }
                }

                var parseChildOptions = _.defaults({excludeNodes: excludeChildNodes}, options);

                if (def.children !== undefined) {
                    result.children = this._parseChildren(def, def.children, node, parseChildOptions);
                    this._validateChildren(node, result.children, def.children, def, options);
                }

                if (def.validation) {
                    if (def.validation.hasChildren && result.children.length === 0) {
                        this._warn(sprintf('Empty <%s>', node.name), options.validator, node);
                    }
                    if (def.validation.legacy) {
                        this._warn(sprintf('Legacy notation: %s', def.name), options.validator, node);
                    }
                }
            }
            return result;
        },
        _parseChildren: function(parentDef, childList, node, options) {
            var allowedChildren = _(childList).pluck('type');
            var parser = this;
            var children = [];
            _(node.children).each(_.bind(function(child) {
                if (!_.contains(options.excludeNodes, this._nodeName(child))) {
                    var childDef = parser._findDefinitionForNode(child, allowedChildren, options);
                    if (childDef) {
                        if (_(allowedChildren).any(function(t) { return parser._isChildOfType(childDef, t); })) {
                            children.push(this._parseNode(child, childDef, options));
                        } else {
                            parser._warn(
                                'Invalid child=' + JSON.stringify(childDef.name) +
                                ' is not allowed in node=' + JSON.stringify(parentDef.name),
                                options.validator, child);
                        }
                    }
                }
            }, this));
            return children;
        },
        _validateChildren: function(node, childResults, allowedChildren, parentDef, options) {
            var warn = _.bind(this._warn, this);
            var parser = this;
            return _(allowedChildren).all(function(allowedChild) {
                var childCount = _.once(function() {
                    return _(childResults).filter(function(res) {
                        return parser._isChildOfType(res.def, allowedChild.type);
                    }).length;
                });

                if (allowedChild.min > 0 && childCount() < allowedChild.min) {
                    warn(sprintf('Expected at least %d %s in %s, not %d',
                        allowedChild.min, allowedChild.type, parentDef.name, childCount()), options.validator, node);
                    return false;
                }
                if (allowedChild.max !== undefined && childCount() > allowedChild.max) {
                    warn(sprintf('Expected at most %d children of %s in %s, instead saw %d',
                        allowedChild.max, allowedChild.type, parentDef.name, childCount()), options.validator, node);
                    return false;
                }
                return true;
            });
        },
        _isChildOfType: function(def, type) {
            return def.name === type || def['extends'] === type;
        },
        _findDefinitionForNode: function(node, allowedChildren, options) {
            var nodeName = this._nodeName(node);
            var nodeDef = this.getNodeDefinition(nodeName);
            if (!nodeDef) {
                this._warn('Unknown node <' + nodeName + '>', options && options.validator, node);
            }
            if (_.isArray(nodeDef)) {
                nodeDef = _(nodeDef).find(function(def) {
                    if (allowedChildren == null || _.contains(allowedChildren, def.name) ||
                        _.contains(allowedChildren, def['extends'])) {
                        if (def.match) {
                            return this._nodeMatches(node, def.match); // node.is(def.match) || node.find(def.match).length > 0;
                        } else {
                            return true;
                        }
                    }
                }.bind(this));
            }
            if (!nodeDef) {
                this._warn('Node <' + node.name + '> is not allowed here', options && options.validator, node);
                //this._warn('No matching node type definition found for node=' + this._nodeToString(node), options && options.validator, node);
            } else if (nodeDef.validation && nodeDef.validation.legacy) {
                this._warn('Legacy notation: ' + nodeDef.name, options && options.validator, node);
            }
            return nodeDef;
        },
        _nodeMatches: function(node, selector) {
            return _(selector.split(',')).chain()
                .map(this._selectorToCondition.bind(this))
                .any(this._nodeMatchesConditions.bind(this, node))
                .value();
        },
        _selectorToCondition: function(selector) {
            var m = selector.match(/^(\w+)?\[(\w+)=(\w+)]$/);
            if (m) {
                return {type: 'attrValue', attr: m[2], value: m[3], tagName: m[1]};
            }
            m = selector.match(/^(\w+)?\[(\w+)]$/);
            if (m) {
                return {type: 'attrExists', attr: m[2], tagName: m[1]};
            }
            m = selector.match(/^(\w+)>(\w+)$/);
            if (m) {
                return {type: 'hasChild', tagName: m[1], child: m[2]};
            }
            m = selector.match(/^(\w+)$/);
            if (m) {
                return {type: 'tagName', tagName: m[1]};
            }
            m = selector.match(/^(\w+)\+(\w+)$/);
            if (m) {
                return {
                    type: 'hasSibling',
                    target: this._selectorToCondition(m[1]),
                    other: this._selectorToCondition(m[2])
                };
            }
            throw new Error('Invalid match selector in parser config: ' + JSON.stringify(selector));
        },
        _nodeMatchesConditions: function(node, cond) {
            switch (cond.type) {
                case 'tagName':
                    return node.name == cond.tagName;
                case 'hasChild':
                    return (cond.tagName == null || node.name == cond.tagName) && node.childNamed(cond.child) != null;
                case 'attrExists':
                    return node.attr[cond.attr] != null && (cond.tagName == null || cond.tagName == node.name);
                case 'attrValue':
                    return node.attr[cond.attr] == cond.value && (cond.tagName == null || cond.tagName == node.name);
                case 'hasSibling':
                    if (node.parent) {
                        var matched = _.find(node.parent.children, function(other) {
                            return node !== other && this._nodeMatchesConditions(other, cond.other);
                        }, this);
                        return !_.isUndefined(matched) && this._nodeMatchesConditions(node, cond.target);
                    }
                    return false;
                default:
                    return false;
            }
        },
        _nodeToString: function(node) {
            return node.toString();
        },
        _nodeName: function(node) {
            return node.name;
        },
        _parseOptionsHierarchy: function(node, options) {
            options || (options = {});
            var parser = this;
            var optionChildren = node.childrenNamed('option');
            var listChildren = node.childrenNamed('list');

            var hasOptions = optionChildren.length > 0;
            var hasList = listChildren.length > 0;

            if (hasOptions && hasList) {
                return this._error('Option cannot contain both option and list', options.validator);
            }

            var result;
            if (hasOptions) {
                result = {};
                _(optionChildren).each(function(opt) {
                    var name = opt.attr.name;
                    if (name) {
                        var val = parser._parseOptionsHierarchy(opt, options);
                        if (val != null && (val !== '' || !options.omitEmptyValues)) {
                            result[name] = val;
                        }
                    } else {
                        parser._warn('Encountered option without name attribute', options.validator, opt);
                    }
                });
            } else if (hasList) {
                result = [];
                _(listChildren).each(function(list) {
                    result.push(parser._parseOptionsHierarchy(list, options));
                });
            } else {
                result = parser._parseValue(node.val, {dataType: 'auto'}, node, options);
            }

            return result;
        },
        //todo, remove me if sparkline migrated to new format syntax
        _parseLegacySparklineSetting: function(node, setting, options) {
            var parser = this;
            var defaults = setting['default'] || {};
            var format = {};
            var sparklineNodes = [];
            _(node.childrenNamed('format')).each(function(formatNode) {
                var field = formatNode.attr.field || defaults.field;
                var type = formatNode.attr.type || defaults.type;
                if (type == 'sparkline') {
                    if (!field || !type) {
                        parser._warn('Invalid format definition, both field and type need to be specified',
                            options.validator, formatNode);
                        return;
                    }
                    var fieldFormat = format[type] || (format[type] = {});
                    var optionsHierarchy = parser._parseOptionsHierarchy(formatNode, _.extend({omitEmptyValues: true}, options));
                    if (optionsHierarchy) {
                        fieldFormat[field] = optionsHierarchy;
                    }
                    sparklineNodes.push(formatNode);
                }
            });
            node.children = _.difference(node.children, sparklineNodes);
            return _.isEmpty(format) ? undefined : format;
        },
        _parseValue: function(value, definition, node, options) {
            var validator = options && options.validator;
            // check default value and required value
            if (_.isUndefined(value) && definition['default'] !== undefined) {
                return definition['default'];
            }
            else if ((_.isUndefined(value) || value === '') && definition.required) {
                // empty string is not allow if required = true
                return this._error('Missing required ' + definition.valueType + ': ' + definition.name, validator, node);
            }

            if (definition.trim !== false && value) {
                value = $.trim(value);
            }

            var dataType = definition.dataType || definition.type || 'string';

            // Process non-token-aware data types
            switch (dataType) {
                case 'identifier':
                    if (!DashboardParser.isValidIdentifier(value)) {
                        return this._error('Invalid identifier: ' + JSON.stringify(value), validator, node);
                    }
                    return value;
                case 'html':
                    return value;
                case 'token-name':
                    if (!DashboardParser.isValidTokenName(value)) {
                        return this._error('Invalid token name: ' + JSON.stringify(value), validator, node);
                    }
                    return value;
            }

            // Return raw string value if it contains a token
            if (definition.allowTokens !== false && TokenUtils.hasToken(value)) {
                return value;
            }

            switch (dataType) {
                case 'string':
                    return value;
                case 'boolean':
                    if (value !== undefined && definition.mapBool && value in definition.mapBool) {
                        value = definition.mapBool[value];
                    }
                    if (value !== undefined && !GeneralUtils.isBooleanEquivalent(value)) {
                        this._warn('Non-boolean value ' + JSON.stringify(value) + ' specified', validator, node);
                    }
                    if (value === undefined && definition['default'] === undefined) {
                        return undefined;
                    }
                    var bool;
                    if (GeneralUtils.isBooleanEquivalent(value)) {
                        bool = GeneralUtils.normalizeBoolean(value);
                    }
                    else {
                        if (definition['default'] !== undefined) {
                            bool = GeneralUtils.normalizeBoolean(definition['default']);
                        }
                    }
                    return !_.isUndefined(definition.reportProperty) && bool !== undefined ? ( bool ? "1" : "0") : bool;
                case 'height':
                    // Strip off non-digit characters after the number and try to parse it
                    var heightVal = parseInt(value && value.replace(/\D+$/g, ''), 10);
                    if (_.isNaN(heightVal)) {
                        this._warn('Invalid height value: ' + JSON.stringify(value), validator, node);
                        return definition['default'];
                    } else if (!MathUtils.isInteger(value)) {
                        this._warn(sprintf('Height %s value should be an integer', JSON.stringify(value)), validator, node);
                    }

                    if ('min' in definition && heightVal < definition.min) {
                        this._warn(sprintf('Value %s is less than the minimum %d', JSON.stringify(heightVal), definition.min), validator, node);
                        return definition['default'];
                    }
                    if ('max' in definition && heightVal > definition.max) {
                        this._warn(sprintf('Value %s is greater than the maximum %d', JSON.stringify(heightVal), definition.max), validator, node);
                        return definition['default'];
                    }
                    return !_.isUndefined(definition.reportProperty) ? String(heightVal) : heightVal;
                case 'integer':
                    var intVal = parseInt(value, 10);
                    if (!MathUtils.isInteger(value)) {
                        this._warn('Invalid integer value: ' + JSON.stringify(value), validator, node);
                        return definition['default'];
                    }
                    if ('min' in definition && intVal < definition.min) {
                        this._warn(sprintf('Value %s is less than the minimum %d', JSON.stringify(intVal), definition.min), validator, node);
                        return definition['default'];
                    }
                    if ('max' in definition && intVal > definition.max) {
                        this._warn(sprintf('Value %s is greater than the maximum %d', JSON.stringify(intVal), definition.max), validator, node);
                        return definition['default'];
                    }
                    return !_.isUndefined(definition.reportProperty) ? value : intVal;
                case 'float':
                    var floatVal = parseFloat(value);
                    if (_.isNaN(floatVal)) {
                        this._warn('Invalid float value: ' + JSON.stringify(value), validator, node);
                        return definition['default'];
                    }
                    if ('min' in definition && floatVal < definition.min) {
                        this._warn(sprintf('Value %s is less than the minimum %d', JSON.stringify(floatVal), definition.min), validator, node);
                        return definition['default'];
                    }
                    if ('max' in definition && floatVal > definition.max) {
                        this._warn(sprintf('Value %s is greater than the maximum %d', JSON.stringify(floatVal), definition.max), validator, node);
                        return definition['default'];
                    }
                    return !_.isUndefined(definition.reportProperty) ? value : floatVal;
                case 'search-string':
                    return value;
                case 'app-resource':
                    return value;
                case 'app-resources':
                    return value ? _(value.split(',')).map($.trim) : [];
                case 'enum':
                    if (definition.mapBool) {
                        if (GeneralUtils.isBooleanEquivalent(value)) {
                            value = GeneralUtils.normalizeBoolean(value) ? "true" : "false";
                        }
                        if (value in definition.mapBool) {
                            value = definition.mapBool[value];
                        }
                    }
                    if (!_.contains(definition.values, value) && !_.isUndefined(value)) {
                        this._warn(sprintf('Value %s is not in the list of allowed values %s',
                            JSON.stringify(value), JSON.stringify(definition.values)), validator, node);
                        value = definition['default'];
                    }
                    return value;
                case 'relative-time':
                    try {
                        relativeTimeUtil.parseRelativeTimeExpression(value);
                    } catch (e) {
                        var message = sprintf('Value %s is not a valid relative time.', JSON.stringify(value));
                        this._warn(message, validator, node);
                    }
                    return value;
                case 'fields-list':
                    try {
                        value = DashboardParser.parseFieldsList(value);
                    } catch (e) {
                        value = DashboardParser.parseFieldsList(definition['default']);
                    }
                    // encode into string if necessary
                    if (definition.encode) {
                        // Fix SPL-119958, encode empty array into empty string
                        if (!_.isUndefined(value)) {
                            var parser = ArrayParser.getInstance(StringParser.getInstance());
                            value = (value && value.length > 0) ? parser.valueToString(value) : "";
                        }
                    }
                    return value;
                case 'csv-string':
                    try {
                        value = DashboardParser.parseCSVString(value);
                    } catch (e) {
                        value = definition['default'];
                    }
                    return value;
                case 'color-map':
                    var objectParser = ObjectParser.getInstance(StringParser.getInstance());
                    try {
                        value = objectParser.valueToString(this._parseOptionsHierarchy(node, options));
                    } catch (e) {
                        value = objectParser.valueToString(definition['default']);
                    }
                    return value;
                case 'auto':
                    return !_.isUndefined(definition.reportProperty) ? value : this._parseValueAutoType(value, node);
                default:
                    this._error('Unknown value type=' + JSON.stringify(dataType), validator, node);
            }
        },
        _parseValueAutoType: function(val, node) {
            if (val == 'true' || val == 'false') return this._parseValue(val, {type: 'boolean'}, node);
            else if (/^\d+$/.test(val)) return this._parseValue(val, {type: 'integer'}, node);
            else if (/^\d*\.\d+$/.test(val)) return this._parseValue(val, {type: 'float'}, node);
            else return val;
        },
        _error: function(msg, validator, node) {
            if (validator && _.isArray(validator.errors)) {
                validator.errors.push({msg: msg, node: node, line: node ? node.line + 1 : -1});
            } else {
                console.error(msg);
                throw new Error(msg);
            }
        },
        _warn: function(msg, validator, node) {
            if (validator && _.isArray(validator.warnings)) {
                validator.warnings.push({msg: msg, node: node, line: node ? node.line + 1 : -1});
            } else {
                console.warn(msg);
            }
        }
    });

    // This regex will take a space or comma separated list of fields, with quotes
    // for escaping strings with spaces in them, and match each individual
    // field.
    var FIELD_SPLITTER_REGEX = /(["'].*?["']|[^"',\s]+)(?=\s*|\s*,|\s*$)/g;

    // This regex will take a string that may or may not have leading quotes,
    // and strip them.
    var QUOTE_STRIPPER_REGEX = /^["']|["|']$/g;

    var defaultParserInstance;
    _.extend(DashboardParser, {
        getDefault: function() {
            return defaultParserInstance || (defaultParserInstance = DashboardParser.createDefault());
        },
        createDefault: function() {
            return new DashboardParser(DashboardParser.getDefaultConfig());
        },
        resetDefault: function() {
            defaultParserInstance = null;
        },
        getDefaultConfig: _.once(function() {
            return JSON.parse(DEFAULT_PARSER_CONFIG_TEXT);
        }),
        parseFieldsList: function(fields) {
            if (_.isUndefined(fields) || _.isArray(fields)) {
                return fields;
            }
            if (_.isString(fields)) {
                if (fields[0] === '[' && fields.slice(-1) === ']') {
                    fields = JSON.parse(fields);
                } else {
                    // Since this is a string, we're going to treat it as a
                    // space separated list of strings, with quoting. This is
                    // similar to what Splunk's 'fields' command takes.
                    fields = _.map(fields.match(FIELD_SPLITTER_REGEX), function(field) {
                        return field.replace(QUOTE_STRIPPER_REGEX, "");
                    });
                }
            }
            return fields;
        },
        parseCSVString: function(str) {
            if (str == null) {
                return str;
            }
            str = str.trim();
            if (str === '') {
                return [''];
            }
            var result = [];
            var chars = str.split('');
            var idx = 0, len = chars.length;
            var start, end;
            var isLineSep = function(ch) {
                return ch === '\r' || ch === '\n';
            };
            var nextSep = function() {
                while (idx < len && !isLineSep(chars[idx]) && chars[idx] !== ',') {
                    idx++;
                }
                return idx;
            };
            while (idx < len) {
                while (idx < len && !isLineSep(chars[idx])) {
                    start = end = idx;
                    if (chars[idx] === '"') {
                        // quoted
                        start = end = idx = idx + 1;
                        while (idx < len) {
                            // find next non-escaped quote char
                            if (chars[idx] === '"') {
                                if (chars[idx + 1] !== '"') {
                                    break;
                                } else {
                                    idx++;
                                    chars[idx] = '';
                                }
                            }
                            idx++;
                            end = idx;
                        }
                        if (chars[idx] === '"') {
                            idx++;
                        }
                        nextSep();
                    } else {
                        end = nextSep();
                    }
                    result.push(chars.slice(start, end).join('').trim());
                    if (chars[idx] === ',') {
                        idx++;
                    }
                }
                if (isLineSep(chars[idx])) {
                    idx++;
                }
            }
            return result;
        },
        isValidIdentifier: function(id) {
            return /^[a-z]\w+$/gi.test(id);
        },
        isValidTokenName: function(name) {
            return /^[^\$]+$/.test(name);
        }
    });

    return DashboardParser;
});
