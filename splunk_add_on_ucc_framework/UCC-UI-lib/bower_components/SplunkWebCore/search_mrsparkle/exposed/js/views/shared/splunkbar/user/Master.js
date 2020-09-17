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
            this.options.mode = 'dialog';
            this.options.contentView = new MenuContentsView({
                model: this.model,
                collection: {
                    apps: this.collection.apps
                }
            });
            this.options.toggleView = new MenuButtonView({
                label: _("User").t(),
                icon: this.model.serverInfo.isCloud() || this.options.showIcon ? 'user' : undefined,
                truncateLongLabels: true,
                iconSize: this.options.iconSize || '1.667',
                model: this.model
            });
            this.toggle = this.options.toggleView;

            this.model.user.on('change', this.render, this);
            if (this.model.user.entry.get('name')) {
                this.updateName();
            }
            MenuView.prototype.initialize.apply(this, arguments);
        },

        _getName: function() {
            var realName = this.model.user.entry.content.get('realname'),
                name = realName && realName.length ? realName : this.model.user.entry.get('name');

            return name;
        },

        updateName: function() {
            this.toggle.set({label: this._getName()});
        }
    });
});
