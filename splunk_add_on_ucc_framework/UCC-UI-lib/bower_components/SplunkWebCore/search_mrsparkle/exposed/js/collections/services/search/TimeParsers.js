define(
    [
        "jquery",
        "underscore",
        "backbone",
        "models/services/search/TimeParser",
        "collections/Base",
        "util/splunkd_utils"
    ],
    function($, _, Backbone, TimeParserModel, CollectionsBase, splunkDUtils) {
        return CollectionsBase.extend({
            model: TimeParserModel,
            intialize: function() {
                CollectionsBase.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, collection, options) {
                var appOwner = {},
                    defaults = {
                        data: {output_mode: "json"},
                        traditional: true
                    };
                switch (method) {
                    case 'read':
                        if (options && options.data){
                            appOwner = $.extend(appOwner, { //JQuery purges undefined
                                app: options.data.app || undefined,
                                owner: options.data.owner || undefined
                            });
                            delete options.data.app;
                            delete options.data.owner;
                        }
                        defaults.url = splunkDUtils.fullpath(collection.url, appOwner);
                        $.extend(true, defaults, options || {});
                        return Backbone.sync.call(this, 'read', collection, defaults);
                    default:
                        throw 'Operation not supported';
                }
            },
            url: "/services/search/timeparser",
            parse: function(response) {
                var model,
                    models = [];
                for (var key in response) {
                    model = {};
                    model[key] = response[key];
                    models.push(model);
                }
                return models;
            }
        });
    }
);
