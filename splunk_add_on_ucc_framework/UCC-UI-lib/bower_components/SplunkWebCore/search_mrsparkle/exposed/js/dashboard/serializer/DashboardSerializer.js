define([
    'underscore',
    'jquery',
    'util/general_utils',
    'util/console',
    'util/xml',
    './RowColumnSerializer',
    './ElementSerializer',
    './SearchSerializer'
], function(_,
            $,
            GeneralUtils,
            console,
            XML,
            RowColumnSerializer,
            ElementSerializer,
            SearchSerializer) {

    /**
     * Add a new report to the current dashboard xml
     * @param reportProperties
     * @param $xml existing dashboard xml
     * @param options
     */
    function addReportToDashboard(reportProperties, $xml, options) {
        options || (options = {});
        _.defaults(options, {tokens: true});
        var searchSettings = {
            type: options.searchType || 'inline',
            name: options.searchName,
            earliest_time: reportProperties['dispatch.earliest_time'] || undefined,
            latest_time: reportProperties['dispatch.latest_time'] || undefined,
            search: reportProperties['search'],
            sampleRatio: reportProperties['dispatch.sample_ratio']
        };
        var $panel = RowColumnSerializer.appendPanelNode($xml, options);
        var $element = ElementSerializer.createElementNodeFromReport(null, reportProperties, options);
        var $search = SearchSerializer.createSearchNodeFromSetting(null, searchSettings, options);
        // put search on top
        $search.prependTo($element);
        $element.appendTo($panel);
        return $xml;
    }

    function applyDashboardState(state, xml, options) {
        options = _.extend({
            tokens: true,
            forceDirty: false,
            addGlobalSearches: false
        }, options);

        var $xml = XML.parse(xml);

        $xml = migrateViewType($xml, state.inputs.empty() ? 'dashboard' : 'form');

        if (state.dashboard.isDirty() || options.forceDirty) {
            applyLabelAndDescription($xml, state.dashboard.getState(), options);
        }

        RowColumnSerializer.applyRowColumnLayout(XML.root($xml), state, _.extend({flagUsedSearchStates: options.addGlobalSearches}, options));

        if (options.addGlobalSearches) {
            var globalSearches = _(state.searches.getStates()).filter(function(searchState) {
                return !searchState.usedFlag;
            });

            _(globalSearches).each(function(globalSearch) {
                insertGlobalSearchNode($xml, SearchSerializer.createSearchNode(globalSearch, state, options));
            });
        } else {
            moveGlobalSearches($xml);
        }
        
        return XML.serializeDashboardXML($xml, true);
    }

    function applyLabelAndDescription($xml, dashboardState, options) {
        var root = XML.root($xml);
        var newLabel = dashboardState.label;
        var newDescription = dashboardState.description;
        var rootNodeName = root[0].nodeName;
        var labelNode = root.find(rootNodeName + ">label");
        if (!labelNode.length) {
            labelNode = XML.$node("<label/>");
            labelNode.prependTo(root);
        }
        labelNode.text(newLabel);
        var descriptionNode = root.find(rootNodeName + ">description");
        if (!descriptionNode.length) {
            descriptionNode = XML.$node("<description/>");
            descriptionNode.insertAfter(labelNode);
        }
        if (newDescription) {
            descriptionNode.text(newDescription);
        } else {
            descriptionNode.remove();
        }
    }

    function moveGlobalSearches($xml) {
        var root = XML.root($xml);
        var searches = root.find('row>panel>search');
        if (searches.length) {
            insertGlobalSearchNode($xml, searches);
        }
    }
    
    function insertGlobalSearchNode($xml, $globalSearch) {
        XML.inject({
            node: $globalSearch,
            container: XML.root($xml),
            where: 'after',
            selectors: ['description', 'label'],
            fallback: 'prepend'
        });
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
        } else {
            return $xml;
        }
    }

    function isViewOfType($xml, tagName) {
        var curRoot = XML.root($xml);
        return curRoot.prop('tagName') === tagName;
    }

    return {
        addReportToDashboard: addReportToDashboard,
        applyDashboardState: applyDashboardState
    };

});