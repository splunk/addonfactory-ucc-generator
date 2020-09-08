define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/CollectionPaginator',
        'views/shared/delegates/Dock'
    ],
    function(
        _,
        module,
        BaseView,
        SyntheticSelectControl,
        PaginatorView,
        Dock
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'table-caption',
            /**
             * @param {Object} options {
             *     collection: {
             *          alertsAdmin: <collections.services.admin.Alerts>      
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                //title

                //control
                this.children.count = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group pull-left",
                    items: [
                        {value: 10, label: _('10 per page').t()},
                        {value: 20, label: _('20 per page').t()},
                        {value: 50, label: _('50 per page').t()},
                        {value: 100, label: _('100 per page').t()}
                    ],
                    model: this.collection.alertsAdmin.fetchData,
                    modelAttribute: 'count',
                    toggleClassName: 'btn-pill'
                });


                this.children.paginatorView = new PaginatorView({
                    collection: this.collection.alertsAdmin
                });

            },
            render: function() {
                this.$el.html(this.template);
                var $tableCaptionInner = this.$('.table-caption-inner');
                this.children.count.render().appendTo($tableCaptionInner);
                this.children.paginatorView.render().appendTo($tableCaptionInner);

                this.children.dock = new Dock({ el: this.el, affix: '.table-caption-inner' });
                return this;
            },
            template: '\
                <div class="table-caption-inner"></div>\
            '
        });
    }
);