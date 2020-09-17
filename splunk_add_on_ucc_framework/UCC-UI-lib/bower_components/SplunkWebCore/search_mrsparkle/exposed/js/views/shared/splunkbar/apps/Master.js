define(
    [
        'underscore',
        'jquery',
        'module',
        '../../Menu',
        '../MenuButton',
        './MenuContents',
        'splunk.util',
        './Master.pcssm',
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
        css,
        route
    ){
        return MenuView.extend({
            moduleId: module.id,
            css: css,
            initialize: function() {

                if(this.options.activeMenu && this.options.activeMenu.name === 'app'){
                    this.currentApp = this.model.application.get('app');
                }
                this.collection.apps.on('ready change reset', this.debouncedRender, this);

                if (this.collection.apps.length > 0) {
                    this.debouncedRender();
                }

                this.options.toggleView = new MenuButtonView({
                    label:  _('Apps').t(),
                    truncateLongLabels: true
                });
                this.options.contentView = new MenuContentsView({
                    collection: {
                        apps: this.collection.apps
                    },
                    model: {
                        user: this.model.user,
                        application: this.model.application
                    },
                    activeMenu: this.options.activeMenu
                });

                MenuView.prototype.initialize.apply(this, arguments);

            },
            render: function() {
                MenuView.prototype.render.apply(this, arguments);

                // TO DO: Simplify this...
                var that = this,
                    curApp = null;

                this.collection.apps.each(function(model, key, list) {
                    if(model.entry.get('name') === that.currentApp && model.entry.content.get('show_in_nav')) {
                        curApp = model;
                    }
                });

                curApp && this.options.toggleView.set({label: _('App:').t() + ' ' + _(curApp.entry.content.get('label')).t() });

                this.children.popdown && this.children.popdown.on('show', this.options.contentView.setIcons, this);
                return this;
            }
        });
    });
