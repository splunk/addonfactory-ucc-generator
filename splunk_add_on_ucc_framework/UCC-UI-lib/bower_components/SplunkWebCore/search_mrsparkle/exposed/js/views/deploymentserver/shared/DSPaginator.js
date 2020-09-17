define([
    'module',
    'underscore',
    'views/Base',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/EAIPaginatorWithFiltering',
    'views/shared/CollectionCount'
],
function(
    module,
    _,
    BaseView,
    SyntheticSelectControl,
    EAIPaginator,
    CollectionCountView
) {
    return BaseView.extend({
        moduleId: module.id,
        /**
         * @param {Object} options {
         *      model: <models.Base>,
         *      collection: <collections.SplunkDsBaseV2>
         * }
         */
        className: 'paginator_container',
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            // Paginator for clients table
            this.children.paginator = new EAIPaginator(
                    {
                        model: this.model,
                        collection: this.collection
                    }
            );

            this.children.count = new SyntheticSelectControl({
                        modelAttribute: 'count',
                        model: this.model,
                        items: [
                            { value: '10',  label: _('10 Per Page').t()  },
                            { value: '20',  label: _('20 Per Page').t()  },
                            { value: '50',  label: _('50 Per Page').t()  },
                            { value: '100', label: _('100 Per Page').t() }
                        ],
                        save: false,
                        elastic: true,
                        menuWidth: "narrow",
                        toggleClassName: 'btn-pill',
                        popdownOptions: {attachDialogTo: 'body'}
            });

            this.children.collectionCount = new CollectionCountView({
                collection: this.collection,
                countLabel: _('Clients').t()
            });

        },
        render: function() {
            var html = this.children.paginator.render().el;
            this.$el.append(this.children.collectionCount.render().el);
            this.$el.append(this.children.count.render().el);
            this.$el.append(this.children.paginator.render().el);
            return this;
        }
    });
});

