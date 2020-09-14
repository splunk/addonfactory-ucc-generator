define(['jquery', 'routers/Sourcetypes', 'util/router_utils'], function($, SourcetypesRouter, router_utils) {
    var sourcetypesRouter = new SourcetypesRouter();
    router_utils.start_backbone_history();
});
