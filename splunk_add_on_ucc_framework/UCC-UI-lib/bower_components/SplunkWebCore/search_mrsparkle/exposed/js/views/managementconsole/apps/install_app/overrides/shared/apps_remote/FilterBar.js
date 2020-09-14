define([
    'underscore',
    'module',
    'views/shared/apps_remote/FilterBar',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/TextControl'
], function(_,
            module,
            BaseView,
            ControlGroup,
            TextControl) {

    return BaseView.extend({
        moduleId: module.id,
        className: [BaseView.prototype.className, 'shared-appsremote-filterbar'].join(' '),

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.populateFilters({skipRender: true});
        },

        onOptionsSync: function() {
            BaseView.prototype.onOptionsSync.apply(this, arguments);
            this.render();
        }
    });
});
