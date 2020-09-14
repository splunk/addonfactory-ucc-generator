define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/header/DashboardHeader',
        'views/dashboard/header/DashboardMessages'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             HeaderView,
             DashboardMessages) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            className: 'dashboard',
            initialize: function() {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.children.messages = new DashboardMessages({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.options.deferreds
                });
                this.children.headerView = new HeaderView({
                    model: this.model,
                    collection: this.collection,
                    settings:this.settings,
                    deferreds: this.options.deferreds,
                    showDescription: true,
                    allowEdit: true
                });
                this.model.page.setFromDashboardXML(this.settings.toJSON());
                this.listenTo(this.model.state, 'change:mode', this._onModeChange);
            },
            render: function() {
                this.children.messages.render().$el.appendTo(this.$el);
                this.children.headerView.render().$el.appendTo(this.$el);
                this._onModeChange();
                return this;
            },
            remove: function() {
                this.model.page.removeFromDashboardXML();
                BaseDashboardView.prototype.remove.apply(this, arguments);
            },
            _onModeChange: function() {
                var previousMode = this.model.state.previous('mode');
                var newMode = this.model.state.get('mode');
                this.$el.removeClass(previousMode + '-mode').addClass(newMode + '-mode');
            }
        });
    }
);
