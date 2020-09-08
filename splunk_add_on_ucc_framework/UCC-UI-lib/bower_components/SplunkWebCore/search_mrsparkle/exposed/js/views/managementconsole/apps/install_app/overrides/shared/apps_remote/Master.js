define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/apps_remote/Master',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/ResultsPane',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/FilterBar',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/apps/dialog/Master'
], function(
    $,
    _,
    Backbone,
    module,
    AppsRemoteMasterView,
    ResultsPane,
    FilterBar,
    DialogView
  ) {

    return AppsRemoteMasterView.extend({
        moduleId: module.id,

        initialize: function(options) {
            options = $.extend(true, options, {resultsPaneClass: ResultsPane, filterBarClass: FilterBar});
            AppsRemoteMasterView.prototype.initialize.call(this, options);

            this.listenTo(this.collection.appsRemote, 'sync', this.showSuccessDialog);
        },

        showSuccessDialog: function() {
            var onLoadAppId = this.model.metadata.get('appId'),
                appRemote;

            if (onLoadAppId) {
                appRemote = this.collection.appsRemote.findWhere({
                  appid: onLoadAppId
                });

                this.model.metadata.unset('appId', {silent: true});
                this.model.metadata.save({}, {replaceState: true, silent: true});

                var dialogView = new DialogView({
                    appId: onLoadAppId,
                    model: $.extend({}, this.model, {
                      appRemote: appRemote
                    }),
                    collection: this.collection
                });

                $('body').append(dialogView.render().el);
                dialogView.show();
            }
        }
    });
});
