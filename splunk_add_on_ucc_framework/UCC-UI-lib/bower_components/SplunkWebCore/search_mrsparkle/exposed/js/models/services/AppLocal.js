define(
    [
        'models/SplunkDBase',
        'util/general_utils'
    ],
    function(SplunkDBaseModel, general_utils) {
        return SplunkDBaseModel.extend({
            url: "apps/local",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            appAllowsDisable: function() {
                return this.entry.links.get("disable") ? true : false;
            },
            isCoreApp: function() {
                return general_utils.normalizeBoolean(this.entry.content.get('core'));
            },
            getSplunkAppsId: function() {
                var details = this.entry.content.get('details');
                if (details) {
                    var idRe = /\/apps\/id\/(.*)/g;
                    var res = idRe.exec(details);
                    if (res.length === 2) {
                        return res[1];
                    }
                }
            },
            isDisabled: function() {
                return this.entry.content.get('disabled');
            },
            getLink: function(name) {
                return this.entry.links.get(name);
            },
            // Using getAppId to match apps remote similar method name
            getAppId: function() {
                return this.entry.get('name');
            },
            // Using getTitle to match apps remote similar method name
            getTitle: function() {
                return this.entry.content.get('label');
            },
            getVersion: function() {
                return this.entry.content.get('version');
            },
            getDetails: function() {
                return this.entry.content.get('details');
            },
            getBuild: function() {
                return this.entry.content.get('build');
            }
        });
    }
);