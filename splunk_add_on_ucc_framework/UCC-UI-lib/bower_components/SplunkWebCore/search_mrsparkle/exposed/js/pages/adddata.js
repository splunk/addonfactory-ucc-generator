define(['jquery', 'routers/AddData', 'util/router_utils', './adddata.pcss'], function($, AddDataRouter, router_utils) {
    var addDataRouter = new AddDataRouter();
    router_utils.start_backbone_history();
});
