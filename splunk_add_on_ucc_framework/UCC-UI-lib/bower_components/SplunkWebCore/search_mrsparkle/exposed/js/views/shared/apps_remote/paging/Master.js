define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/CollectionPaginator',
        'views/shared/apps_remote/paging/Counter'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        CollectionPaginator,
        CounterView
        ){
        return BaseView.extend({
            moduleId: module.id,
			className: "paging-bar",
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.counter = new CounterView({
                    collection: this.collection
                });
                this.children.paginator = new CollectionPaginator({
                    model: this.model,
                    collection: this.collection
                });
            },
            
            render: function() {
                this.children.paginator.render().appendTo(this.$el);
                this.children.counter.render().appendTo(this.$el);
            }
        });
    });
