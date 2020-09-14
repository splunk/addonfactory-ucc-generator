define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/TableHead',
        'views/shared/delegates/TableRowToggle',
        'views/licensing/table/TableRow',
        'views/licensing/table/MoreInfo',
        'models/Base'
    ],
    function(
        module,
        $,
        _,
        BaseView,
        TableHeadView,
        TableRowToggleView,
        TableRow,
        MoreInfo,
        BaseModel
    ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: true });

                var tableHeaders = [];
                tableHeaders.push({ label: _('i').t(), className: 'col-info', html: '<i class="icon-info"></i>' });
                tableHeaders.push({ label: _('License name').t()});
                tableHeaders.push({ label: _('Licensed daily volume').t()});
                tableHeaders.push({ label: _('Expires on').t()});

                this.children.head = new TableHeadView({
                    model: new BaseModel(),
                    columns: tableHeaders
                });
                this.children.rows = this.rowsFromCollection();
            },

            rowsFromCollection: function() {

                //gather all licenses belonging to active group
                return _.flatten(
                    this.collection.licenses.map(function(model, i) {
                        if ((model.entry.content.get('group_id') == this.model.activeGroup.entry.get('name'))) {
                            return [
                                new TableRow({
                                    model: {
                                        license: model
                                    },
                                    index: i
                                }),
                                new MoreInfo({
                                    model: {
                                        serverInfo: this.model.serverInfo,
                                        license: model
                                    },
                                    index: i
                                })
                            ];
                        }
                        else {
                            return [];
                        }
                    }, this)
                );
            },

            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.template);
                    this.children.head.render().prependTo(this.$('> .table-chrome'));
                }

                _(this.children.rows).each(function(row){
                    row.render().appendTo(this.$('.license-listings'));
                }, this);

                return this;
            },

            template: '\
                <table class="table table-chrome table-striped table-row-expanding table-listing">\
                <tbody class="license-listings"></tbody>\
                </table>\
            '
        });
    }
);
