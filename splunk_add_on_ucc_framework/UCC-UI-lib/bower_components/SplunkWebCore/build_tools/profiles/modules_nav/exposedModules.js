define(function(require) {
    return {
        'backbone': require('backbone'),
        'models/services/server/ServerInfo': require('models/services/server/ServerInfo'),
        'models/shared/User': require('models/shared/User'),
        'views/shared/splunkbar/Master': require('views/shared/splunkbar/Master'),
        'views/shared/appbar/Master': require('views/shared/appbar/Master'),
        'views/shared/litebar/Master': require('views/shared/litebar/Master'),
        'views/shared/footer/Master': require('views/shared/footer/Master'),
        'models/shared/Application': require('models/shared/Application'),
        'models/config': require('models/config'),
        'views/shared/litebar/Master': require('views/shared/litebar/Master'),
        'collections/services/data/ui/Tours': require('collections/services/data/ui/Tours'),
        'util/splunkd_utils': require('util/splunkd_utils')
    };
});
