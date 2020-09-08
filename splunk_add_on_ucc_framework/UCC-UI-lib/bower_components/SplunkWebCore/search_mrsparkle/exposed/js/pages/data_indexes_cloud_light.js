define(['routers/IndexesCloudLight', 'util/router_utils'], function(IndexesCloudLightRouter, router_utils) {
    var indexesCloudRouter = new IndexesCloudLightRouter();
    try {
        router_utils.start_backbone_history();
    }
    // Catch malformed URLs and redirect to lisiting page.
    catch (e) {
        window.location = './';
    }
});
