define(
[
    'underscore',
    'jquery',
    'module',
    'views/Base',
    'views/shared/Icon',
    'views/shared/delegates/Popdown',
    'views/shared/aboutmodal/Master',
    'views/shared/controls/TextControl',
    'contrib/text!./MenuContents.html',
    './MenuContents.pcssm',
    'uri/route'
],
function(
    _,
    $,
    module,
    BaseView,
    IconView,
    Popdown,
    AboutDialogView,
    TextControl,
    template,
    css,
    route
){
    return BaseView.extend({
        moduleId: module.id,
        template: template,
        css: css,
        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.searchInput = new TextControl({
                placeholder: _('Search Documentation').t(),
                style: 'search',
                useLocalClassNames: true
            });
            this.model.appLocal.on('change reset', this.debouncedRender, this);
            this.debouncedRender();

        },
        events: {
            'keypress input': "onDocsSearch",
            'click li > a': function(e) {
                this.closePopdown();
            },
            'click [data-action=about-splunk]': function(e) {
                this.children.aboutDialog = new AboutDialogView({
                    collection: this.collection.apps,
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    onHiddenRemove: true
                });

                //for compatibility with the module system, this needs to be wrapped in an extra div.

                this.children.aboutDialog.show();
                this.closePopdown();
                e.preventDefault();
            }
        },
        render: function(){
            var isCloud = this.model.serverInfo.isCloud(),
                isLite = this.model.serverInfo.isLite(),
                html = this.compiledTemplate({
                    docLink: this.makeDocLinkForPage(),
                    makeDocLink: this.makeDocLink.bind(this),
                    isLite: isLite,
                    isCloud: isCloud,
                    hasTours: this.options.hasTours,
                    css: css
                });
            this.$el.html(html);

            var $externalLinks = this.$('[data-link-external]');
            for (var i = 0; i < $externalLinks.length; i++) {
                this.children['icon' + i] || (this.children['icon' + i] = new IconView({icon: 'external' }));
                this.children['icon' + i].render().appendTo($externalLinks.eq(i));
            }

            this.$('[data-role=form]').append(this.children.searchInput.render().el);
            this.children.popdown = new Popdown({el:this.el, mode: 'dialog'});
            return this;
        },
        onDocsSearch: function(evt){
            if (evt.keyCode === 13){ //ENTER
                var s = $(evt.target).val();
                evt.preventDefault();
                evt.stopPropagation();
                $.when(this.serverInfoDfd).then(function(){
                    var url = route.docSearch(this.model.application.get('locale'), this.model.serverInfo.getVersion(), this.model.serverInfo.isFreeLicense(), this.model.serverInfo.isTrial(), s);
                    window.open(url);
                }.bind(this));
                $(evt.target).val('');
                this.closePopdown();
                evt.preventDefault();
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
        closePopdown: function(){
            this.trigger('close');
        }
    });
});
