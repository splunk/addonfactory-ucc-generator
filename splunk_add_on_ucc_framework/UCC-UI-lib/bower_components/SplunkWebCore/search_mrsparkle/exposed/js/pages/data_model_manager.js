/**
 * @author jszeto
 * @date 1/23/13
 */
define(['backbone', 'routers/DataModelManager', 'util/router_utils'], function(Backbone, DataModelManager, routerUtils) {
    var dataModelManagerRouter = new DataModelManager();
    routerUtils.start_backbone_history();
});
