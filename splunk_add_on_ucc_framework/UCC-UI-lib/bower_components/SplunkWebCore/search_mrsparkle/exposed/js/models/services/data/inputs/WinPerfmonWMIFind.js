define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function (
        _,
        BaseInputModel
    ) {
        return BaseInputModel.extend({
            url: "data/inputs/win-wmi-find-collection",
            urlRoot: "data/inputs/win-wmi-find-collection"
        });
    }
);