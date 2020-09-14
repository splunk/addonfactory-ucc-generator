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
        'views/shared/apps_remote/apps/Master',
        'views/managementconsole/apps/add_app/overrides/shared/apps_remote/apps/app/Master'
    ],
    function(
    $,
    _,
    module,
    BaseView,
    route,
    AppsBoxView,
    AppView
){
    return AppsBoxView.extend({
        moduleId: module.id,

        initialize: function(options) {
            options = $.extend(true, options, {appViewClass: AppView});
            AppsBoxView.prototype.initialize.call(this, options);
        }
    });
});