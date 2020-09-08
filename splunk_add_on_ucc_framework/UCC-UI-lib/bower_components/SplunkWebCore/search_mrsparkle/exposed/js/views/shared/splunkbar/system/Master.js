define(
[
    'underscore',
    'jquery',
    'module',
    'views/shared/Menu',
    '../MenuButton',
    './MenuContents',
    'uri/route'
],
function(
    _,
    $,
    module,
    MenuView,
    MenuButtonView,
    MenuContentsView,
    route
){
    return MenuView.extend({
        moduleId: module.id,
        initialize: function(){
            this.options.dontAddModuleIdAsClass = true;
            this.options.contentView = new MenuContentsView({
                collection: {
                    sections: this.collection.sections,
                    managers: this.collection.managers,
                    apps: this.collection.apps
                },
                model: {
                    application: this.model.application,
                    user: this.model.user
                }
            });
            this.options.toggleView = new MenuButtonView({label: _("Settings").t()});
            MenuView.prototype.initialize.apply(this, arguments);
        }
    });
});
