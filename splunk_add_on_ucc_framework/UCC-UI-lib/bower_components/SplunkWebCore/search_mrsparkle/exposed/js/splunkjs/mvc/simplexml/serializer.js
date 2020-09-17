define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('../../mvc');
    var GeneralUtils = require('util/general_utils');
    var Mapper = require('./mapper');
    var console = require('util/console');
    var XML = require('util/xml');
    var DashboardParser = require('./parser');
    //
    // Dashboard XML serializations helper
    // ===================================
    //

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
     *          name: (String) name of the saved search,
     *          sample_ratio: (String)
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
            elementNode.find('option').remove();
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
        _applyElementTags(elementNode, settings);
        _applyElementAttributes(elementNode, settings);
        _applyElementContent(elementNode, settings);
        _applySparklineOptions(elementNode,settings);
        return elementNode;
    }

    /**
     * Creates a new element XML node based on the given settings
     *
     * @param settings - settings to apply to the new element XML node
     * @param options - options
     * @returns {*} the new element XML node
     */
    function createElementNode(settings, options) {
        var newNode = XML.$tag(settings.type);
        updateElementNode(newNode, settings, options);
        return newNode;
    }

    /**
     * Create a new element XML node for the component (from splunkjs.mvc.Components registry) with the given ID
     *
     * @param id - ID of the component to serialize
     * @param options - options
     * @returns {*} the new element XML node
     */
    function createElementNodeForID(id, options) {
        var component = mvc.Components.get(id);
        if (!component) {
            throw new Error('Element ' + id + ' not found');
        }
        var mapper = Mapper.get(component.getVisualizationType());
        var settings = mapper.toXML(component.model, options);
        return createElementNode(settings, options);
    }

    /**
     * Create a new element node for the given settings and append it to the given dashboard XML document
     * (including row/panel structure)
     *
     * @param $xml - the dashboard XML document
     * @param settings - settings to apply to the new element XML node
     * @param options - options
     * @returns {*} - the dashboard XML document
     */
    function insertNewElement($xml, settings, options) {
        var row = XML.$node('<row />');
        var panel = XML.$node('<panel />').appendTo(row);
        createElementNode(settings, options).appendTo(panel);
        XML.root($xml).append(row);
        return $xml;
    }

    function _applyElementAttributes(newNode, settings) {
        if (settings.attributes) {
            _.each(settings.attributes, function(value, name) {
                newNode.attr(name, value);
            });
        }
    }

    function _applyNodeContentAsXML(node, content) {
        try {
            var ctStr = '<ct>' + content + '</ct>';
            var ct = XML.$node(ctStr);
            if (XML.serialize(ct) !== ctStr) {
                // If the content is altered by the browser XML parser or serializer, we instead wrap it in
                // a CDATA section. This only happens in certain browsers, such as Phantom.js
                return false;
            }
            XML.moveChildren(ct, node);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    function _applyNodeContentAsCDATA(node, content) {
        node.append(XML.cdata(content)).attr('encoded', 'true');
    }
    
    function _applyElementContent(newNode, settings) {
        if (settings.content !== undefined) {
            newNode.empty();
            if (settings.content) {
                if (settings.cdata) {
                    newNode.append(XML.cdata(settings.content)).attr('encoded', 'true');
                } else {
                    if (!_applyNodeContentAsXML(newNode, settings.content)) {
                        _applyNodeContentAsCDATA(newNode, settings.content);
                    }
                }
            }
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
            _.each(settings.tags, function(value, tag) {
                newNode.find(tag).remove();
                if ((_.isArray(value) && value.length) || value) {
                    XML.$node('<' + tag + '/>').text(value).appendTo(newNode);
                }
            });
        }
    }

    function _applyElementOptions(newNode, settings) {
        if (settings.options) {
            console.log('Applying options', settings.options);
            _.each(settings.options, function(value, name) {
                var curOption = newNode.find('option[name="' + name + '"]');
                if (value === "" || value === null || value === void(0)) {
                    curOption.remove();
                } else {
                    if (curOption.length) {
                        curOption.text(value);
                    } else {
                        XML.$node('<option/>').attr('name', name).text(value).appendTo(newNode);
                    }
                }
            });
        }
        if (settings.removeOptions) {
            _(settings.removeOptions).each(function(name) {
                newNode.find('option[name="' + name + '"]').remove();
            });
        }
    }

    function _applySparklineOptions(newNode, settings) {
        if (settings.sparkline) {
            _.each(settings.sparkline, function (value, name) {
                var $node = XML.$node('<format/>').attr('field', name).attr('type', 'sparkline').appendTo(newNode);
                _.each(settings.sparkline[name], function (optionValue, optionName) {
                    if (_.contains(['colorMap', 'valueSpots'], optionName)) {
                        var $option = XML.$node('<option/>').attr('name', optionName).appendTo($node);
                        var subOption = settings.sparkline[name][optionName];
                        if (_.isArray(subOption)) {
                            $option.text(JSON.stringify(subOption));
                        }
                        else {
                            _.each(subOption, function (subOptionValue, subOptionName) {
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

    function _clearElementSearch(elementNode) {
        // Clear current search info
        var searchNodeSelector = 'searchString,searchTemplate,searchName,searchPostProcess,pivotSearch,earliestTime,latestTime,search';
        elementNode.children(searchNodeSelector).remove();
    }
    
    function _applyElementSearch(newNode, settings) {
        if (settings.search) {
            settings.search = _.extend({ id: newNode.children('search').attr('id') }, settings.search);
            _clearElementSearch(newNode);
            var searchNode = createSearchNode(settings.search);
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

    /*
     * Dashboard input helpers
     */


    /**
     * Creates a new node based on the current nodes and updates it using the given settings
     * 
     * @param curNode - the current node representing the input to be updated
     * @param settings - new settings to apply to the new input node 
     * @param options - options
     * @returns {*} the newly created and updated input node
     */
    function updateExistingInputNode(curNode, settings, options) {
        var newNode = XML.clone(curNode);
        return updateInputNode(newNode, settings, options);
    }

    /**
     * Updated the given input node with new settings.
     * 
     * @param $input - the input node to update
     * @param settings - new settings to apply to the input node 
     * @param options - options
     * @returns {*} - the updated input node (same as $input param)
     */
    function updateInputNode($input, settings, options) {
        $input.attr('type', settings.type);
        $input.attr('token', settings.token || null);
        $input.attr('searchWhenChanged', settings.searchWhenChanged != null ?
            String(GeneralUtils.normalizeBoolean(settings.searchWhenChanged)) : null);

        _applyInputLabel(settings, $input, options);
        _applyInputStaticChoices(settings, $input, options);
        _applyInputPopulatingSearch($input, settings, options);
        _applyInputDefaultValue($input, settings, options);
        _applyInputSettings($input, settings, options);
        return $input;
    }

    /**
     * Create a new input node using the given settings.
     * 
     * @param settings - settings to apply to the newly created input node
     * @param options - options
     * @returns {*} - the newly created input node
     */
    function createInputNode(settings, options) {
        var $input = XML.$node('<input />');
        return updateInputNode($input, settings, options);
    }

    /**
     * Create a new input node for the component with the given ID. The component is retrieved using the 
     * splunkjs.mvc.Components registry.
     * 
     * @param id - ID of the input component
     * @param options - options
     * @returns {*} - the newly created input node
     */
    function createInputNodeForID(id, options) {
        var input = mvc.Components.get(id);
        var inputNode = XML.$node('<input />');
        return updateInputNode(inputNode, input.settings.toJSON(options), options);
    }


    function _applyInputLabel(settings, $input, options) {
        // set the label if it is different than the token name
        var label = $.trim(settings.label);
        if (label !== undefined && label !== settings.token) {
            XML.replaceOrPrepend({ node: XML.$node('<label/>').text(label), selector: 'label', container: $input });
        } else {
            $input.children('label').remove();
        }
    }

    function _applyInputStaticChoices(settings, $input, options) {
        if (settings.choices && settings.choices.length) {
            var newChoices = _(settings.choices).map(function(choice) {
                return XML.$node('<choice/>').attr('value', choice.value).text(choice.label);
            });
            XML.replaceOrAppend({ node: newChoices, container: $input, selector: 'choice' });
        } else {
            $input.children('choice').remove();
        }
    }

    function _applyInputDefaultValue($input, settings, options) {
        var defaultValue = settings['default'];
        if (defaultValue && !(_.isArray(defaultValue) && defaultValue.length === 0)) {
            // default is a named node
            var defaultNode = XML.$node('<default/>');
            if (settings.type == 'time') {
                XML.$node('<earliest></earliest>').text((defaultValue.earliest_time == null) ? '' : defaultValue.earliest_time).appendTo(defaultNode);
                XML.$node('<latest></latest>').text((defaultValue.latest_time == null) ? '' : defaultValue.latest_time).appendTo(defaultNode);
            } else if (_.isArray(defaultValue)) {
                defaultNode.text(_serializeCSVString(defaultValue));
            } else {
                defaultNode.text(defaultValue);
            }
            XML.replaceOrAppend({ node: defaultNode, selector: 'default', container: $input });
        } else {
            $input.children('default').remove();
        }
    }
    
    function _serializeCSVString(list) {
        return _.map(list, function(part){
            return /[,\r\n""]/.test(part) ? '"' + part.replace(/"/g, '""') + '"' : part;
        }).join(',');
    }

    function _applyInputSettings($input, settings, options) {
        _(['prefix', 'suffix', 'seed', 'initialValue', 'valuePrefix', 'valueSuffix', 'delimiter']).each(function(option) {
            var val = settings[option];
            if (val && !(_.isArray(val) && val.length === 0)) {
                var node = XML.$tag(option).text(val);
                XML.replaceOrAppend({ node: node, container: $input, selector: option });
            } else {
                $input.children(option).remove();
            }
        });
    }

    function _removeInputPopulatingSearch($input) {
        $input.children('populatingSavedSearch,populatingSearch,search,fieldForLabel,fieldForValue').remove();
    }
    
    function _applyInputPopulatingSearch($input, settings, options) {
        var $search;
        var existingSearchID = $input.children('search').attr('id');
        if (settings.searchType === 'saved') {
            if (!settings.searchName) {
                return _removeInputPopulatingSearch($input);
            }
            $search = createSearchNode({
                id: existingSearchID,
                type: 'saved',
                name: settings.searchName
            });
        } else if (settings.searchType === 'postprocess'){
            if (!settings.search) {
                return _removeInputPopulatingSearch($input);
            }
            $search = createSearchNode(_.extend({
                id: existingSearchID,
                type: 'postprocess',
                base: settings.basesearch
            }, _.pick(settings, 'search')));
        } else {
            if (!settings.search) {
                return _removeInputPopulatingSearch($input);
            }
            $search = createSearchNode({
                id: existingSearchID,
                type: 'inline',
                earliest_time: settings.populating_earliest_time,
                latest_time: settings.populating_latest_time,
                search: settings.search
            });
        }

        XML.replaceOrAppend({ node: $search, container: $input, selector: 'populatingSavedSearch,populatingSearch,search'});
        
        if (settings.labelField) {
            XML.replaceOrAppend({
                node: XML.$tag('fieldForLabel').text(settings.labelField),
                container: $input, 
                selector: 'fieldForLabel'
            });
        } else {
            $input.children('fieldForLabel').remove();
        }
        if (settings.valueField) {
            XML.replaceOrAppend({
                node: XML.$tag('fieldForValue').text(settings.valueField),
                container: $input, 
                selector: 'fieldForValue'
            });
        } else {
            $input.children('fieldForValue').remove();
        }
    }

    /*
     Dashboard structure
     */

    /**
     * Creates the XML representation of the current dashboard state
     *
     * @param {Object} dashboardStructure - the current dashboard state
     * @param {Object} options - options
     *
     * Options:
     * {
     *     label (String) - the dashboard label to use
     *     description (String) - the dashboard description to use
     *     serializeInputs (boolean) - whether to include inputs in the serialized dashbaord output (default is false)
     *     tokens (boolean) -  whether the generated XML source should contain tokens or their values
     *     indent (boolean) - whether to generated pretty-printed XML or not
     * }
     *
     * @returns {String} the serialized dashboard
     */
    function createFlattenedDashboardXML(dashboardStructure, options) {
        options = _.extend({
            serializeInputs: false,
            tokens: false,
            indent: false
        }, options);
        if (!dashboardStructure) {
            throw new Error('Cannot create flattened XML without the item order being captured first');
        }
        options = options || {};

        var dashboard = XML.parse('<dashboard/>');
        var root = XML.root(dashboard);
        XML.$node('<label/>').text(options.label).appendTo(root);
        if ($.trim(options.description)) {
            XML.$node('<description/>').text(options.description).appendTo(root);
        }

        dashboard = serializeDashboardStructure(dashboard, dashboardStructure, _.extend({
            tokens: false,
            flatten: true,
            includeFormElements: !!options.serializeInputs
        }, options));

        return XML.serializeDashboardXML(dashboard, options.indent);
    }

    /**
     * Serialize the given panel structure into a new XML node
     *
     * @param panelStructure {Object} the panel structure object
     * @param options - options
     *
     * Options: {
     *      createMissingElements (boolean) - create XML nodes for elements that don't yet exist in the XML (default is true)
     *      createMissingInputs (boolean) - create XML nodes for inputs that don't yet exist in the XML (default is true)
     *      includeFormElements (boolean) - include fieldset and form information in the resulting XML document
     *      itemMap (Object) - object containing the existing XML nodes of elements (element IDs are the keys)
     *      inputMap (Object) - object containing the existing XML nodes of inputs (element IDs are the keys)
     *      structureMap (Object) - object containing the existing XML nodes of both elements and inputs (IDs are the keys)
     *      tokens (boolean) - whether the output should contain tokens, default is true
     * }
     */
    function serializePanelStructure(panelStructure, options) {
        options || (options = {});
        var itemMap = _.extend({}, options.structureMap, options.itemMap);
        var inputMap = _.extend({}, options.structureMap, options.inputMap);

        var $panel = XML.$node('<panel/>');
        if (panelStructure.ref) {
            $panel.attr('ref', panelStructure.ref);
            if (panelStructure.app) {
                $panel.attr('app', panelStructure.app);
            }
        } else {
            _(panelStructure.elements).each(function(elementId) {
                var item = itemMap[elementId];
                if (!item) {
                    if (options.createMissingElements !== false) {
                        item = createElementNodeForID(elementId, options);
                    } else {
                        var msg = 'Element ' + elementId + ' not found in XML';
                        if (options.failIfComponentNotFound) {
                            throw new Error(msg);
                        } else {
                            console.warn(msg);
                        }
                        return;
                    }
                }
                $(item).find('script').remove();
                $panel.append(item);
            });

            if (options.includeFormElements !== false) {
                _(panelStructure.inputs).chain().clone().reverse().each(function(inputId) {
                    var inputNode = inputMap[inputId];
                    if (inputNode) {
                        $(inputNode).find('script').remove();
                    } else if (options.createMissingInputs !== false) {
                        inputNode = createInputNodeForID(inputId, options);
                    } else {
                        var msg = 'Input ' + inputId + 'not found in XML';
                        if (options.failIfComponentNotFound) {
                            throw new Error(msg);
                        } else {
                            console.warn(msg);
                        }
                        return;
                    }
                    $($panel).prepend(inputNode);
                });
            }
        }

        if ($.trim(panelStructure.title)) {
            XML.$node('<title />').text(panelStructure.title).prependTo($panel);
        }
        
        if (panelStructure.id) {
            $panel.attr('id', panelStructure.id);
        }
        
        if (panelStructure.tokenDependencies) {
            if (panelStructure.tokenDependencies.depends) {
                $panel.attr('depends', panelStructure.tokenDependencies.depends);
            }
            if (panelStructure.tokenDependencies.rejects) {
                $panel.attr('rejects', panelStructure.tokenDependencies.rejects);
            }
        }

        return $panel;
    }

    /**
     * Serialize the given dashboard structure and update the document
     *
     * @param $xml the current dashboard XML document
     * @param structure the dashboard structure
     * @param options - options
     *
     * Options: {
     *      createMissingElements (boolean) - create XML nodes for elements that don't yet exist in the XML (default is true)
     *      createMissingInputs (boolean) - create XML nodes for inputs that don't yet exist in the XML (default is true)
     *      includeFormElements (boolean) - include fieldset and form information in the resulting XML document
     *      itemMap (Object) - object containing the existing XML nodes of elements (element IDs are the keys)
     *      inputMap (Object) - object containing the existing XML nodes of inputs (element IDs are the keys)
     *      tokens (boolean) - whether the output should contain tokens, default is true
     * }
     */
    function serializeDashboardStructure($xml, structure, options) {
        options = _.extend({
            tokens: true,
            createMissingElements: true,
            createMissingInputs: true,
            includeFormElements: true,
            itemMap: {},
            inputMap: {},
            failIfComponentNotFound: true,
            moveGlobalSearches: true
        }, options);

        if (options.moveGlobalSearches) {
            // Move panel-level searches to the dashboard level in order to preserve them when re-creating the 
            // row/panel structure
            _moveGlobalSearches($xml);
        }

        var rootNode = XML.root($xml);
        rootNode.children('row').detach();

        _(structure.rows).each(function(row) {
            var rowNode = XML.$node('<row/>');
            _(row.panels).each(function(panelOrder) {
                var panel = serializePanelStructure(panelOrder, options);
                rowNode.append(panel);
            });
            if (row.id) {
                rowNode.attr('id', row.id);
            }
            if (row.tokenDependencies) {
                if (row.tokenDependencies.depends) {
                    rowNode.attr('depends', row.tokenDependencies.depends);
                }
                if (row.tokenDependencies.rejects) {
                    rowNode.attr('rejects', row.tokenDependencies.rejects);
                }
            }
            rootNode.append(rowNode);
        });

        if (options.includeFormElements) {
            // Update inputs in fieldset
            var fieldset = rootNode.children('fieldset');
            if (!fieldset.length) {
                fieldset = createFieldset($xml, options);
            }
            fieldset.children().detach();
            _(structure.fieldset).each(function(inputId) {
                var inputNode = options.inputMap[inputId];
                if (inputNode) {
                    $(inputNode).find('script').remove();
                } else if (options.createMissingInputs !== false) {
                    inputNode = createInputNodeForID(inputId);
                } else {
                    var msg = 'Input ' + inputId + 'not found in XML';
                    if (options.failIfComponentNotFound) {
                        throw new Error(msg);
                    } else {
                        console.warn(msg);
                    }
                    return;
                }
                fieldset.append(inputNode);
            });
            // remove the fieldset if it is empty
            if (fieldset.children().length == 0) {
                fieldset.remove();
            }
        }

        return $xml;
    }

    function _moveGlobalSearches($xml) {
        var root = XML.root($xml);
        root.find('row>panel>search').appendTo(root);
    }
    
    /*
     Global dashboard structure
     */

    /**
     * Migrates the root node tag name of the given dashboard XML document.
     *
     * @param $xml the dashboard XML document
     * @param tagName the new root tag name
     * @returns {*} undefined if the document already has the given root node name, otherwise the new XML document
     */
    function migrateViewType($xml, tagName) {
        if (!isViewOfType($xml, tagName)) {
            var curRoot = XML.root($xml);
            var newXML = XML.parse('<' + tagName + '/>');
            var newRoot = XML.root(newXML);
            var cur = curRoot[0];
            _(cur.attributes).each(function(attr) {
                newRoot.attr(attr.nodeName, attr.nodeValue);
            });
            XML.moveChildren(curRoot, newRoot);
            return newXML;
        }
    }

    function isViewOfType($xml, tagName) {
        var curRoot = XML.root($xml);
        return curRoot.prop('tagName') === tagName;
    }

    /**
     * Ensures there is a fieldset and the dashboard is of type "form". Also applies settings
     *
     * @param $xml - the dashboard XML document
     * @param settings - and object containing some of the following properties:
     *  - submitButton (boolean)
     *  - autoRun (boolean)
     *
     * @returns {*} the dashboard XML document
     */
    function updateFormSettings($xml, settings) {
        if (!isViewOfType($xml, 'form')) {
            $xml = migrateViewType($xml, 'form');
        }
        var fieldset = $xml.find('fieldset');
        if (!fieldset.length) {
            fieldset = createFieldset($xml);
        }
        if (settings.hasOwnProperty('submitButton')) {
            fieldset.attr('submitButton', String(settings.submitButton));
        }
        if (settings.hasOwnProperty('autoRun')) {
            fieldset.attr('autoRun', String(settings.autoRun));
        }
        return $xml;
    }

    /**
     * Ensure there is a fieldset node in the given dashboard XML and return it
     *
     * @param $xml the dashboard XML document
     * @param options - options
     * @returns {*} the jQuery wrapped fieldset node
     */
    function createFieldset($xml, options) {
        var root = XML.root($xml);
        var $fieldset = root.children('fieldset');
        if (!$fieldset.length) {
            $fieldset = XML.$node('<fieldset submitButton="false"></fieldset>');
            XML.inject({
                node: $fieldset,
                where: 'after',
                container: root,
                selectors: ['description', 'label'],
                fallback: 'prepend'
            });
        }
        return $fieldset;
    }

    /**
     * Apply a global search to the dashboard document.
     *
     * @param $xml the dashboard document
     * @param settings - global search settings to apply, for example:
     *
     * {
     *      "search": {
     *          "search": "index=_internal",
     *          "earliest_time": "-24h",
     *          "latest_time": "now"
     *      }
     * }
     */
    function applyGlobalSearch($xml, settings) {
        var root = XML.root($xml);
        root.children('searchTemplate,earliestTime,latestTime,search[id=global]').remove();
        var searchNode = createSearchNode(_.extend({ id: 'global' }, settings.search));
        XML.inject({ 
            node: searchNode, 
            container: root, 
            where: 'after', 
            selectors: ['label', 'description'], 
            fallback: 'prepend' 
        });
    }

    /**
     * Creates a new search node based on the given settings 
     * @param {Object} settings - simple object containg settings for the search to create
     * 
     * {
     *      type: inline|postprocess|saved
     *      search: the search string (for inline and postprocess)
     *      name: name of the saved search (for saved only)
     *      earliest_time: (for inline and saved)
     *      latest_time: (for inline and saved)
     *      base: ID of the base search (for postprocess only)
     * }
     * 
     * @returns {*} the newly created search node
     */
    function createSearchNode(settings) {
        var $search = XML.$node('<search/>');
        if (settings.earliest_time === "$earliest$") {
            settings.earliest_time = undefined;
        }
        if (settings.latest_time === "$latest$") {
            settings.latest_time = undefined;
        }

        if (settings.id) {
            $search.attr('id', settings.id);
        }
        switch (settings.type) {
            case 'inline':
                XML.$node('<query />').text(settings.search).appendTo($search);
                if (settings.earliest_time != null) {
                    XML.$node('<earliest />').text(settings.earliest_time).appendTo($search);
                }
                if (settings.latest_time!= null) {
                    XML.$node('<latest />').text(settings.latest_time).appendTo($search);
                }
                if (settings.sample_ratio != null) {
                    XML.$node('<sampleRatio />').text(settings.sample_ratio).appendTo($search);
                }
                break;
            case 'postprocess':
                XML.$node('<query />').text(settings.search).appendTo($search);
                $search.attr('base', settings.base || 'global');
                break;
            case 'saved':
                $search.attr('ref', settings.name);
                if (settings.earliest_time != null) {
                    XML.$node('<earliest />').text(settings.earliest_time).appendTo($search);
                }
                if (settings.latest_time!= null) {
                    XML.$node('<latest />').text(settings.latest_time).appendTo($search);
                }
                break;
            default:
                throw new Error('Invalid search type: ' + settings.type);
        }

        if (settings.eventHandlerNodes) {
            $search.append(settings.eventHandlerNodes);
        }

        return $search;
    }
    
    return {
        // Dashboard Element
        updateExistingElementNode: updateExistingElementNode,
        updateElementNode: updateElementNode,
        createElementNode: createElementNode,
        insertNewElement: insertNewElement,
        // Form inputs
        updateExistingInputNode: updateExistingInputNode,
        updateInputNode: updateInputNode,
        createInputNode: createInputNode,
        // Dashboard structure
        serializeDashboardStructure: serializeDashboardStructure,
        serializePanelStructure: serializePanelStructure,
        createFlattenedDashboardXML: createFlattenedDashboardXML,
        // Form
        migrateViewType: migrateViewType,
        updateFormSettings: updateFormSettings,
        createFieldset: createFieldset,
        // Searches
        createSearchNode: createSearchNode,
        applyGlobalSearch: applyGlobalSearch
    };

});