define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/CollectionPaginator',
        'views/alert_actions/caption/Count',
        'views/alert_actions/caption/LoadingIndicator',
        'views/shared/controls/ControlGroup',
        'views/shared/FindInput',
        'views/shared/delegates/Dock'
    ],
    function(
        _,
        module,
        BaseView,
        PaginatorView,
        CountView,
        LoadingIndicator,
        ControlGroup,
        InputView,
        Dock
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'table-caption',
            /**
             * @param {Object} options {
             *     countLabel: <String> The count vanity label
             *     model: {
             *         state: <models.State>,
             *         uiPrefs: <models.services.admin.UIPrefs>
             *         rawSearch: <models.Base> (Optional)
             *     }, 
             *     collection: <collections.services.SavedSearches>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.count = new CountView({
                    countLabel: this.options.countLabel,
                    model: this.model.state,
                    collection: this.collection.alertActions
                });

                this.children.paginatorView = new PaginatorView({
                    collection: this.collection.alertActions,
                    model: this.model.state
                });

                this.children.input = new InputView({
                    model: this.model.state,
                    rawSearch: this.model.rawSearch,
                    key: this.options.filterKey
                });
                
                this.children.loading = new LoadingIndicator({
                    model: this.model.state
                });
            },
            render: function() {
                this.$el.append(this.template);
                var $ct = this.$('.table-caption-inner');
                this.children.count.render().appendTo($ct);
                this.children.paginatorView.render().appendTo($ct);
                this.children.input.render().appendTo($ct);
                this.children.loading.render().appendTo($ct);
                this.children.tableDock = new Dock({ el: this.el, affix: '.table-caption-inner' });
                return this;
            },
            template: '<div class="table-caption-inner"></div>'
        });
    }
);
