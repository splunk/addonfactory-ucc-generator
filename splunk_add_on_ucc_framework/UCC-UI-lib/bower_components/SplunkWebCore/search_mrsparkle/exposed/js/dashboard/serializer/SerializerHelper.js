define([
    'underscore',
    'jquery',
    'util/xml',
    'models/dashboard/DashboardElementReport',
    'splunk/parsers/ObjectParser',
    'splunk/parsers/ArrayParser',
    'splunk/parsers/StringParser',
    'splunk/parsers/BooleanParser',
    'dashboard/DashboardParser'
], function(_,
            $,
            XML,
            DashboardElementReport,
            ObjectParser,
            ArrayParser,
            StringParser,
            BooleanParser,
            DashboardParser) {

    var arrayParser = ArrayParser.getInstance(StringParser.getInstance());
    var objectParser = ObjectParser.getInstance(StringParser.getInstance());
    var booleanParser = BooleanParser.getInstance();
    function applyPredefinedID($node, state) {
        if (state.isPredefinedID()) {
            $node.attr('id', state.id);
        }
    }

    function applyAttributes($node, attributes) {
        _(attributes).each(function(value, name) {
            $node.attr(name, value);
        });
    }

    function applyTokenDependencies($node, settings) {
        if (settings && settings.tokenDependences) {
            settings.tokenDependences.depends && $node.attr('depends', settings.tokenDependences.depends);
            settings.tokenDependences.rejects && $node.attr('rejects', settings.tokenDependences.rejects);
        }
    }

    function applyTitleNode($node, title) {
        $node.children('title').remove();
        if (title) {
            XML.$tag('title').text(title).prependTo($node);
        }
    }

    function removeElements($container) {
        $container.find(DashboardElementReport.VIZ_TYPES.join(',')).remove();
    }

    function removeInputs($container) {
        $container.children('input').remove();
    }

    function removeInputsAndElements($container) {
        removeInputs($container);
        removeElements($container);
    }

    function getOriginalXMLIfNotDirty(state, producer, options) {
        options || (options = {});
        var originalXML = state.getOriginalXML();
        var isDirty = state.isDirty() || options.forceDirty === true;
        return originalXML && !isDirty ? XML.$node(originalXML) : producer(originalXML, state);
    }

    /**
     * Generate a report properties to nodeDef mapping that helps Serializer construct dashboard xml
     * @param rootType
     * @returns {{}}
     */
    function getReportToNodeMapping(rootType) {
        var mapping = {};
        var parser = DashboardParser.getDefault();
        var rootNodes = parser.nodeTypes[rootType];
        if (rootNodes) {
            if (!_.isArray(rootNodes)) {
                rootNodes = [rootNodes];
            }
            _(rootNodes).each(function(nodeDef) {
                _(_.extend({}, nodeDef.attributes, nodeDef.settings, nodeDef.options)).each(function(v) {
                    if (!_.isUndefined(v.reportProperty)) {
                        mapping[v.reportProperty] = _.pick(v, 'name', 'valueType', 'dataType');
                    }
                });
                //handle inline children if there's any
                if (nodeDef.normalization && nodeDef.normalization.inlineChildren) {
                    _(nodeDef.normalization.inlineChildren).map(function(inlineDef) {
                        var childrenType = inlineDef.type;
                        var reportProperty = inlineDef.reportProperty;
                        var index = inlineDef.autoIndex ? "<idx>" : "";
                        var childrenMapping = getReportToNodeMapping(childrenType);
                        _(childrenMapping).each(function(v, k) {
                            var reportKey = (nodeDef.reportPropertyPrefix || "") + reportProperty + index + k;
                            mapping[reportKey] = v;
                        });
                    });
                }
            });
        }
        return mapping;
    }

    function getChildrenNames(rootType) {
        var ret = [];
        var parser = DashboardParser.getDefault();
        var rootNodes = parser.nodeTypes[rootType];
        if (rootNodes) {
            if (!_.isArray(rootNodes)) {
                rootNodes = [rootNodes];
            }
            _(rootNodes).each(function(nodeDef) {
                if (nodeDef.children) {
                    _.each(nodeDef.children, function(child) {
                        ret.push(child.type);
                    });
                }
            });
        }
        return ret;
    }

    function _prepareValueWithType(value, dataType) {
        var result;
        switch (dataType) {
            case "fields-list":
                result = (arrayParser.stringToValue(value) || []).join(",");
                break;
            case "color-map":
                result = objectParser.stringToValue(value) || {};
                break;
            case "boolean":
                result = booleanParser.valueToString(booleanParser.stringToValue(value));
                break;
            // case "string":
            // case "integer":
            // case "enum":
            default:
                result = value;
        }
        return result;
    }

    return {
        applyAttributes: applyAttributes,
        applyTokenDependencies: applyTokenDependencies,
        applyPredefinedID: applyPredefinedID,
        applyTitleNode: applyTitleNode,
        removeElements: removeElements,
        removeInputs: removeInputs,
        removeInputsAndElements: removeInputsAndElements,
        getOriginalXMLIfNotDirty: getOriginalXMLIfNotDirty,
        prepareValueWithType: _prepareValueWithType,
        getReportToNodeMapping: getReportToNodeMapping,
        getChildrenNames: getChildrenNames
    };
});