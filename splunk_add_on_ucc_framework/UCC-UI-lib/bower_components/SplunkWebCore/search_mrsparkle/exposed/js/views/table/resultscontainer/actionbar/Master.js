define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/resultscontainer/actionbar/StandardActions',
        'views/table/resultscontainer/actionbar/CutAndMove'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        StandardActionsView,
        CutAndMoveView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'dataset-action-bar',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.standardActions = new StandardActionsView({
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        table: this.model.table,
                        application: this.model.application,
                        currentPointJob: this.model.currentPointJob
                    }
                });

                this.children.cutAndMove = new CutAndMoveView({
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        table: this.model.table,
                        application: this.model.application,
                        currentPointJob: this.model.currentPointJob
                    }
                });
            },

            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }

                this.manageStateOfChildren();

                return BaseView.prototype.activate.call(this, clonedOptions);
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'change:activeActionBar', this.manageStateOfChildren);
            },

            manageStateOfChildren: function() {
                var activeActionBar = this.model.state.get('activeActionBar');

                if (activeActionBar === 'cutAndMove') {
                    this.children.standardActions.deactivate({ deep: true }).$el.hide();
                    this.children.cutAndMove.activate({ deep: true }).$el.css('display', '');
                } else {
                    this.children.standardActions.activate({ deep: true }).$el.css('display', '');
                    this.children.cutAndMove.deactivate({ deep: true }).$el.hide();
                }
            },

            updateMenuItemsState: function(options) {
                this.children.standardActions.updateMenuItemsState(options);
                this.children.cutAndMove.updateMenuItemsState(options);
            },

            render: function() {
                this.children.standardActions.render().appendTo(this.$el);
                this.children.cutAndMove.render().appendTo(this.$el);

                return this;
            }
        });
    }
);
