define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/apps_remote/ResultsPane',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/apps/Master',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/SortFilter'
], function(
    $,
    _,
    Backbone,
    module,
    ResultsPane,
    AppsBoxView,
    SortFilterView
){
    return ResultsPane.extend({
        moduleId: module.id,

        initialize: function(options) {
            options = $.extend(true, options, {
              appsBoxViewClass: AppsBoxView,
              sortFilterClass: SortFilterView
            });
            ResultsPane.prototype.initialize.call(this, options);
        }
    });
});