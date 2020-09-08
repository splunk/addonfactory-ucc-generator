define(['jquery', 'routers/HttpInput', 'util/router_utils'], function($, HttpInputRouter, router_utils) {
    var httpInputRouter = new HttpInputRouter();
    router_utils.start_backbone_history();
});
