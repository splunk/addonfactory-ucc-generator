Splunk.Module.LiteBar = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        var self = this;

        this.container.addClass('splunk-components');
        this.container.removeClass('LiteBar SplunkModule');

        var legacyMessages = [],
            seenMessages = '',
            updateLegacyMessagesFunction;

        this.messenger = Splunk.Messenger.System.getInstance();
        var addMessage = function(message){
            if(message.className !== 'splunk.services' && seenMessages.indexOf(message.content+'|||') < 0){
                legacyMessages.push(message);
                seenMessages += message.content +'|||';

                if(updateLegacyMessagesFunction){
                    updateLegacyMessagesFunction.call(self);
                }
            }
        };

        this.messenger.receive('*', addMessage, undefined, false);

        require([
            'backbone',
            'views/shared/litebar/Master',
            'models/shared/Application',
            'models/services/server/ServerInfo',
            'models/services/data/UserPrefGeneral',
            'collections/services/data/ui/Tours',
            'collections/services/AppLocals',
            'views/shared/footer/Master',
            'models/config',
            'models/shared/User',
            'util/splunkd_utils'
        ], function(
            Backbone,
            LiteBar,
            ApplicationModel,
            ServerInfoModel,
            UserPrefModel,
            ToursCollection,
            AppsCollection,
            FooterView,
            configModel,
            UserModel,
            splunkd_utils
        ){
            self.owner = $C.USERNAME;
            self.app = Splunk.util.getCurrentApp();

            var applicationModel = new ApplicationModel(),
                serverInfo = new ServerInfoModel(),
                serverInfoDfd = serverInfo.fetch(),
                tours = new ToursCollection(),
                apps = new AppsCollection(),
                toursDfd = tours.fetch({
                    data: {
                        app: self.app,
                        owner: self.owner,
                        count: -1
                    }
                }),
                appsDfd = apps.fetch({
                    data: {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: '-' ,
                        owner: self.owner,
                        search: 'visible=true AND disabled=0 AND name!=launcher',
                        count:-1
                    }
                }),
                userModel = new UserModel({}, {serverInfoModel: serverInfo}),
                userModelDfd = userModel.fetch({
                    data: {
                            app: self.app,
                            owner: self.owner
                    },
                    url: splunkd_utils.fullpath(userModel.url + "/" + self.owner)
                });
                userPrefModel = new UserPrefModel(),
                userPrefDfd = userPrefModel.fetch();

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

            var legacyMessageCollection = new Backbone.Collection();

            legacyMessageCollection.reset(legacyMessages);
            updateLegacyMessagesFunction = function(messages){
                legacyMessageCollection.reset(messages);
            };

            $.when(serverInfoDfd, userModelDfd, toursDfd, appsDfd, userPrefDfd).then(function() {
                this.litebar = LiteBar.create({
                    model: {
                        application: applicationModel,
                        serverInfo: serverInfo,
                        config: configModel,
                        user: userModel,
                        userPref: userPrefModel
                    },
                    collection:{
                        legacyMessages: legacyMessageCollection,
                        tours: tours,
                        apps: apps
                    },
                    appServerUrl: true,
                    autoRender: true
                });
                self.container.html(this.litebar.$el);
            }.bind(this));

            var footerView = FooterView.create({
                model: {
                    application: applicationModel
                }
            });
            var $footerContainer = $('<div class="splunk-components"/>');
            $footerContainer.append(footerView.render().el);
            $('body').append($footerContainer);
        });
    }
});
