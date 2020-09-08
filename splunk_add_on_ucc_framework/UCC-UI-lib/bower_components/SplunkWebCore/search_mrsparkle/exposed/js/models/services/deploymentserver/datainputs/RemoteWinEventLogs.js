define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function(
        _,
        BaseInputModel
    ) {
        return BaseInputModel.extend({
            url: "deployment/server/setup/data/inputs/remote_eventlogs",
            urlRoot: "deployment/server/setup/data/inputs/remote_eventlogs"
        });
    }
);