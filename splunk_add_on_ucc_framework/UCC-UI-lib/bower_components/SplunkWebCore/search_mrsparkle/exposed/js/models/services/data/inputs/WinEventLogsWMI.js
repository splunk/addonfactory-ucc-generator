define(
    [
        'models/services/data/inputs/BaseInputModel'
    ],
    function (BaseInputModel) {
        return BaseInputModel.extend({
            url: "admin/win-wmi-enum-eventlogs",
            urlRoot: "admin/win-wmi-enum-eventlogs"
        });
    }
);