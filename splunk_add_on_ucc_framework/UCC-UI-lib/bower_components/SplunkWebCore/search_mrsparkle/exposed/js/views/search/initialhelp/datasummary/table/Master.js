define(
    [
        'module',
        'jquery',
        'underscore',
        'models/Base',
        'views/Base',
        'views/shared/TableHead',
        'views/search/initialhelp/datasummary/table/TableRow',
        'views/shared/delegates/TableHeadStatic',
        'views/shared/delegates/StopScrollPropagation'
    ],
    function(
        module,
        $,
        _,
        BaseModel,
        Base,
        TableHead,
        TableRow,
        TableHeadStatic,
        StopScrollPropagation
    ){
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model:
             *          application: <models.Application>
             *          results: <models.services.search.job.ResultsV2>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                var columns = [
                   {
                      html: '<i class="icon-chart-column"></i>'
                   },
                   {
                      label: _("Count").t(),
                      sortKey: "totalCount"
                   },
                   {
                      label: _("Last Update").t(),
                      sortKey: "recentTime"
                   }
                ];
                
                this.model.state = new BaseModel();

                this.children.head = new TableHead({
                    model: this.model.result.fetchData,
                    columns: this.options.firstColumn.concat(columns)
                });

                this.children.rows = this.rowsFromResult();
                
                this.listenTo(this.model.result, 'sync', this.createRows);
                this.listenTo(this.model.state, 'change:quickReportOpen', function() {
                    if (this.model.state.get("quickReportOpen")){
                        this.stopListening(this.model.result, 'sync', this.createRows);
                    } else {
                        this.listenTo(this.model.result, 'sync', this.createRows);
                    }
                });
            },
            events: {
                'click th': function(e) {
                    var $target = $(e.currentTarget),
                        sortKey = $target.attr('data-key'),
                        sortDirection = $target.hasClass('desc') ? 'asc': 'desc';
                    if (!sortKey) {
                        return true;
                    }
                    this.model.result.fetchData.set({sortKey: sortKey, sortDirection: sortDirection});
                    e.preventDefault();
                }
            },
            rowsFromResult: function() {
                return this.model.result.results.map(function(model, i) {
                    return new TableRow({
                        type: this.options.type,
                        model: {
                            result: model,
                            state: this.model.state,
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            intentionsParser: this.model.intentionsParser,
                            serverInfo: this.model.serverInfo
                        },
                        index: i + this.model.result.fetchData.get('offset') + 1
                    });
                },this);
            },
            renderRows: function() {
                if (this.children.rows.length > 0) {
                    this.$("tr.waiting").remove();
                }
                _(this.children.rows).each(function(row){
                    row.render().appendTo(this.$('.data-summary-rows'));
                }, this);
                this.children.tableHeadStatic.update();
            },
            createRows: function() {
                 _(this.children.rows).each(function(row){ row.remove(); }, this);
                 this.children.rows = this.rowsFromResult();
                 this.renderRows();
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.compiledTemplate({
                        _: _
                    }));
                    
                    this.children.head.render().prependTo(this.$('.table'));
                    this.children.tableHeadStatic = new TableHeadStatic({ el: this.el, flexWidthColumn: 0, offset: 42, defaultLayout: 'auto'});
                }
                this.renderRows();
                
                this.children.stopScrollPropagation = new StopScrollPropagation({el: this.$(".scroll-table-wrapper")});
                return this;
            },
            template: '\
                <div class="header-table-static"></div>\
                <div class="scroll-table-wrapper">\
                    <table class="table table-chrome table-striped table-hover">\
                        <tbody class="data-summary-rows">\
                            <tr class="waiting"><td colspan="4"><%- _("Waiting for results...").t() %></td></tr>\
                        </tbody>\
                    </table>\
                </div>\
            '
        });
    }
);
