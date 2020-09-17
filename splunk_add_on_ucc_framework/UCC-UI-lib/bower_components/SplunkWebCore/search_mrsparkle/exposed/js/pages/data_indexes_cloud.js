define([
    'underscore',
    'routers/IndexesCloud',
    'models/indexes/cloud/Index',
    'util/router_utils'
], function(
    _,
    IndexesRouter,
    IndexModel,
    router_utils
) {
    var createRouter = function(isSingleInstanceCloud, pageError){
        new IndexesRouter({
            isSingleInstanceCloud: isSingleInstanceCloud,
            pageError: pageError
        });
        try {
            router_utils.start_backbone_history();
        }
        // Catch malformed URLs and redirect to listing page.
        catch (e){
            window.location = './';
        }
    };
    new IndexModel().fetch().then(function() {
        createRouter(false, null);
    }).fail(function(error){
        if (error.status === 404){
            createRouter(true, null);
        }
        else {
            createRouter(true, error);
        }
    });
});
