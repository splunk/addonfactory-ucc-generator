define(
    [
        'models/services/data/inputs/BaseInputModel'
    ],
    function(BaseInputModel) {
        return BaseInputModel.extend({
            url: "deployment/server/setup/data/inputs/remote_udp"
        });
    }
);