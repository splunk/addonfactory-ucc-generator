define([
    'jquery',
    'module',
    'views/Base',
    'views/shared/aboutmodal/Master',
    'models/services/server/ServerInfo',
    'models/shared/Application',
    'models/services/AppLocal',
    'collections/services/AppLocals',
    'contrib/text!./Master.html',
    './Master.pcssm',
    'uri/route',
    'util/splunkd_utils'
],
    function(
        $,
        module,
        BaseView,
        AboutDialogView,
        ServerInfoModel,
        ApplicationModel,
        AppLocalModel,
        AppsCollection,
        footerTemplate,
        css,
        route,
        splunkDUtils
        ){
        var View = BaseView.extend({
                moduleId: module.id,
                css: css,
                template: footerTemplate,
                initialize: function() {
                    BaseView.prototype.initialize.apply(this, arguments);

                    // can only render once we have application and appLocal ready
                    var applicationModelDeferred = $.Deferred();
                    var appLocalModelDeferred = $.Deferred();

                    if (this.options.model.application.get('app')) {
                        applicationModelDeferred.resolve();
                    } else {
                        this.options.model.application.on('change reset', applicationModelDeferred.resolve);
                    }

                    if (this.options.model.appLocal.entry.content.get('version')) {
                        appLocalModelDeferred.resolve();
                    } else {
                        this.options.model.appLocal.entry.content.on('change', appLocalModelDeferred.resolve);
                    }

                    $.when(applicationModelDeferred, appLocalModelDeferred).done(this.render.bind(this));
                },
                events: {
                    'click a[id=about]': function(e) {
                        e.preventDefault();
                        this.children.aboutDialog = new AboutDialogView({
                            collection: this.options.collection.apps,
                            model: {
                                application: this.options.model.application,
                                appLocal: this.options.model.appLocal,
                                serverInfo: this.options.model.serverInfo
                            },
                            onHiddenRemove: true
                        });
                        //for compatibility with the module system, this needs to be wrapped in an extra div.
                        this.modalWrapper = $('<div class="splunk-components">').appendTo("body").append(this.children.aboutDialog.render().el);
                        this.children.aboutDialog.once('hidden', function() {
                            this.modalWrapper.remove();
                            // SPL-76438: set focus when the modal is closed.
                            $(e.currentTarget).focus();
                        }, this);

                        this.children.aboutDialog.show();
                    }
                },
                makeDocLink: function(location) {
                    var app = this.model.application.get("app");
                    return route.docHelpInAppContext(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        location,
                        app,
                        this.model.appLocal.entry.content.get('version'),
                        app === 'system' ? true : this.model.appLocal.isCoreApp(),
                        this.model.appLocal.entry.content.get('docs_section_override')
                    );
                },
                makeDocLinkForPage: function() {
                    //this is the generic doc link based on the current location
                    var link = '/help',
                        location;

                    if(this.model.application.get('page') === '_admin'){
                        // making help link for manager page
                        location = 'manager';
                        if(window && window.location && typeof window.location.pathname === 'string'){
                            //get the location from the browser
                            var pathname = window.location.pathname;
                            //remove '/manager/' and all characters before
                            pathname = pathname.substring(pathname.indexOf('/manager/')+9);
                            //next we should have app namespace to remove
                            pathname = pathname.substring(pathname.indexOf('/')+1);
                            //change slashes to dots
                            pathname = pathname.replace(new RegExp('/', 'g'), '.');
                            location += '.'+pathname;
                        }

                        link = route.docHelp(
                            this.model.application.get("root"),
                            this.model.application.get("locale"),
                            location
                        );

                    } else {
                        // making help link for app page
                        // location is in form: app.<app_name>.<page_name>
                        location = [
                            'app',
                            this.model.application.get('app'),
                            this.model.application.get('page')
                        ].join(".");

                        link = this.makeDocLink(location);

                    }
                    return link;
                },
                render: function() {
                    var html = this.compiledTemplate({
                        docLink: this.makeDocLinkForPage(),
                        css: css
                    });
                    this.$el.html(html);
                    return this;
                }
            },
            {
                create: function(options){
                    options = options || {};
                    options.model = options.model || {};
                    options.collection = options.collection || {};
                    if (!options.model.serverInfo) {
                        options.model.serverInfo = new ServerInfoModel();
                        options.model.serverInfo.fetch();
                    }
                    var applicationDfd = $.Deferred();
                    if(!options.model.application){
                        options.model.application = new ApplicationModel();
                    }

                    if (options.model.application.get('app')) {
                        applicationDfd.resolve();
                    } else {
                        options.model.application.on('change', applicationDfd.resolve);
                    }

                    if(!options.model.appLocal) {
                        options.model.appLocal = new AppLocalModel();
                        applicationDfd.done(function() {
                            if (options.model.application.get("app") !== 'system') {
                                options.model.appLocal.fetch({
                                    url: splunkDUtils.fullpath(options.model.appLocal.url + "/" + encodeURIComponent(options.model.application.get("app"))),
                                    data: {
                                        app: options.model.application.get("app"),
                                        owner: options.model.application.get("owner")
                                    }
                                });
                            }
                        });
                    }

                    if (!options.collection.apps) {
                        options.collection.apps = new AppsCollection();
                        options.collection.apps.fetch({
                            data: {
                                sort_key: 'name',
                                sort_dir: 'desc',
                                app: '-' ,
                                owner: options.model.application.get('owner'),
                                search: 'visible=true AND disabled=0 AND name!=launcher',
                                count:-1
                            }
                        });
                    }

                    return new View(options);
                }
            });
        return View;
    });
