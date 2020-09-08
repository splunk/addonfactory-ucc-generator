define(
    ['jquery', 'underscore', 'splunk.util', 'util/splunkd_utils', 'splunk.config', 'util/console'],
    function($, _, splunkutil, splunkdUtils, splunkConfig, console)
{
    var exports = {};
    exports.getSplunkVersion = function(){
        var version = "@" + encodeURIComponent(String(splunkConfig.BUILD_NUMBER));
        if (splunkConfig.BUILD_PUSH_NUMBER) {
            version += "." + encodeURIComponent(String(splunkConfig.BUILD_PUSH_NUMBER));
        }
        return version;
    };

    
    exports.encodeRoot = function(path, locale) {
        if (splunkConfig.INDEPENDENT_MODE) {
            console.warn('route: Trying to generate URL in independent mode when URL structure is unknown');
        }

        var parts = _.map((path || '').split('/'), function(part) {
            return encodeURIComponent(part);
        });
        path = parts.join('/');
        path = path ? '/' + path : path;
        return path + '/' + encodeURIComponent(locale);
    };
    exports.alertActionIconFile = function(root, locale, appName, options) {
        options = options || {};
        var version = exports.getSplunkVersion();
        if (options.file) {
            if (appName === 'system') {
                return exports.img(root, locale, version, options.file);
            }
            return exports.appStaticFileVersioned(root, locale, version, appName, options.file);
        } else {
            return exports.img(root, locale, version, 'mod_alert_icon_default.png');
        }
    };
    exports.vizIconFile = function(root, locale, appBuildNumber, appName, fileName, directory) {
        var systemDirectory = 'viz_previews';
        var defaultIcon = 'default.png';
        fileName = fileName || defaultIcon;
        
        if (appName === 'system') {
            var version = exports.getSplunkVersion();
            directory = systemDirectory;
            return exports.img(root, locale, version, fileName, directory);
        }
        else {
            return exports.appVizFileVersioned(root, locale, appBuildNumber, appName, fileName, directory);
        }
    };
    exports.appStaticFileAppVersioned = function(root, locale, appBuildNumber, appName, path) {
        var version = exports.getSplunkVersion();
        if (appBuildNumber){
            version += "-" + encodeURIComponent(String(appBuildNumber));
        }
        return exports.encodeRoot(root, locale) + '/static/'+ version + '/app/' + encodeURIComponent(appName) + '/' + path;
    };
    exports.appVizFileVersioned = function(root, locale, appBuildNumber, appName, file, directory) {
        return exports.appStaticFileAppVersioned(root, locale, appBuildNumber, appName, 'visualizations/' + encodeURIComponent(directory) + '/' + file);
    };
    exports.appStaticFileVersioned = function(root, locale, version, appName, file) {
        return exports.encodeRoot(root, locale) + '/static/'+ version + '/app/' + encodeURIComponent(appName) + '/' + file;
    };
    exports.appStaticFile = function(root, locale, appName, file) {
        return exports.encodeRoot(root, locale) + '/static/app/' + encodeURIComponent(appName) + '/' + file;
    };
    exports.staticFile = function(root, locale, version, file) {
        return exports.encodeRoot(root,  locale)  + '/static/' + version + '/' + encodeURIComponent(file);
    };
    exports.img = function(root, locale, version, file, directory) {
        var url = exports.encodeRoot(root,  locale)  + '/static/';
        if (!_.isUndefined(version) && !_.isNull(version)) {
            url += version + '/';
        }
        url += 'img/';
        if (!_.isUndefined(directory)) {
            url += encodeURIComponent(directory) + '/';
        }
        url += encodeURIComponent(file);
        return url;
    };
    /**
     * Convenience method for static asset URL, mostly used on the login page when window.$C doesn't contain the BUILD_NUMBER.
     * Consider using splunkutil.make_url or any other method in this file before using this method.
     * @param root application root.
     * @param locale application locale.
     * @param version on the login page, window.$C doesn't contain the BUILD_NUMBER, so we created this convenience method that build the URL
     * @param assetPath array of string containing deep folder structure and the filename.
     */
    exports.staticAssetUrl = function(root, locale, version, assetPath) {
        return exports.staticFile(root, locale, "@" + version, assetPath.join('/'));
    };
    /**
     * This method builds the logo URL of the login page.
     * If this is a full URL, http(s)://www.splunk.com/logo/png, just returns it.
     * @param root
     * @param locale
     * @param version window.$C['BUILD_NUMBER'] or preferably this.model.serverInfo.entry.content.get('build')
     * @param assetData the conf value of the loginCustomLogo conf variable: this.model.web.entry.content.get('loginCustomLogo')
     * @returns {*}
     */
    exports.loginPageLogo = function(root, locale, version, assetData) {
        var url = assetData;
        var regex = new RegExp(/https?:\/\//);
        // Construct logo URL if it's not a full URL    
        if (url && !regex.test(url)) {
            url = exports.staticAssetUrl(root, locale, version, exports.assetPath(url));
        }
        return url;
    };
    /**
     * This method builds the background image URL of the login page.
     * @param root
     * @param locale
     * @param version window.$C['BUILD_NUMBER'] or preferably this.model.serverInfo.entry.content.get('build')
     * @param assetData the conf value of the loginCustomLogo conf variable: this.model.web.entry.content.get('loginCustomBackgroundImage')
     */
    exports.loginPageBackground = function(root, locale, version, assetData) {
        return exports.staticAssetUrl(root, locale, version, exports.assetPath(assetData));
    };
    /**
     * This helper method builds an array of URL fragments of an asset given an asset data (most likely a conf variable)
     * In order to build the URL of an asset, this methods is looking for a app namespace in the asset data.
     * If no app namespace provided, default to 'search'.
     * Then, append the assetPath to the array splitting by slashes.
     * Example 1:
     * - assetData = simplexml:directory/file.ext
     * will return ['app','simplexml','directory','file.ext']
     * Example 2:
     * - assetData = directory/file.ext
     * will return ['app','search','directory','file.ext']
     * @param assetData
     * @returns {string[]}
     */
    exports.assetPath = function(assetData) {
        var assetPath = ['app'];
        assetPath.push(assetData.substring(0,assetData.indexOf(":")) || 'search');
        assetPath = assetPath.concat(assetData.substring(assetData.indexOf(":") + 1).split('/'));
        return assetPath;
    };
    exports.page = function(root, locale, app, page, options) {
        if(typeof page === 'undefined'){
            page = '';
        }
        var url = exports.encodeRoot(root, locale) + '/app/' + encodeURIComponent(app);
            if (_.isArray(page)) {
            _.each(page, function(dir) {
                url += '/' + encodeURIComponent(dir);
            });
        } else {
            url += '/' + encodeURIComponent(page);
        }
        if (options) {
            if (options.data) {
                url = url + '?' + splunkutil.propToQueryString(options.data);
            }
            if (options.absolute) {
                url = window.location.protocol + "//" + window.location.host + url;
            }
        }
        return url;
    };
    exports.appIcon = function(root, locale, owner, app, options){
        options = options || {}; 
        var size = '';
        if((window && window.devicePixelRatio > 1) || options.hiRes) {
            size = '_2x';
        }
        return exports.splunkdNS(root, locale, owner, app, 'static/appIcon'+size+'.png', options);
    };
    exports.appIconAlt = function(root, locale, owner, app, options){
        var size = '';
        if(window && window.devicePixelRatio > 1){
            size = '_2x';
        }
        return exports.splunkdNS(root, locale, owner, app, 'static/appIconAlt'+size+'.png', options);
    };
    exports.appLogo = function(root, locale, owner, app, options){
        var size = '';
        if(window && window.devicePixelRatio > 1){
            size = '_2x';
        }
        return exports.splunkdNS(root, locale, owner, app, 'static/appLogo'+size+'.png', options);
    };
    exports.fileExplorer = function(root, locale, owner, app, options){
        return exports.splunkdNS(root, locale, owner, app, 'admin/file-explorer', options);
    };
    exports.regExplorer = function(root, locale, owner, app, options){
        return exports.splunkdNS(root, locale, owner, app, 'admin/win-reg-explorer', options);
    };
    exports.adExplorer = function(root, locale, owner, app, options){
        return exports.splunkdNS(root, locale, owner, app, 'admin/win-ad-explorer', options);
    };
    exports.gettingStartedPlaceholderContent = function(root, locale, owner, app, options){
        return exports.splunkdNS(root, locale, owner, app, 'static/gettingStartedPlaceholder.png', options);
    };
    exports.chooseDashboardIcon = function(root, locale, owner, app, options){
        return exports.splunkdNS(root, locale, owner, app, 'static/chooseDashboardIcon.png', options);
    };
    exports.moreAppsIcon = function(root, locale, owner, app, options){
        return exports.splunkdNS(root, locale, owner, app, 'static/moreAppsIcon.png', options);
    };
    exports.splunkd = function(root, locale){
        return exports.encodeRoot(root, locale) + '/splunkd';
    };
    exports.splunkdRaw = function(root, locale){
        return exports.splunkd(root, locale) + '/__raw';
    };
    exports.splunkdNS = function(root, locale, owner, app, path){
        return exports.splunkdRaw(root, locale) + '/servicesNS/' + encodeURIComponent(owner) + '/' + encodeURIComponent(app) + '/' + path;
    };
    exports.indexingPreviewUpload = function(root, locale){
        return exports.splunkd(root, locale) + '/__upload/indexing/preview';
    };
    exports.receiversStream = function(root, locale){
        return exports.splunkd(root, locale) + '/__upload/receivers/stream';
    };
    exports.identicons = function(root, locale, value){
        return exports.encodeRoot(root, locale) + '/static/app/search/identicons/' + encodeURIComponent(value) + '.png';
    };
    exports.pivot = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'pivot', options);
    };
    exports.table = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'table', options);
    };
    exports.dataset = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'dataset', options);
    };
    exports.datasets = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'datasets', options);
    };
    exports.data_model_manager = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'data_model_manager', options);
    };
    exports.data_model_editor = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'data_model_editor', options);
    };
    exports.field_extractor = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'field_extractor', options);
    };
    exports.search = function(root, locale, app, options) {
        if (app === splunkdUtils.SYSTEM) {
            app = 'search';
        }
        return exports.page(root, locale, app, 'search', options);
    };
    exports.report = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'report', options);
    };
    exports.reports = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'reports', options);
    };
    exports.alert = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'alert', options);
    };
    exports.alerts = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'alerts', options);
    };
    exports.job_manager = function(root, locale, app, options) {
        return exports.page(root, locale, app, 'job_manager', options);
    };
    exports.managementConsole = function(root, locale, options) {
        return exports.page(root, locale, 'splunk_monitoring_console', 'monitoringconsole_overview', options);
    };
    exports.addData = function(root, locale, app, step, options) {
        // if app is not provided, default to search
        var page = step ? ["adddata", step] : 'adddata';
        return exports.manager(root, locale, app || "search", page, options);
    };
    exports.editDashboard = function(root, locale, app, name, options) {
        return exports.page(root, locale, app, [name, 'edit'], options);
    };
    exports.dashboardFromID = function(root, locale, id, options) {
        options = options || {};
        //owner[1]/app[0]/data[2]/ui[3]/views[4]/name[5]
        var parts = id.split('/').slice(-6);
        return this.page(root, locale, parts[1], parts[5], options);
    };
    exports.logout = function(root, locale) {
        return exports.encodeRoot(root, locale) + '/account/logout';
    };
    exports.proxyLogin = function(root, locale) {
        return exports.encodeRoot(root, locale) + '/account/login';
    };
    exports.returnTo = function(root, locale, url) {
        if (url.indexOf('/')===0) {
            return url.replace(/^(\/)+(\s)*(\/)/, '/');
        }
        return exports.encodeRoot(root, locale);
    };
    exports.embed = function(root, locale, embedToken, savedSearchId) {
        var url,
        data = {
            s: savedSearchId,
            oid: embedToken
        };
        if (splunkConfig.EMBED_URI) {
            url = splunkConfig.EMBED_URI + '/';
        } else {
            url = window.location.protocol + "//" + window.location.host + '/';
            if (root) {
                url += root + '/';
            }
        }
        return url + locale + '/embed?' + splunkutil.propToQueryString(data);
    };
    exports.jobInspector = function(root, locale, app, sid) {
        var options = {
                data: {
                    sid: sid
                }
            };
        return exports.manager(root, locale, app, 'job_inspector', options);
    };
    exports.searchJobUrls = function(root, locale, sid, page, options) {
        var url = exports.encodeRoot(root, locale) + '/api/search/jobs/' + encodeURIComponent(sid) + '/' + encodeURIComponent(page);
        if (options && options.data) {
            url = url + '?' + splunkutil.propToQueryString(options.data);
        }
        return url;
    };
    exports.searchJobTimeline = function(root, locale, sid, options) {
        return exports.searchJobUrls(root, locale, sid, 'timeline', options);
    };
    exports.searchJobSummary = function(root, locale, sid, options) {
        return exports.searchJobUrls(root, locale, sid, 'summary', options);
    };
    exports.manager = function(root, locale, app, page, options) {
        var url =  exports.encodeRoot(root, locale) + '/manager/' + encodeURIComponent(app);
        if (_.isArray(page)) {
            _.each(page, function(dir) {
                url += '/' + encodeURIComponent(dir);
            });
        } else {
            url += '/' + encodeURIComponent(page);
        }
        if (options) {
            if (options.data) {
                url = url + '?' + splunkutil.propToQueryString(options.data);
            }
        }
        return url;
    };
    exports.appSetupLink = function(root, locale, app, options) {
        options || (options = {});
        options.data = _.extend({ action: 'edit' }, options.data);
        var page = ['apps', 'local', app, 'setup'];
        return exports.manager(root, locale, app, page, options);
    };

    exports.archives = function(root, locale, app, options) {
        options = options || {};
        return exports.manager(root, locale, app, "archives", options);
    };
    exports.indexes = function(root, locale, app, options) {
        options = options || {};
        return exports.manager(root, locale, app, "data/indexes", options);
    };
    // HUNK routes
    exports.providers = function(root, locale, app, options) {
        options = options || {};
        _(options).defaults({data:{t:"providers"}});
        return exports.manager(root, locale, "system", "virtual_indexes", options);
    };
    exports.virtualIndexes = function(root, locale, app, options) {
        options = options || {};
        _(options).defaults({data:{t:"indexes"}});
        return exports.manager(root, locale, "system", "virtual_indexes", options);
    };
    exports.exploreData = function(root, locale, app, options) {
        options = options || {};
        return exports.manager(root, locale, "system", "explore_data", options);
    };
    exports.managerEdit = function(root, locale, app, page, id, options) {
        options = options || {};
        options = $.extend(true, {data: {action: 'edit', uri: id}}, options);
        return exports.manager(root, locale, app, page, options);
    };
    exports.managerPermissions = function(root, locale, app, page, id, options) {
        options || (options = {});
        var url =  exports.encodeRoot(root, locale) + '/manager/permissions/' + encodeURIComponent(app);
        url += '/' + _.chain([page]).flatten().map(encodeURIComponent).value().join('/');
        url += '/' + encodeURIComponent(id);
        if (options.data) {
            url = url + '?' + splunkutil.propToQueryString(options.data);
        }
        return url;
    };
    exports.triggeredAlerts = function(root, locale, app, options) {
        var url = exports.encodeRoot(root, locale) + '/alerts/' + encodeURIComponent(app);
        if (options) {
            if (options.data) {
                url = url + '?' + splunkutil.propToQueryString(options.data);
            }
        }
        return url;
    };
    exports.docSearch = function(locale, version, isFree, isTrial, search) {
        var base = 'http://docs.splunk.com/Special:SplunkSearch/docs',
            params = {
                locale: locale,
                versionNumber: version,
                license: isFree ? 'free' : 'pro',
                installType: isTrial ? 'trial' : 'prod',
                q: search
            };
        return base + '?' + splunkutil.propToQueryString(params);
    };
    exports.docHelp = function(root, locale, location) {
        locale = locale || splunkdUtils.DEFAULT_LOCALE;
        var url =  exports.encodeRoot(root, locale) + '/help',
            params = {
                location: location
            };
        return url + '?' + splunkutil.propToQueryString(params);
    };
    exports.docHelpInAppContext = function(root, locale, location, appName, appVersion, isCoreApp, appDocSectionOverride) {
        var url = exports.encodeRoot(root, locale) + '/help',
            params = {
                location: location
            };
            // add [appName:appVersion] or [appDocsSectionOverride] prefix if the app is NOT a core app
            if (!isCoreApp) {
                if (appDocSectionOverride) {
                    params.location = '[' + appDocSectionOverride + ']' + params.location;
                } else {
                    params.location = '[' + appName + ':' + appVersion + ']' + params.location;
                }
            }
        return url + '?' + splunkutil.propToQueryString(params);
    };
    exports.exportUrl = function(root, locale, sid, filename, format, count, isReport, options) {
        options = options || {};
        var resultType = isReport ? 'results' : 'event';
        var url = exports.encodeRoot(root, locale) + '/api/search/jobs/' + encodeURIComponent(sid) + '/' + resultType;
        var params = {
            isDownload: true,
            timeFormat: options.timeFormat || '%FT%T.%Q%:z',
            maxLines: 0,
            count: count,
            filename: filename || '',
            outputMode: format
        };
        url += '?' + splunkutil.propToQueryString(params);
        return url;
    };
    exports.updateChecker = function(baseURL, isFree, versionNumber, checkerLocation, isTrial, guid, masterGuid) {
        var url,
            installType = (isTrial) ? 'trial' : 'prod',
            licenseType = (isFree) ? 'free' : 'pro';
        if (guid!==masterGuid) {
            installType += '_slave';
        }
        url = baseURL + licenseType + '/' +  encodeURIComponent(versionNumber) + '/' +  encodeURIComponent(checkerLocation) + '/' +  encodeURIComponent(installType) + '/basic';
        return url;
    };
    exports.answers = function() {
        return 'http://answers.splunk.com';
    };
    exports.getContextualPageRouter = function(applicationModel) {
        var root = applicationModel.get('root'),
            locale = applicationModel.get('locale'),
            app = applicationModel.get('app'),
            nonPageMethods = ['page', 'docSearch', 'docHelp', 'docHelpInAppContext', 'exportUrl', 'exportUrl', 'getContextualPageRouter', 'pageStart', 'encodeRoot', 'redirectTo'],
            routeNames = _(exports).chain().functions().difference(nonPageMethods),
            router = {};

        _(routeNames).each(function(route) {
            var routeFn = exports[route];
            router[route] = function() {
                var fullArgs = [root, locale, app].concat(_(arguments).toArray());
                return routeFn.apply(null, fullArgs);
            };
        });
        return router;
    };
    exports.appNavUrl = function(root, locale, app){
        return exports.encodeRoot(root,  locale)  + '/appnav/' + encodeURIComponent((app || ''));
    };
    exports.appsRemote = function(root, locale, app, options){
       return  exports.manager(root, locale, app, 'appsremote', options);
    };
    exports.appsLocal = function(root, locale, app, options){
        return  exports.manager(root, locale, app, ['apps','local'], options);
    };
    exports.splunkbaseApp = function(app) {
        return 'https://apps.splunk.com/app/' + encodeURIComponent(app); 
    };
    exports.appInstallRestart = function(root, locale, app){
        return exports.manager(root, locale, 'system', 'control') + '?return_to=' + encodeURIComponent('/en-US/app/' + app) + '&auto_restart=1';
    };
    exports.appSetup = function(root, locale, setuplink){
        return exports.encodeRoot(root,  locale)  + setuplink;
    };
    exports.viewStrings = function(root, locale, app, view){
        return exports.page(root, locale, app, view) + "/strings";
    };
    exports.prebuiltAppLink = function(root, locale, app, link) {
        /* properly sets up a URL for an /app/<app> link
         *  returns root/locale/app/link
         *  since link may contain a query string, it is not encoded
         *  example:
         *     root = /gadzooks, locale = en-US, app = search, link = search?tour=test
         *     return /gadzooks/en-US/search/search?tour=test
         */
        return exports.encodeRoot(root, locale) + '/app/' + encodeURIComponent(app) + '/' + link;
    };
    exports.home = function(root, locale) {
        /* our routing system routes /root/locale to the user's default app/default page
         * as we ship, this is launcher/home, but the user can override this
         * root and locale are accessible from application model
         */
        return exports.encodeRoot(root, locale);
    };
    /**
     * Redirects to a new url, optionally in a new tab.
     *
     * Intentionally forked from the redirect_to function in util.js, instead providing a redirect method
     * that is intended to consume a fully-formed URL like the ones generated by the other methods in this file.
     *
     * Correctly handles the case where we have an asynchronously generated URL that needs to open in a new tab.
     * The new tab is created synchronously (to avoid pop-up blockers) and given its location when the promise resolves.
     *
     * @param url {String or a promise resolving with a string} the URL to navigate to
     * @param useNewTab {Boolean}
     *
     */
    exports.redirectTo = function(url, useNewTab) {
        var target = useNewTab ? window.open() : window;
        target.focus();
        $.when(url)
            .done(function(newLocation) {
                target.location = newLocation;
            })
            .fail(function() {
                console.error('failed to open new URL: ' + url);
                console.error.apply(console, arguments);
                if(useNewTab) {
                    target.close();
                }
            });
    };
    exports.sourcetypeList = function(root, locale, app, options) {
        // if app is not provided, default to search
        return exports.manager(root, locale, app, 'sourcetypes', options);
    };
    exports.sourcetypeEdit = function(root, locale, app, id, options) {
        // if app is not provided, default to search
        return exports.sourcetypeList(root, locale, app, options) + '/'+id;
    };
    exports.spmetadata = function(root, locale) {
        return exports.encodeRoot(root, locale) + '/saml/spmetadata';
    };
    return exports;
});
