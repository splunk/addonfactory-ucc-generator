define(['routers/Archives', 'util/router_utils'], function(ArchivesRouter, router_utils) {
    var archivesRouter = new ArchivesRouter();
    router_utils.start_backbone_history();
});
