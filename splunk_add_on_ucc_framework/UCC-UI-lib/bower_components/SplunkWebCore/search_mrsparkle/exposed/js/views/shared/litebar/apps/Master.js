define(
    [
        'module',
        '../../Menu',
        '../../splunkbar/MenuButton',
        './MenuContents',
        './MenuDialog',
        './Master.pcssm'
    ],
    function(
        module,
        MenuView,
        MenuButtonView,
        MenuContentsView,
        MenuDialogView,
        css
    ){
        return MenuView.extend({
            moduleId: module.id,
            css: css,
            initialize: function() {
                this.options.toggleView = new MenuButtonView({
                    html: this.options.label.render().el.innerHTML,
                    title: this.options.title || 'Splunk'
                });

                this.options.contentView = new MenuContentsView({
                    apps: this.options.apps,
                    model: {
                        application: this.model.application
                    }
                });

                MenuView.prototype.initialize.apply(this, arguments);
                
                this.children.dialog = new MenuDialogView({
                    contentView: this.options.contentView
                });
            }
        });
    });
