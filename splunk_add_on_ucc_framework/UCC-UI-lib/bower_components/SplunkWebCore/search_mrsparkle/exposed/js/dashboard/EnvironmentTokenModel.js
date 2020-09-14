define(['underscore', 'backbone', 'util/readonly'], function(_, Backbone, readOnly) {

    /**
     * Simple token model holding some environment information, such as current username, app and some server
     * and product information
     */
    var EnvironmentTokenModel = Backbone.Model.extend({}, {
        /**
         * Returns a read-only model containing some environment information, which can be used in dashboard
         * for general purpose token-replacement.
         *
         * @param options.model.application
         * @param options.model.serverInfo
         * @param options.model.user
         * @param options.model.view
         * @param options.deferreds.serverInfo
         * @param options.deferreds.user
         * @param options.deferreds.view
         * @returns {*|Backbone.Model}
         */
        createEnvironmentTokenModel: function(options) {
            var data = {
                app: options.model.application.get('app'),
                locale: options.model.application.get('locale'),
                page: options.model.application.get('page'),
                user: options.model.application.get('owner')
            };

            var model = new EnvironmentTokenModel(data);

            options.deferreds.serverInfo.then(function() {
                model.set('version', options.model.serverInfo.entry.content.get('version'));
                var productType = options.model.serverInfo.entry.content.get('product_type');
                model.set('product', productType);
                var productTypes = ['enterprise', 'hunk', 'lite', 'lite_free'];
                _(productTypes).each(function(type) {
                    if (productType == type) {
                        model.set('is_' + type, 'true');
                    }
                });
                if (options.model.serverInfo.isFreeLicense()) {
                    model.set('is_free', 'true');
                }
                var instanceType = options.model.serverInfo.entry.content.get('instance_type');
                if (instanceType) {
                    model.set('instance_type', instanceType);
                    if (instanceType == 'cloud') {
                        model.set('is_cloud', 'true');
                    }
                }
            });

            options.deferreds.user.then(function() {
                model.set('user_realname', options.model.user.entry.content.get('realname'));
                model.set('user_email', options.model.user.entry.content.get('email'));
            });

            var updateViewLabel = function() {
                model.set('view_label', options.model.view.entry.content.get('label'));
            };

            options.deferreds.view.then(function() {
                updateViewLabel();
                model.listenTo(options.model.view.entry.content, 'change:label', updateViewLabel);
            });

            return readOnly.readOnlyModel(model);
        }
    });

    return EnvironmentTokenModel;
});