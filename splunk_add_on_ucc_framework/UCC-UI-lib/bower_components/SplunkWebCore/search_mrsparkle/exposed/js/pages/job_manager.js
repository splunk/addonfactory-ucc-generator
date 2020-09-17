define(['routers/JobManager', 'util/router_utils'], function(JobManagerRouter, router_utils) {
    var jobManagerRouter = new JobManagerRouter();
    router_utils.start_backbone_history();
});