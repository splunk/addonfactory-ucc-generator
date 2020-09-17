/**
 * Created by rtran on 3/31/16.
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'views/shared/apps_remote/apps/app/Master',
        'views/managementconsole/apps/add_app/overrides/shared/apps_remote/dialog/Master'
    ],
    function(
    $,
    _,
    module,
    BaseView,
    route,
    AppView,
    DialogView
){
    return AppView.extend({
        moduleId: module.id,

        initialize: function(options) {
            options = $.extend(true, options, {dialogViewClass: DialogView});
            AppView.prototype.initialize.call(this, options);
        },

        render: function() {
            var appId = this.model.appRemote.get('appid'),
                localApp = this.collection.appLocals.findByEntryName(appId),
                appContent = {};

            appContent.buttonText = _('Install').t();

            if (!localApp) {
                appContent.buttonClass = 'btn-primary install-button';
            } else {
                appContent.buttonClass = 'disabled';
            }

            appContent.link = "#";

            this.renderAppContent(appContent);
            return this;
        }
    });
});