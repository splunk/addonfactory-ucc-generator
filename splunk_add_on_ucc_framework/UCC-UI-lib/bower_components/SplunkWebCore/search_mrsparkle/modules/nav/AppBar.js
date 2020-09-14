Splunk.Module.AppBar = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        var self = this;

        this.container.addClass('splunk-components');
        this.container.removeClass('AppBar SplunkModule');

        require([
            'views/shared/appbar/Master',
            'models/shared/Application',
            'models/services/server/ServerInfo',
            'models/shared/User'
        ], function(
            AppBar,
            ApplicationModel,
            ServerInfoModel,
            UserModel
        ){
            self.owner = $C.USERNAME;
            self.app = Splunk.util.getCurrentApp();

            var applicationModel = new ApplicationModel(),
                serverInfo = new ServerInfoModel(),
                user = new UserModel({}, {
                    serverInfoModel: serverInfo
                });
            this.appbar = AppBar.create({
                model: {
                    application: applicationModel,
                    serverInfo: serverInfo,
                    user: user
                },
                appServerUrl: true
            });

            var rootPath = $C.MRSPARKLE_ROOT_PATH;
            //root path cannot have leading slash
            rootPath = rootPath[0] === '/' ? rootPath.substring(1) : rootPath;

            applicationModel.set({
                locale: $C.LOCALE,
                root: rootPath,
                app: self.app,
                owner: self.owner,
                page: Splunk.util.getCurrentView()
            });
            self.container.html(this.appbar.$el);
        });
    }
});
