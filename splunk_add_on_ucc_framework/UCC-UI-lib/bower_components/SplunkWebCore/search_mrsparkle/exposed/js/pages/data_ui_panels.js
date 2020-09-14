define(['routers/Panels',
        'util/router_utils'],
    function(PanelsRouter,
             router_utils) {
        var panelsRouter = new PanelsRouter();
        router_utils.start_backbone_history();
    });
