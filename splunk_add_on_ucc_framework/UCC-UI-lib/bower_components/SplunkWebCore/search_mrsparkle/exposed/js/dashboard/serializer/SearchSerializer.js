define([
    'underscore',
    'jquery',
    'util/xml'
], function(_,
            $,
            XML) {

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
        var searchNode = createSearchNode(_.extend({id: 'global'}, settings.search));
        XML.inject({
            node: searchNode,
            container: root,
            where: 'after',
            selectors: ['label', 'description'],
            fallback: 'prepend'
        });
    }

    function createSearchNodeFromSetting($search, settings, options) {
        if (!$search) {
            $search = XML.$tag('search');
        }
        $search.empty();
        switch (settings.type) {
            case 'inline':
                $search.removeAttr('ref');
                XML.$node('<query />').text(settings.search).appendTo($search);
                if (settings.earliest_time != null) {
                    XML.$node('<earliest />').text(settings.earliest_time).appendTo($search);
                }
                if (settings.latest_time != null) {
                    XML.$node('<latest />').text(settings.latest_time).appendTo($search);
                }
                if (settings.sampleRatio != null) {
                    XML.$node('<sampleRatio />').text(String(settings.sampleRatio)).appendTo($search);
                }
                break;
            case 'postprocess':
                $search.removeAttr('ref');
                XML.$node('<query />').text(settings.search).appendTo($search);
                $search.attr('base', settings.base || 'global');
                break;
            case 'saved':
                $search.attr('ref', settings.name);
                if (settings.earliest_time != null) {
                    XML.$node('<earliest />').text(settings.earliest_time).appendTo($search);
                }
                if (settings.latest_time != null) {
                    XML.$node('<latest />').text(settings.latest_time).appendTo($search);
                }
                break;
            default:
                throw new Error('Invalid search type: ' + settings.type);
        }
        if (settings.refresh) {
            XML.$node('<refresh/>').text(settings.refresh).appendTo($search);
            if (settings.refreshType) {
                XML.$node('<refreshType/>').text(settings.refreshType).appendTo($search);
            }
        }
        return $search;
    }

    function createSearchNode(searchState, state, options) {
        options || (options = {});
        if (options.flagUsedSearchStates) {
            searchState.usedFlag = true;
        }
        var originalXML = searchState.getOriginalXML();
        var $search = originalXML ? XML.$node(originalXML) : XML.$tag('search');

        if (searchState.isDirty() || !$search.is('search') || !originalXML) {
            var settings = searchState.getState();
            if (settings.searchId) {
                $search.attr('id', settings.searchId);
            } else if (searchState.isReferenced) {
                $search.attr('id', searchState.id);
            }
            createSearchNodeFromSetting($search, settings);
        }
        searchState.setXML(XML.serialize($search));
        return $search;
    }

    return {
        createSearchNodeFromSetting: createSearchNodeFromSetting,
        createSearchNode: createSearchNode,
        applyGlobalSearch: applyGlobalSearch
    };
});