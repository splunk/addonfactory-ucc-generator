define(
[
    'underscore',
    'jquery',
    'module',
    'views/shared/Menu',
    '../MenuButton',
    './MenuContents',
    'splunk.util',
    'uri/route'
],
function(
    _,
    $,
    module,
    MenuView,
    MenuButtonView,
    MenuContentsView,
    splunk_util,
    route
){
    return MenuView.extend({
        moduleId: module.id,
        initialize: function(){
            this.options.toggleView = new MenuButtonView({ label: _('Activity').t() });
            this.options.contentView = new MenuContentsView({
                model: {
                    user: this.model.user,
                    application: this.model.application
                }
            });

            MenuView.prototype.initialize.apply(this, arguments);
        }
    });
});
