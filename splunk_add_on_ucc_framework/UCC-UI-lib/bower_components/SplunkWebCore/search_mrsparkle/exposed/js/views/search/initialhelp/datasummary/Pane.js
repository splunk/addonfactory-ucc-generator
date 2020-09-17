define(
    [
        'module',
        'views/Base',
        'views/search/initialhelp/datasummary/table/Master',
        'views/shared/FindInput',
        'views/shared/SearchResultsPaginator'
    ],
    function(module, Base, Table, Filter, SearchResultsPaginator) {
        return Base.extend({
            moduleId: module.id,
            className: 'tab-pane',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                var firstColumn = [
                    {
                       label: this.options.label,
                       sortKey: this.options.type
                    }
                ];
                
                this.children.filter = new Filter({
                    model: this.model.result.fetchData,
                    key: this.options.type,
                    fetchDataFilter: true
                });
                
                this.children.searchResultsPaginator = new SearchResultsPaginator({
                    mode: "results_preview",
                    model: {
                        state: this.model.result.fetchData,
                        searchJob: this.model.searchJob,
                        results: this.model.result
                    }
                });
                
                this.children.table = new Table({
                    firstColumn: firstColumn,
                    type: this.options.type,
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        result: this.model.result,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });
                
            },
            render: function() {
                this.children.filter.render().appendTo(this.$el);
                this.children.searchResultsPaginator.render().appendTo(this.$el);
                this.children.table.render().appendTo(this.$el);
                return this;
            }
        });
    }
);
