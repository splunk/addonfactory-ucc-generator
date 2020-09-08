define(
[
    'underscore',
    'jquery',
    'module',
    'views/shared/Menu',
    '../MenuButton',
    './MenuContents'
],
function(
    _,
    $,
    module,
    MenuView,
    MenuButtonView,
    MenuContentsView
){
    return MenuView.extend({
        moduleId: module.id,
        initialize: function(){
            this.options.mode = 'dialog';
            this.options.contentView = new MenuContentsView({
                model: this.model,
                collection: this.collection
            });
            this.options.toggleView = new MenuButtonView({
                    label:  this.model.webConf.entry.content.get('productMenuLabel') || _("My Splunk").t(),
                    hideLabelsAtSmallScreenSizes: true,
                    icon: 'greater',
                    iconSize: this.options.iconSize || '1.667',
                    model: this.model
                });
            MenuView.prototype.initialize.apply(this, arguments);
        }
    });
});
