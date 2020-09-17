define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/commands/Base',
        'views/Base',
        'views/table/resultscontainer/actionbar/ActionBarItem',
        'views/table/modals/FieldRemovalDialog'
    ],
    function(
        $,
        _,
        module,
        BaseCommandModel,
        BaseView,
        ActionBarItem,
        FieldRemovalDialog
    ) {
        // actionTypes has been set as a class member instead of on the instance
        // so that it can be accessed from tests without having to instantiate the ActionBar
        // e.g. for test_actionbaritem, a child of ActionBar
        var actionTypes = [
            {
                name: 'edit',
                label: _('Edit').t()
            },
            {
                name: 'sort',
                label: _('Sort').t()
            },
            {
                name: 'filter',
                label: _('Filter').t()
            },
            {
                name: 'clean',
                label: _('Clean').t()
            },
            {
                name: 'summarize',
                label: _('Summarize').t()
            },
            {
                name: 'new',
                label: _('Add New').t()
            }
        ];

        return BaseView.extend({
            moduleId: module.id,
            tagName: 'ul',
            className: 'nav dataset-action-menu-list',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.actionMenus = [];

                _(actionTypes).each(function(actionType) {
                    this.children.actionMenus.push(new ActionBarItem({
                        model: {
                            resultJsonRows: this.model.resultJsonRows,
                            state: this.model.state,
                            table: this.model.table,
                            application: this.model.application,
                            currentPointJob: this.model.currentPointJob
                        },
                        actionType: actionType
                    }));
                }.bind(this));
            },

            startListening: function() {
                this.listenTo(this.model.state, 'showFieldDialog', function(options) {
                    this.children.fieldRemovalDialog && this.children.fieldRemovalDialog.remove();
                    this.children.fieldRemovalDialog = new FieldRemovalDialog({
                        fields: options.fields
                    });
                    this.children.fieldRemovalDialog.render().appendTo($('body')).show();
                    this.listenTo(this.children.fieldRemovalDialog, 'accepted', function() {
                        options.callback();
                    });
                });
            },

            updateMenuItemsState: function(options) {
                options = options || {};

                _.each(this.children.actionMenus, function(actionMenu) {
                    if (options.disable) {
                        actionMenu.$el.addClass('disabled');
                    } else {
                        actionMenu.updateDisabledState();
                    }
                });
            },

            render: function() {
                _(this.children.actionMenus).each(function(child) {
                    child.render().appendTo(this.$el);
                }.bind(this));

                return this;
            }
        }, {
            actionTypes: actionTypes
        });
    }
);
