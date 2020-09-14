/**
 * @author Leo
 *
 * Produces a JSON object containing necessary data to construct an app's navigation menu.
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'splunk.util',
    'util/xml'
],
function (
    $,
    _,
    Backbone,
    splunk_util,
    XML
){
    var app,
        views,
        rootEndpoint,
        searches,
        nav,
        seenViews = [],
        seenSearches = [];

    /**
     * Filters the collection to models belonging to the current app, optionally with name matching a string and
     * optionally among those that haven't been processed yet.
     *
     * @param collection Input collection
     * @param match {String} optional String to match
     * @param seen {Array} optional list of already processed objects that should be skipped
     * @return {Array} filtered array of models
     */
    function getMatchingItems(collection, match, seen) {
        return collection.filter(function(it) {
            var itApp =  it.entry.acl.get('app'),
                itName = it.entry.get('name'),
                isGlobal = it.entry.acl.get('sharing') === 'global';
            if (!isGlobal && itApp !== app) {
                return false;
            }
            if (match) {
                return (itName.toLowerCase().indexOf(match.toLowerCase())>-1 && !(seen && seen.indexOf(app+'/'+itName)>-1));
            } else {
                return !(seen && seen.indexOf(app+'/'+itName)>-1);
            }
        });
    }

    /**
     * Searches views collection for a view name to get its label
     *
     * @param name {String} view name
     * @return {Object} containing view label
     */
    function getViewProps(viewName) {
        var obj, view, i, v;
        views = views || [];
        for (i=0; i<views.length; i++) {
            v = views.at(i);
            if (v.entry.get('name').toLowerCase() === viewName.toLowerCase()) {
                // allow either a view local to the current app
                if (v.entry.acl.get('app') == app) {
                    view = v;
                    break; // local views have priority over global ones

                // or a globally shared view from another app
                } else if (v.entry.acl.get('sharing') == 'global') {
                    view = v;
                }
            }
        }

        if (view) {
            if (!view.entry.content.get('isVisible')) {
                return false;
            }
            // LIGHT-2148: we need to localize, mark for i18n the label when parsing XML file.
            obj = {
                label: _(view.entry.content.get('label')).t() || viewName,
                uri: splunk_util.make_url('app', app, viewName),
                viewName: viewName,
                app: app
            };
        } else {
            return false;
        }
        return obj;
    }

    /**
     * Searches saved searches collection for a search name to get its properties
     * @param name {String} search name
     * @return {Object} containing search properties
     */
    function getSavedProps(name) {
        var obj,
            saved = searches.find(function(s) {
                return (s.entry.get('name').toLowerCase() === name.toLowerCase());
            });
        if (saved) {
            obj = {
                uri: splunk_util.make_full_url('app/'+encodeURIComponent(app)+'/@go', {'s': saved.id}),
                sharing: saved.get('sharing'),
                label: name,
                reportUri: splunk_util.make_full_url('app/'+encodeURIComponent(app)+'/report', {'s': saved.id})
            };
            if (saved.entry.content.get('request.ui_dispatch_view')) {
                obj.dispatchView = saved.entry.content.get('request.ui_dispatch_view');
            }
        } else {
            return false;
        }
        return obj;
    }

    function sanatizeHref(href){
        if(typeof href !== 'string'){
            return false;
        }
        var decodedhref = $("<div></div>").html(href).text();
        decodedhref = window.decodeURI(decodedhref);
        decodedhref = decodedhref.replace(/(\r\n|\n|\r|\s)/gm,'').toLowerCase();
        if(decodedhref.indexOf(':') > -1 &&
            decodedhref.indexOf('javascript:') > -1 ||
            decodedhref.indexOf('vbscript:') > -1 ||
            decodedhref.indexOf('data:') > -1 ||
            decodedhref.indexOf('livescript:') > -1){
            href = false;
        }
        return href;
    }

    /**
     * Recursively go through nav xml, building a json object
     *
     * @param nav {xml}
     * @return {Object} JSON object
     */
    function parseNavXml(nav) {
        var output = [],
            c;
        for (c=0; c<nav.length; c++) {
            var node = nav[c],
                $node = $(node),
                nodeName = splunk_util.lowerTrimStr(node.nodeName),
                obj;

            if (nodeName === 'collection') {
                obj = {
                    label: $node.attr('label'),
                    uri: '#'
                };
                // recursion warning!
                var children = parseNavXml($node.children());
                if (!children.submenu.length ||
                    !_.find(children.submenu, function(obj) { return !obj.divider; })) {
                    // skip empty collections and ones containing only dividers
                    continue;
                }
                _.extend(obj, children);
            /*
            Views
             */
            } else if (nodeName === 'view') {
                var viewName = $node.attr('name'),
                    isDefault = splunk_util.normalizeBoolean($node.attr('default')||"false"),
                    source = splunk_util.lowerTrimStr($node.attr('source')),
                    match = $node.attr('match');

                if (viewName) {
                    obj = getViewProps(viewName);
                    if (!obj) {
                        continue;
                    }
                    if (isDefault) {
                        obj.isDefault = isDefault;
                    }
                    // mark as seen
                    seenViews.push(app+'/'+viewName);

                } else if (source) {
                    var matchedViews = [],
                        i;
                    if (source == 'all') {
                        matchedViews = getMatchingItems(views, match);
                    } else if (source == 'unclassified') {
                        matchedViews = getMatchingItems(views, match, seenViews);
                    }
                    for (i=0; i<matchedViews.length; i++) {
                        viewName = matchedViews[i].entry.get('name');
                        obj = getViewProps(viewName);
                        if (!obj) {
                            continue;
                        }
                        if (!matchedViews[i].entry.content.get('isDashboard')) {
                            continue;
                        }
                        // mark as seen
                        seenViews.push(app+'/'+viewName);
                        output.push(obj);
                    }
                    obj = false;
                }

            /*
             Saved searches
             */
            } else if (nodeName === 'saved') {
                var savedName = $node.attr('name');
                source = splunk_util.lowerTrimStr($node.attr('source'));
                match = $node.attr('match');

                if (savedName) {
                    obj = getSavedProps(savedName);
                    if (!obj) {
                        continue;
                    }
                    seenSearches.push(app+'/'+savedName);
                } else if (source) {
                    var matchedSearches = [];
                    if (source == 'all') {
                        matchedSearches = getMatchingItems(searches, match);
                    } else if (source == 'unclassified') {
                        matchedSearches = getMatchingItems(searches, match, seenSearches);
                    }
                    for (i=0; i<matchedSearches.length; i++) {
                        savedName = matchedSearches[i].entry.get('name');
                        obj = getSavedProps(savedName);
                        if (!obj) {
                            continue;
                        }
                        // mark as seen
                        seenSearches.push(app+'/'+savedName);
                        output.push(obj);
                    }
                    obj = false;
                }
            } else if (nodeName === 'a') {
                var href = sanatizeHref($node.attr('href'));
                if(href===false){
                    obj=false;
                }else{
                    if (href.indexOf('/') === 0 && href[1] !== '/'){
                        href = splunk_util.make_url(href);
                    }
                    obj = {
                        label: $node.text(),
                        uri: href,
                        viewName: $node.attr('name') || ''
                    };
                }
            } else if (nodeName === 'divider') {
                obj = {
                    label: '',
                    divider: true
                };
            } else {
                obj = {
                    label: 'unknown node in nav'
                };
            }

            if (obj) {
                output.push(obj);
            }

        }
        return {submenu: output};
    }

    function parseNavModel(nav, viewsCollection, savedSearchCollection, rootPath, appOverride){
        var xmlNavString = nav.entry.content.get('eai:data');
        var navXmlObj;
        try {
            navXmlObj = XML.parse(xmlNavString);
        } catch (e) {
            // Fall back to legacy behavior where slightly invalid XML was corrected
            // SPL-84474
            navXmlObj = XML.parse(xmlNavString.replace(/\&/g, "&amp;"));
        }
        var root = navXmlObj.find('nav');
        var searchView = root.attr('search_view');
        var appColor = root.attr('color');

        seenViews = seenSearches = [];
        app = appOverride || nav.entry.content.get('eai:appName');
        views = viewsCollection;
        rootEndpoint = rootPath || '';
        searches = new Backbone.Collection(savedSearchCollection.filter(function(model) {
            var appMatch = model.entry.acl.get('app') == app,
                isGlobal = model.entry.acl.get('sharing') == 'global';
            return appMatch || isGlobal;
        }));
        return {
            nav: parseNavXml(root.children()).submenu,
            searchView: searchView,
            color: appColor
        };
    }

    /**
     * Entry point, kicking off the parsing.
     *
     * @param navsCollection {Collection} output of /data/ui/nav endpoint
     * @param viewsCollection {Collection} output of /data/ui/views endpoint
     * @param savedSearchCollection {Collection} output of /saved/searches endpoint
     *
     * @return {Array} of JSON objects or null if appname is undefined or nav coll is empty
     */
    function parseNavCollection(navsCollection, viewsCollection, savedSearchCollection, rootPath) {
        var result = [];
        rootEndpoint = rootPath || '';
        seenViews = seenSearches = [];
        if (!navsCollection || navsCollection.length == 0) {
            return null;
        }
        navsCollection.each(function(nav){
            result.push(
                parseNavModel(nav,viewsCollection, savedSearchCollection)
            );
        });
        return result;
    }

    return {
        parseNavModel: parseNavModel,
        parseNavCollection: parseNavCollection
    };
});