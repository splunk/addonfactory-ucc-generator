define(['backbone', 'routers/DataModelEditor', 'util/router_utils', './data_model_editor.pcss'], function(Backbone, DataModelEditor, routerUtils) {
    var dataModelEditorRouter = new DataModelEditor();
    //start the backbone history object/bootstrap router
    routerUtils.start_backbone_history();
});
