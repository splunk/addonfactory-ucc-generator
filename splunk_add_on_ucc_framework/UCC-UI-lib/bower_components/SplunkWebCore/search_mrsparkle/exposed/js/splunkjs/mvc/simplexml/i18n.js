define(function(require, exports, module) {
    var route = require('uri/route');
    var controller = require('splunkjs/mvc/simplexml/controller');

    return {
        load: function(name, req, onLoad, config) {
            var appModel = controller.model.app;
            var root = appModel.get('root');
            var locale = appModel.get('locale');
            var app = appModel.get('app');
            name = name || appModel.get('page');

            var resource = route.viewStrings(root, locale, app, name );
            req([resource], function (value) {
                onLoad(value);
            });
        }
    };
});
