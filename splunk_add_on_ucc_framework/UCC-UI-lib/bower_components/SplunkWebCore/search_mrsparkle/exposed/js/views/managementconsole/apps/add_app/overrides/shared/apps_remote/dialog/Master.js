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
        'views/shared/apps_remote/dialog/Master'
    ],
    function(
    $,
    _,
    module,
    BaseView,
    route,
    DialogView
){
    return DialogView.extend({
        moduleId: module.id,

        installApp: function() {
            this.model.appModel.entry.content.set({
                appId: this.model.appRemote.get('appid'),
                auth: this.model.auth.get('sbsessionid')
            });

            this.hide();
            this.model.wizard.trigger('clearFile');
            this.model.wizard.trigger('stepForward');
        }
    });
});