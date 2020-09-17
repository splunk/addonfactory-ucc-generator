define(['routers/DataExplorer', 'util/router_utils', './explore_data.pcss'], function(DataExplorer, router_utils) {
    var dataExplorer = new DataExplorer();
    router_utils.start_backbone_history();
});
