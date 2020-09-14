define([
    'jquery',
    'routers/Bulkreassign',
    'util/router_utils'
], function(
    $,
    ReassignRouter,
    router_utils
) {
    var reassignRouter = new ReassignRouter();
    router_utils.start_backbone_history();
});
