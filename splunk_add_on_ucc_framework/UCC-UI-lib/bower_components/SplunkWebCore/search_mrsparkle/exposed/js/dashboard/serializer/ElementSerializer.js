define([
    'underscore',
    'jquery',
    'splunkjs/mvc/mvc',
    'util/general_utils',
    'util/console',
    'util/xml',
    'dashboard/DashboardParser',
    'dashboard/serializer/SearchSerializer',
    'splunkjs/mvc/drilldown',
    'splunk.util',
    'models/dashboard/DashboardElementReport',
    'splunkjs/mvc/tokenawaremodel',
    './SerializerHelper'
], function(_,
            $,
            mvc,
            GeneralUtils,
            console,
            XML,
            DashboardParser,
            SearchSerializer,
            DrilldownHelper,
            SplunkUtil,
            DashboardElementReport,
            TokenAwareModel,
            SerializerHelper) {

    var formatDef = SerializerHelper.getReportToNodeMapping('format');
    var formatChildren = SerializerHelper.getChildrenNames('format');

    function createElementNodeFromReport($element, reportProperties, options) {
        var settings = elementSerializerSettings(reportProperties, options);
        if (!$element) {
            $element = XML.$tag(settings.type);
        }
        $element = updateExistingElementNode($element, settings, options);
        return $element;
    }

    function createElementNode(elementState, state, options) {
        if (elementState.getState().type == 'html') {
            return createHtmlElementNode(elementState, options);
        }
        var $element = SerializerHelper.getOriginalXMLIfNotDirty(elementState, function(originalXML) {
            var reportContent = elementState.getState();
            var $element = createElementNodeFromReport(originalXML ? XML.$node(originalXML) : null, reportContent, options);
            return $element;
        }, options);
        _clearElementSearch($element);
        var searchId = elementState.getState()['dashboard.element.managerid'];
        if (searchId && searchId != 'global') {
            var $search = SearchSerializer.createSearchNode(state.searches.get(searchId), state, options);
            XML.inject({
                node: $search,
                container: $element,
                where: 'after',
                selectors: ['title'],
                fallback: 'prepend'
            });
        }
        elementState.setXML(XML.serialize($element));
        return $element;
    }

    function createHtmlElementNode(elementState, options) {
        return SerializerHelper.getOriginalXMLIfNotDirty(elementState, function() {
            return XML.$node('<html encoded="1"></html>').text(elementState.getState().html);
        });
    }

    function applyGenericElementSettings(report, settings, vizType, options) {
        var parserConfig = DashboardParser.getDefault().findNodeDefinitions(function(def){
            return def['extends'] == 'element' && def.name == vizType;
        });
        if (parserConfig.length) {
            var elementConfig = parserConfig[0];
            _(elementConfig.options).each(function(optionConfig){
                if (optionConfig.reportProperty.indexOf('dashboard.element.') === 0 && optionConfig.name !== 'title') {
                    var value = report.get(optionConfig.reportProperty, options);
                    if (value != null) {
                        settings.options[optionConfig.name] = value;
                    }
                }
            });
        }
    }
    
    function elementSerializerSettings(reportContent, options) {
        options || (options = {});
        var vizType = options.vizType || DashboardElementReport.getVizTypeFromReportContent(reportContent);
        var settings = {
            type: vizType,
            title: reportContent['dashboard.element.title'],
            options: {},
            tags: {}
        };
        if (options && options.searchType != 'saved') {
            var applyTypeSettings = TypeMapper[vizType];
            if (applyTypeSettings) {
                var model = new TokenAwareModel(reportContent, options);
                applyGenericElementSettings(model, settings, vizType, options);
                applyTypeSettings(model, settings, options);
            }
        }
        return settings;
    }

    var TypeMapper = {
        chart: function(report, result, options) {
            var chartingPrefix = 'display.visualizations.charting.', vizPrefix = 'display.visualizations.';
            _(report.toJSON(options)).each(function(value, key) {
                if (key.substring(0, chartingPrefix.length) === chartingPrefix) {
                    result.options[key.substring(vizPrefix.length)] = report.get(key, options);
                }
            });
            var height = report.get('display.visualizations.chartHeight', options);
            if (height && options.omitHeight !== true) {
                result.options.height = height;
            }
        },
        event: function(report, result, options) {
            var eventsPrefix = 'display.events.';
            result.options.count = report.get('display.prefs.events.count', options);
            _(report.toJSON(options)).chain().omit(eventsPrefix + 'histogram', eventsPrefix + 'fields').each(function(v, key) {
                if (key.indexOf(eventsPrefix) === 0) {
                    var value = report.get(key, options);
                    if (_.isArray(value)) {
                        value = JSON.stringify(value);
                    }
                    result.options[key.substring(eventsPrefix.length)] = (value != null) ? String(value) : null;
                }
            });
            if (result.options['table.drilldown']) {
                result.options['table.drilldown'] =
                    SplunkUtil.normalizeBoolean(result.options['table.drilldown']) ? 'all' : 'none';
            }
        },
        map: function(report, result, options) {
            var mappingPrefix = 'display.visualizations.mapping.', vizPrefix = 'display.visualizations.';
            _(report.toJSON()).each(function(value, key) {
                if (key.indexOf(mappingPrefix) === 0) {
                    result.options[key.substring(vizPrefix.length)] = report.get(key, options);
                }
            });
            if (!(options || {}).pdf) {
                // Excluding 'mapping.data.bounds' when we don't generate XML for pdfgen
                delete result.options['mapping.data.bounds'];
            }
            if (result.options['mapping.drilldown']) {
                result.options.drilldown = DrilldownHelper.getNormalizedDrilldownType(
                    result.options['mapping.drilldown'],
                    {allowBoolean: true}
                );
                delete result.options['mapping.drilldown'];
            }
            var height = report.get('display.visualizations.mapHeight', options);
            if (height && options.omitHeight !== true) {
                result.options.height = height;
            }
        },
        single: function(report, result, options) {
            var prefix = 'display.visualizations.singlevalue.';
            _(report.toJSON(options)).each(function(v, k) {
                if (k.substring(0, prefix.length) === prefix) {
                    result.options[k.substring(prefix.length)] = v;
                }
            });
            if (result.options.drilldown) {
                result.options.drilldown = DrilldownHelper.getNormalizedDrilldownType(result.options.drilldown, {'default': 'none'});
            }
            var height = report.get('display.visualizations.singlevalueHeight', options);
            if (height && options.omitHeight !== true) {
                result.options.height = height;
            }
        },
        table: function(report, result, options) {
            result.options.wrap = SplunkUtil.normalizeBoolean(report.get('display.statistics.wrap', options));
            result.options.rowNumbers = SplunkUtil.normalizeBoolean(report.get('display.statistics.rowNumbers', options));
            result.options.dataOverlayMode = report.get('display.statistics.overlay', options);
            if (report.get('display.statistics.drilldown', options)) {
                result.options.drilldown = DrilldownHelper.getNormalizedDrilldownType(
                    report.get('display.statistics.drilldown', options),
                    {validValues: ['cell', 'row', 'none'], 'default': 'cell', aliasMap: {all: 'cell', off: 'none'}});
            }
            result.options.totalsRow = SplunkUtil.normalizeBoolean(report.get('display.statistics.totalsRow', options));
            result.options.percentagesRow = SplunkUtil.normalizeBoolean(report.get('display.statistics.percentagesRow', options));
            result.options.count = report.get('display.prefs.statistics.count', options);

            result.options.labelField = null;
            result.options.valueField = null;


            //todo, remove me if sparkline migrated to new format syntax
            result.sparkline = report.get('display.statistics.sparkline.format', options);

            result.format = [];
            var reportContent = report.toJSON({tokens: true});
            var prefix = "display.statistics.format";
            var idxStart = prefix.split('.').length;
            _.each(reportContent, function(value, key, object) {
                if (key.indexOf(prefix) == 0) {
                    var temp = key.split(".");
                    var idx = parseInt(temp[idxStart], 10);
                    result.format[idx] = result.format[idx] || {};
                    result.format[idx][temp.slice(idxStart + 1).join(".")] = value;
                }
            });
            var fields = report.get('display.statistics.fields', options);
            result.tags.fields = _.isArray(fields) ?
                (_.isEmpty(fields) ? null : JSON.stringify(fields)) :
                (fields === '[]' ? null : fields);
        },
        viz: function(report, result, options) {
            var type = report.get('display.visualizations.custom.type');
            var prefix = 'display.visualizations.custom.';
            _(report.toJSON(options)).each(function(value, key) {
                if (key.substring(0, prefix.length + type.length) === (prefix + type)) {
                    result.options[key.substring(prefix.length)] = report.get(key, options);
                }
            });
            result.attributes = _.extend({type: type}, result.attributes);
            var height = report.get('display.visualizations.custom.height', options);
            if (height && options.omitHeight !== true) {
                result.options.height = height;
            }
        }
    };

    /*
     * Dashboard element helpers
     * 
     * Elements in the XML are updated using a simple settings structure. All parts of this structure are optional.
     *
     * {
     *      title: (String) the element title, in case of falsy values, the title is removed 
     *      type: (String) the element type (one of "table", "chart", "single", "map", "list", "html")
     *      search: (Object) {
     *          type: (String) one of 'inline', 'saved' or 'pivot'
     *          search: (String) the search string (for inline)
     *          earliest_time: (String) the earliest_time of the inline search
     *          latest_time: (String) the latest_time of the inline search
     *          name: (String) name of the saved search
     *      }
     *      options: (Object) options to added (or replaced) to the element (<option name="$name$">$value$</option>)
     *      removeOptions: (Array) options to be removed from the xml element
     *      tags: (Object) tags to be added to (or replaced) the element (<$tag$>$value$</$tag$>)
     *      tokenDependencies: (Object) containing depends or rejects properties
     * }
     *
     */

    /**
     * Update an element based on the given existing XML node and a new set of settings. This creates a new XML node.
     *
     * @param curNode - the existing element XML node
     * @param settings - new settings to apply
     * @param options - options
     * @returns {*} the new XML node
     */
    function updateExistingElementNode(curNode, settings, options) {
        var newNode = XML.$tag(settings.type);

        if (settings.search) {
            // Find all search eventhandler nodes based on our parser config
            var nodeDefs = DashboardParser.getDefault().findNodeDefinitions(function(def) { return def['extends'] === 'search-eventhandler'; });
            var selector = _(nodeDefs).chain().pluck('tagName').unique().value().join(',');
            var searchEventHandlerNodes = $(curNode).children('search').children(selector).detach();
            if (searchEventHandlerNodes.length) {
                settings.search = _.extend({eventHandlerNodes: searchEventHandlerNodes}, settings.search);
            }
        }

        XML.moveChildren(curNode, newNode);

        _(['id', 'depends', 'rejects']).each(function(attr) {
            var val = $(curNode).attr(attr);
            if (val) {
                newNode.attr(attr, val);
            }
        });

        return updateElementNode(newNode, settings, options);
    }

    /**
     * Update the given XML node an apply the settings
     *
     * @param elementNode - the new element XML node which will be updated
     * @param settings - settings to apply
     * @param options - options
     * @returns {*} the XML node (elementNode)
     */
    function updateElementNode(elementNode, settings, options) {
        if (options && options.clearOptions) {
            elementNode.children('option').remove();
            delete settings.options;
        }

        if (settings.tokenDependencies) {
            _(['depends', 'rejects']).each(function(prop) {
                var val = settings.tokenDependencies[prop];
                if (val) {
                    elementNode.attr(prop, val);
                }
            });
        }

        _applyElementTitle(elementNode, settings);
        if (settings.search && settings.search.type !== 'global') {
            _applyElementSearch(elementNode, settings);
        }
        _applyElementOptions(elementNode, settings);
        _applyFormatOptions(elementNode, settings);
        //todo, remove me if sparkline migrated to new format syntax
        _applySparklineOptions(elementNode, settings);
        _applyElementTags(elementNode, settings);
        _applyElementAttributes(elementNode, settings);
        // Move drilldown to the end of the element node
        elementNode.children('drilldown').detach().appendTo(elementNode);
        return elementNode;
    }

    function eachPropertySorted(object, iteratee) {
        if (object) {
            _.each(_.keys(object).sort(), function(key) {
                iteratee(object[key], key, object);
            });
        }
    }
    
    function _applyElementAttributes(newNode, settings) {
        if (settings.attributes) {
            eachPropertySorted(settings.attributes, function(value, name) {
                newNode.attr(name, value);
            });
        }
    }

    function _applyElementTitle(newNode, settings) {
        var titleNode = newNode.find('title');
        if (settings.title) {
            if (!titleNode.length) {
                titleNode = XML.$node('<title/>').prependTo(newNode);
            }
            titleNode.text(settings.title);
        } else {
            titleNode.remove();
        }
    }

    function _applyElementTags(newNode, settings) {
        if (settings.tags) {
            eachPropertySorted(settings.tags, function(value, tag) {
                newNode.find(tag).remove();
                if ((_.isArray(value) && value.length) || value) {
                    XML.$node('<' + tag + '/>').text(value).appendTo(newNode);
                }
            });
        }
    }

    function _applyElementOptions(newNode, settings) {
        // remove existing options
        newNode.find('option').remove();
        if (settings.options) {
            console.log('Applying options', settings.options);
            eachPropertySorted(settings.options, function(value, name) {
                var curOption = newNode.find('option[name="' + name + '"]');
                // do not modify the current options if value is undefined
                if (value === "" || value === null) {
                    curOption.remove();
                } else if (!_.isUndefined(value)) {
                    if (curOption.length) {
                        curOption.text(value);
                    } else {
                        XML.$node('<option/>').attr('name', name).text(value).appendTo(newNode);
                    }
                }
            });
        }
    }

    function _applySparklineOptions(newNode, settings) {
        newNode.find('format[type="sparkline"]').remove();
        if (settings.sparkline) {
            _.each(settings.sparkline, function(value, name) {
                var $node = XML.$node('<format/>').attr('field', name).attr('type', 'sparkline').appendTo(newNode);
                _.each(settings.sparkline[name], function(optionValue, optionName) {
                    if (_.contains(['colorMap', 'valueSpots'], optionName)) {
                        var $option = XML.$node('<option/>').attr('name', optionName).appendTo($node);
                        var subOption = settings.sparkline[name][optionName];
                        if (_.isArray(subOption)) {
                            $option.text(JSON.stringify(subOption));
                        }
                        else {
                            _.each(subOption, function(subOptionValue, subOptionName) {
                                XML.$node('<option/>').attr('name', subOptionName).text(subOptionValue).appendTo($option);
                            });
                        }
                    }
                    else {
                        XML.$node('<option/>').attr('name', optionName).text(optionValue).appendTo($node);
                    }
                });
            });
        }
    }

    function _applyFormatOptions(newNode, settings) {
        newNode.find('format').remove(); //remove all format node, we will re-create them according to reportContent
        newNode.find('option[name^="format."]').remove();   //remove all <option name="format.XXXX"> node
        if (settings.format) {
            _.each(settings.format, function(element, idx) {
                if (!element[""]) {
                    //if format do not have type (i.e. property name empty string ""), ignore that format.
                    return;
                }
                var $node = XML.$node('<format/>').appendTo(newNode);
                eachPropertySorted(element, function(value, key) {
                    //SPL-119809: ignore null value and empty strings
                    if (value) {
                        var k = key ? "." + key : key;
                        var optionDesc = formatDef[k];
                        if (optionDesc) {
                            var keys = key ? key.split(".") : [key];
                            var $targetNode = $node;
                            if (_.contains(formatChildren, keys[0])) {
                                //for now we only support these two child node under format, improve this if we add the scope.
                                $targetNode = $node.find(keys[0]);
                                if ($targetNode.length == 0) {
                                    $targetNode = XML.$tag(keys[0]).appendTo($node);
                                }
                            }
                            value = SerializerHelper.prepareValueWithType(value, optionDesc.dataType);
                            switch (optionDesc.valueType) {
                                case "attribute":
                                    $targetNode.attr(optionDesc["name"], value);
                                    break;
                                case "content":
                                    $targetNode.text(value);
                                    break;
                                // case "option":
                                default:
                                    var $optionNode = XML.$tag("option").attr("name", optionDesc["name"]).appendTo($targetNode);
                                    if ($.isPlainObject(value)) {
                                        _.each(value, function(v, k) {
                                            XML.$tag("option").attr("name", k).text(v).appendTo($optionNode);
                                        });
                                    } else {
                                        $optionNode.text(value);
                                    }
                                    break;
                            }

                        } else {
                            //handle the case for those unknown options
                            XML.$tag("option").attr("name", key).text(value).appendTo($node);
                        }
                    }
                });
            });
        }
    }

    function _clearElementSearch(elementNode) {
        // Clear current search info
        var searchNodeSelector = 'searchString,searchTemplate,searchName,searchPostProcess,pivotSearch,earliestTime,latestTime,search';
        elementNode.children(searchNodeSelector).remove();
    }

    function _applyElementSearch(newNode, settings) {
        if (settings.search) {
            settings.search = _.extend({searchId: newNode.children('search').attr('id')}, settings.search);
            _clearElementSearch(newNode);
            var searchNode = SearchSerializer.createSearchNode(settings.search);
            if (searchNode) {
                var titleNode = newNode.find('title');
                if (titleNode.length) {
                    searchNode.insertAfter(titleNode);
                } else {
                    searchNode.prependTo(newNode);
                }
            }
        }
    }

    return {
        createElementNodeFromReport: createElementNodeFromReport,
        createElementNode: createElementNode,
        _updateExistingElementNode: updateExistingElementNode,
        _updateElementNode: updateElementNode,
        _createElementNode: createElementNode
    };

});