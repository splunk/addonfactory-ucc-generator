define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/apps_remote/apps/Master',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/apps/app/Master'
], function(
    $,
    _,
    Backbone,
    module,
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
