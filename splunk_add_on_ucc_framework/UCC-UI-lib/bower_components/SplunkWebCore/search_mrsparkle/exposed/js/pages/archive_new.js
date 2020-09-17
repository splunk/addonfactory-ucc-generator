define(['routers/ArchiveNew', 'util/router_utils'], function(ArchiveNew, router_utils) {
    var archiveNewRouter = new ArchiveNew();
    router_utils.start_backbone_history();
});
