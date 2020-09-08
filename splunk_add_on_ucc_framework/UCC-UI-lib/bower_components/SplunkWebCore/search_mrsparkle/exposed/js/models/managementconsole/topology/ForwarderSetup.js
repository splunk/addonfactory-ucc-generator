define(
    [
        'models/managementconsole/DmcBase'
    ],
    function(
        DmcBaseModel
    ) {
        return DmcBaseModel.extend(
            {
                url: '/services/dmc/forwardersetup'
            }
        );
    }
);