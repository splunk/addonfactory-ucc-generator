define(['routers/Indexes', 'util/router_utils'], function(IndexesRouter, router_utils) {
    var indexesRouter = new IndexesRouter();
    try {
        router_utils.start_backbone_history();
    }
    // Catch malformed URLs and redirect to lisiting page.
    catch (e){
        window.location = './';
    }
});
