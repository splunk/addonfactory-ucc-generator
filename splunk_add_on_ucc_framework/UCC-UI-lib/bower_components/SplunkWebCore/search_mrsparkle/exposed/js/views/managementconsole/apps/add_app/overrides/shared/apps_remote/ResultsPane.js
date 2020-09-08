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
        'views/shared/apps_remote/ResultsPane',
        'views/managementconsole/apps/add_app/overrides/shared/apps_remote/apps/Master'
    ],
    function(
    $,
    _,
    module,
    BaseView,
    route,
    ResultsPane,
    AppsBoxView
){
    return ResultsPane.extend({
        moduleId: module.id,

        initialize: function(options) {
            options = $.extend(true, options, {appsBoxViewClass: AppsBoxView});
            ResultsPane.prototype.initialize.call(this, options);
        }
    });
});