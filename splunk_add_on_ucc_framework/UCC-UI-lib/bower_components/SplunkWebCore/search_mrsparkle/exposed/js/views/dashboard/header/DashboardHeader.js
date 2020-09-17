define([
    'module',
    'jquery',
    'underscore',
    '../Base',
    './Title',
    './Description',
    './EditMenu',
    'views/dashboard/editor/TitleEditor',
    'views/dashboard/editor/DescriptionEditor'
], function(module,
            $,
            _,
            BaseDashboardView,
            TitleView,
            DescriptionView,
            EditMenuView,
            TitleEditor,
            DescriptionEditor) {

    return BaseDashboardView.extend({
        moduleId: module.id,
        viewOptions: {
            register: false
        },
        className: 'dashboard-header',
        initialize: function(options) {
            BaseDashboardView.prototype.initialize.apply(this, arguments);
            this.showMenu = !options.hideMenu;
            this.showDescription = !!options.showDescription;
            this.allowEdit = options.allowEdit === true;
            this.deferreds = options.deferreds;
            this.listenTo(this.model.state, 'change:mode', this.render);
            this.listenTo(this.settings, "change", this._handleSettingChange);
        },
        _handleSettingChange: function() {
            this.model.controller.trigger('edit:dashboard', {
                dashboardId: this.settings.get("id")
            });
        },
        render: function() {
            this.removeTitleView();
            this.removeDescriptionView();
            if (this.children.editMenuView) {
                this.children.editMenuView.remove();
                this.children.editMenuView = null;
            }
            if ((this.allowEdit && this.isEditMode()) || !this.showMenu) {
                if ((this.allowEdit && this.isEditMode())) {
                    this.createDescriptionEditor();
                    this.createDashboardTitleEditor();
                } else {
                    this.createTitleView();
                    if (this.showDescription) {
                        this.createDescriptionView();
                    }
                }
            } else if (!this.model.page.get("hideTitle")) {
                // render menu once the scheduleView ready
                this.removeTitleView();
                this.removeDescriptionView();
                $.when(this.deferreds.scheduledView, this.deferreds.userPref).then(this.renderMenu.bind(this));
            }
            return this;
        },
        renderMenu: function() {
            if (!this.model.page.get('hideEdit')) {
                this.children.editMenuView = new EditMenuView({
                    model: this.model,
                    collection: {
                        apps: this.collection.appLocalsUnfilteredAll
                    }
                });
                this.children.editMenuView.render().$el.appendTo(this.$el);
            }
            this.createTitleView();
            if (this.showDescription) {
                this.createDescriptionView();
            }
        },
        createTitleView: function() {
            this.children.titleView = new TitleView({
                model: this.model
            });
            this.children.titleView.render().$el.appendTo(this.$el);
        },
        removeTitleView: function() {
            if (this.children.titleView) {
                this.children.titleView.remove();
                this.children.titleView = null;
            }
        },
        createDescriptionView: function() {
            this.children.descriptionView = new DescriptionView({
                model: this.settings
            });
            this.children.descriptionView.render().$el.appendTo(this.$el);
        },
        removeDescriptionView: function() {
            if (this.children.descriptionView) {
                this.children.descriptionView.remove();
                this.children.descriptionView = null;
            }
        },
        createDashboardTitleEditor: function() {
            this.removeTitleView();
            this.children.titleView = new TitleEditor({
                model: this.settings,
                attribute: 'label',
                placeholder: _('No label').t(),
                tokens: false
            });
            this.children.titleView.render().$el.prependTo(this.$el);
        },
        createDescriptionEditor: function() {
            this.removeDescriptionView();
            this.children.descriptionView = new DescriptionEditor({
                model: this.settings,
                attribute: 'description',
                placeholder: _('No description').t(),
                tokens: false
            });
            this.children.descriptionView.render().$el.prependTo(this.$el);
        }
    });
});
