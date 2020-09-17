define(
    [
        "jquery",
        "models/services/data/inputs/WinPerfmonWMIFind",
        "collections/SplunkDsBase"
    ],
    function($, PerfmonFind, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "admin/win-wmi-find-collection",
            model: PerfmonFind,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },

            sync: function(method, model, options) {
                // some weird condition: when we fetch this collection with class and server args, the returned data
                // updates the model's server attribute and backbone makes an extra fetch with changed 'server'
                // url arg.
                // Here we try to avoid that by catching the condition of empty class array, which is true only under this
                // weird condition and returning a dummy promise.
                if (options.data['class'] && options.data['class'].length == 0) {
                    return $.Deferred().reject();
                }

                return SplunkDsBaseCollection.prototype.sync.call(this, method, model, options);
            }
        });
    }
);
