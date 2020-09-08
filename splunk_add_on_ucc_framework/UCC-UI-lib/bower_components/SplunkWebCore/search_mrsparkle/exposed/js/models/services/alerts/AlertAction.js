define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
    ) {
        return BaseModel.extend({
            url: 'alerts/alert_actions'
        });
    }
);