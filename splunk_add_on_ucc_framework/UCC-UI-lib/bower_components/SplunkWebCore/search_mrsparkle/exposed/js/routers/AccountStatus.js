define(
    [
        'jquery',
        'backbone',
        'underscore',
        'uri/route',
        'splunk.config',
        'splunk.util',
        'models/shared/SessionStore',
        'models/shared/Application',
        'models/classicurl',
        'models/services/server/ServerInfo',
        'models/services/configs/Web',
        'models/shared/User',
        'models/account/Session',
        'models/account/Login',
        'models/account/SamlTOSLogin',
        'models/account/TOS',
        'util/login_page',
        'views/account/status/Master'
    ],
    function(
        $,
        Backbone,
        _,
        route,
        splunkConfig,
        util,
        SessionStoreModel,
        ApplicationModel,
        classicurlModel,
        ServerInfoModel,
        WebModel,
        UserModel,
        SessionModel,
        LoginModel,
        SamlTOSLoginModel,
        TOSModel,
        LoginPageUtils,
        MasterView
    ) {
        return Backbone.Router.extend({
            routes: {
                ':locale/account/:page': 'page',
                ':locale/account/:page?*params': 'page',
                ':locale/account/:page/': 'page',
                ':locale/account/:page/?*params': 'page',
                '*root/:locale/account/:page': 'pageRooted',
                '*root/:locale/account/:page?*params': 'pageRooted',
                '*root/:locale/account/:page/': 'pageRooted',
                '*root/:locale/account/:page/?*params': 'pageRooted'
            },
            initialize: function() {
                this.model = {};
                this.model.application = new ApplicationModel();
                this.model.classicurl = classicurlModel;
                this.model.serverInfo = new ServerInfoModel({}, {splunkDPayload: __splunkd_partials__['/services/server/info']});
                this.model.session = new SessionModel({}, {splunkDPayload: __splunkd_partials__['/services/session']});
                this.model.tos = new TOSModel();
                this.model.web = new WebModel({}, {splunkDPayload: __splunkd_partials__['/configs/conf-web']});
                this.model.accountStatus = __splunkd_partials__['/account/status']; //TODO this should be a model like the rest of the partials.
                this.model.user = new UserModel({}, {serverInfoModel: this.model.serverInfo});
                this.model.user.urlRoot = undefined;//urlRoot is relied on by other consumers; required to be deleted in order to set a fully qualified link as id
                this.model.login = new SamlTOSLoginModel();  // Need specialized handling of SAML Login with TOS!!

                //ensure globals ie., window.$C sync'd with splunkd session partial values
                splunkConfig.LOCALE = this.model.session.entry.content.get('lang');

                // SAML-SSO initiated TOS
                if (this.model.session.entry.content.get('tos_version') && this.model.session.entry.content.get('tos_url')) {
                    this.bootstrapTOS(this.model.session.entry.content.get('tos_version'), this.model.session.entry.content.get('tos_url'));
                }
                var sessionStore = SessionStoreModel.getInstance(true);
            },
            bootstrapTOS: function(tosVersion, tosURL) {
                this.model.tos.set({
                    tos_version: tosVersion
                });
                this.model.tos.fetch({url: tosURL});
            },
            page: function(locale, page) {
                document.title = _('Account Status | Splunk').t();
                this.model.classicurl.fetch(); //is syncronous
                this.model.application.set({
                    locale: locale,
                    app: '-',
                    page: page
                });
                var masterView = new MasterView({
                    model: {
                        application: this.model.application,
                        serverInfo: this.model.serverInfo,
                        session: this.model.session,
                        tos: this.model.tos,
                        web: this.model.web,
                        login: this.model.login,
                        user: this.model.user,
                        accountStatus: this.model.accountStatus
                    }
                });
                masterView.render().attachToDocument(document.body, 'appendTo');
                LoginPageUtils.setupBackgroundImage(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.serverInfo.entry.content.get('build'),
                    this.model.web.entry.content.get('loginBackgroundImageOption'),
                    this.model.web.entry.content.get('loginCustomBackgroundImage'),
                    this.model.serverInfo.isLite());
            },
            pageRooted: function(root, locale, page) {
                this.model.application.set({
                    root: root
                }, {silent: true});
                this.page(locale, page);
            }
        });
    }
);
