define(
    [
        'routers/Table',
        'util/router_utils',
        'helpers/user_agent'
    ],
    function(
        TableRouter,
        router_utils,
        userAgent
    ) {
        var tableRouter = new TableRouter(),
            options = {
                forceNoPushState: !userAgent.isFirefox()
            };
        
        router_utils.start_backbone_history(options);
    }
);
