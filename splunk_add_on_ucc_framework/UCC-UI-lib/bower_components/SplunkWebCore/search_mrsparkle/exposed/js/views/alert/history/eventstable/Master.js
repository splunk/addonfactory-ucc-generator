define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/TableHead',
        'views/alert/history/eventstable/TableRow',
        'views/shared/delegates/TableDock'
    ],
    function(
        module,
        $,
        _,
        BaseView,
        TableHeadView,
        TableRow,
        TableDock
    ){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model:
             *          application: <models.Application>
             *     }
             *     collection: {
             *         alertsAdmin: <collections.services.admin.Alerts>  
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.head = new TableHeadView({
                    model: this.collection.alertsAdmin.fetchData,
                    columns: [
                        { label: '', className: 'col-index'},
                        { label: _('TriggerTime').t(), sortKey:'trigger_time', className: 'col-time'},
                        { label: _('Actions').t(), className: 'col-actions'}
                    ]
                });

                this.children.rows = this.rowsFromCollection();
                this.activate();
                this.children.tableDock = new TableDock({ el: this.el, offset: 36, dockScrollBar: false, defaultLayout: 'fixed'});

            },
            startListening: function() {
                this.listenTo(this.collection.alertsAdmin, 'reset remove', _.debounce(this.renderRows, 0));
            },
            rowsFromCollection: function() {
                return this.collection.alertsAdmin.map(function(model, i) {
                    return new TableRow({
                        model: {
                            alertAdmin: model,
                            application: this.model.application
                        },
                        index: i + this.collection.alertsAdmin.fetchData.get('offset') + 1
                    });
                },this);
            },
            _render: function() {
                _(this.children.rows).each(function(row){
                    row.render().appendTo(this.$('.triggered-alerts-listings'));
                }, this);
                this.children.tableDock.update();
            },
            renderRows: function() {
                 _(this.children.rows).each(function(row){ row.remove(); }, this);
                 this.children.rows = this.rowsFromCollection();
                 this._render();
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.template);
                    this.children.head.render().prependTo(this.$('> .table-chrome'));
                }
                this._render();
                return this;
            },
            template: '\
                <table class="table table-chrome table-striped table-hover">\
                    <tbody class="triggered-alerts-listings"></tbody>\
                </table>\
            '
        });
    }
);
