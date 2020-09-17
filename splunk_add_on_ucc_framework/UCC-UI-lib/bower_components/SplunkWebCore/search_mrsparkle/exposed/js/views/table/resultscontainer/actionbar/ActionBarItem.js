define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/resultscontainer/actionbar/actionmenus/CleanMenu',
        'views/table/resultscontainer/actionbar/actionmenus/EditMenu',
        'views/table/resultscontainer/actionbar/actionmenus/FilterMenu',
        'views/table/resultscontainer/actionbar/actionmenus/NewMenu',
        'views/table/resultscontainer/actionbar/actionmenus/SortMenu',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu',
        'views/table/resultscontainer/actionbar/actionmenus/SummarizeMenu'
    ],
    function (
        $,
        _,
        module,
        Base,
        CleanMenu,
        EditMenu,
        FilterMenu,
        NewMenu,
        SortMenu,
        BaseMenu,
        SummarizeMenu
    ) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'li',

            initialize: function () {
                Base.prototype.initialize.apply(this, arguments);
                this.menuType = this.options.actionType.name;

                this.initializeMenu();
            },

            events: {
                'click a.dataset-action-menu-activator': function(e) {
                    e.preventDefault();
                    if (!this.$el.hasClass('disabled')) {
                        this.openMenu($(e.currentTarget));
                    }
                }
            },

            startListening: function() {
                this.listenTo(this.model.table.entry.content, 'change:dataset.display.selectedColumns change:dataset.display.selectedColumnValue change:dataset.display.selectedText change:dataset.display.selectionType', function() {
                    // Table selection has changed - must re-render action bar items to show latest enabled/disabled state
                    this.updateDisabledState();
                });
            },
            
            activate: function() {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                this.updateDisabledState();
                return Base.prototype.activate.apply(this, arguments);
            },

            initializeMenu: function() {
                var menuOptions = {
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        table: this.model.table
                    },
                    // TODO: Once all Menus inherit from BaseMenu, move onHiddenRemove and
                    // ignoreToggleMouseDown flags to BaseMenu PopTart constructor
                    onHiddenRemove: true,
                    ignoreToggleMouseDown: true
                };

                if (this.children.menu) {
                    this.children.menu.deactivate({deep: true}).remove();
                }

                switch (this.menuType) {
                    case 'clean':
                        this.children.menu = new CleanMenu(menuOptions);
                        break;
                    case 'edit':
                        this.children.menu = new EditMenu(menuOptions);
                        break;
                    case 'filter':
                        this.children.menu = new FilterMenu(menuOptions);
                        break;
                    case 'new':
                        this.children.menu = new NewMenu(menuOptions);
                        break;
                    case 'sort':
                        this.children.menu = new SortMenu(menuOptions);
                        break;
                    case 'summarize':
                        this.children.menu = new SummarizeMenu(menuOptions);
                        break;                        
                    default:
                        throw new Error('You must pass a valid menu type.');
                }
            },

            openMenu: function($target) {
                if (this.children.menu && this.children.menu.shown) {
                    this.children.menu.hide();
                    return;
                }

                $target.addClass('active');

                this.initializeMenu();
                this.children.menu.render().appendTo($('body'));
                this.children.menu.activate({deep: true});
                this.children.menu.show($target);
                this.children.menu.on('hide', function() {
                    $target.removeClass('active');
                }, this);
            },

            updateDisabledState: function() {
                // TODO: remove this if-clause after initial code review, once all Menus have ported over to
                // inherit from BaseMenu.js and therefore has updateDisabledState and allChildrenDisabled methods
                if (Object.getPrototypeOf(this.children.menu) instanceof BaseMenu) {
                    this.children.menu.updateDisabledState();
                    if (this.children.menu.allChildrenDisabled()) {
                        this.$el.addClass('disabled');
                    } else {
                        this.$el.removeClass('disabled');
                    }
                }
            },

            render: function () {
                this.$el.html(this.compiledTemplate({
                    _ : _,
                    label: this.options.actionType.label
                }));

                // On first page load, once the table model is populated, we must set the initial disabled state
                this.updateDisabledState();

                return this;
            },

            template: '\
               <a class="dataset-action-menu-activator" href="#"><%- label %><b class="caret"></b></a>\
            '
        });
    }
);
