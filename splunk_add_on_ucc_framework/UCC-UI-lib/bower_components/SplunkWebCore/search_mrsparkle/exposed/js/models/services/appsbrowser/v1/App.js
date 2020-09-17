define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        splunkDUtils
    ) {
        return BaseModel.extend({
            url: 'appsbrowser/v1/app/',

            sync: function(method, model, options) {
                if (method !== 'read') {
                    throw new Error('Sync operation not supported: ' + method);
                }

                if (!model.id) {
                    throw new Error('Cannot fetch a model without an id');
                }

                options = options || {};

                var defaults = {
                    data: {},
                    dataType: 'json'
                };

                // The trailing / is the only reason we don't get a cross site scripting error - otherwise
                // the request actually redirects to splunkbase. WHO THE HELL THOUGHT THIS WAS A GOOD IDEA???
                defaults.url = splunkDUtils.fullpath(model.url + encodeURIComponent(model.id) + '/');

                $.extend(true, defaults, options);
                return Backbone.sync.call(this, method, model, defaults);
            },

            isInstallable: function() {
                return (this.get('access') !== 'restricted' && this.get('release') !== null);
            },

            getInstallString: function() {
                return '';
            },

            getAppId: function() {
                return this.get('appid');
            },

            getTitle: function() {
                return this.get('title');
            },

            getIcon: function() {
                return this.get('icon');
            },

            getVersion: function() {
                var release = this.get('release');

                if (release) {
                    return release.title;
                }
            },

            getDescription: function() {
                var description = this.get('description');

                if (description) {
                    return _(description).t();
                }
            }
        });
    }
);
