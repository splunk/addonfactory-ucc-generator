Splunk.Module.AccountBar = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        var self = this;

        this.container.addClass('splunk-components');
        this.container.removeClass('AccountBar SplunkModule');

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
            'views/shared/splunkbar/Master',
            'models/shared/Application',
            'models/services/server/ServerInfo',
            'views/shared/footer/Master',
            'models/config'
        ], function(
            Backbone,
            GlobalNav,
            ApplicationModel,
            ServerInfoModel,
            FooterView,
            configModel
        ){

            var rootPath = $C.MRSPARKLE_ROOT_PATH;
            //root path cannot have leading slash
            rootPath = rootPath[0] === '/' ? rootPath.substring(1) : rootPath;
            var applicationModel = new ApplicationModel({
                locale: $C.LOCALE,
                root: rootPath,
                app: Splunk.util.getCurrentApp(),
                owner: $C.USERNAME,
                page: Splunk.util.getCurrentView()
            });

            var legacyMessageCollection = new Backbone.Collection();

            var splunkbarCreateData = {
                model: {
                    application: applicationModel,
                    config: configModel
                },
                collection:{
                    legacyMessages: legacyMessageCollection
                }
            };


            if (typeof __splunkd_partials__ !== 'undefined' &&
                __splunkd_partials__['/services/server/info']) {
                var serverInfo = new ServerInfoModel();
                serverInfo.setFromSplunkD(__splunkd_partials__['/services/server/info']);
                splunkbarCreateData.model.serverInfo = serverInfo;
            }

            var splunkbar = GlobalNav.create(splunkbarCreateData).render();

            legacyMessageCollection.reset(legacyMessages);
            updateLegacyMessagesFunction = function(messages){
                legacyMessageCollection.reset(messages);
            };

            self.container.html(splunkbar.$el);

            if(Splunk.util.normalizeBoolean(self._params['footer'])){
                var footerView = FooterView.create({
                    model: {
                        application: applicationModel
                    }
                });
                var $footerContainer = $('<div class="splunk-components"/>');
                $footerContainer.append(footerView.render().el);
                $('body').append($footerContainer);
            }

        });
    }
});
