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
    css,
    route
){
    return MenuView.extend({
        moduleId: module.id,
        initialize: function(){
            var isCloud = this.model.serverInfo.isCloud(),
                defaults = {
                    mode: 'dialog',
                    hideLabelsAtSmallScreenSizes: isCloud,
                    showIcon: isCloud
                };
            _.defaults(this.options, defaults);

            this.options.contentView = new MenuContentsView({
                model: this.model,
                collection: {
                    apps: this.collection.apps
                },
                hasTours: this.options.hasTours
            });

            this.options.toggleView = new MenuButtonView({
                    label: isCloud ? _("Support & Services").t() : _("Help").t(),
                    icon: this.options.showIcon ? 'questionCircle' : undefined,
                    hideLabelsAtSmallScreenSizes: this.options.hideLabelsAtSmallScreenSizes,
                    iconSize: this.options.iconSize || '1.667',
                    model: this.model
                });
            MenuView.prototype.initialize.apply(this, arguments);
        }
    });
});
