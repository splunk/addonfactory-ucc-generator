define(['routers/JobInspector', 'util/router_utils'], function(JobInspectorRouter, router_utils) {
    var jobInspectorRouter = new JobInspectorRouter();
    router_utils.start_backbone_history();
});