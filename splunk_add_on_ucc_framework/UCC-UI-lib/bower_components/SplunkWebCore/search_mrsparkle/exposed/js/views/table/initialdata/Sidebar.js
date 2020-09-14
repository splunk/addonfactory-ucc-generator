define(
    [
        'jquery',
        'underscore',
        'module',
        'collections/datasets/Columns',
        'models/datasets/Column',
        'models/datasets/commands/InitialData',
        'views/Base',
        'views/table/initialdata/DatasetContent',
        'views/table/initialdata/IndexesAndSourcetypesContent',
        'views/table/initialdata/SearchContent'
    ],
    function(
        $,
        _,
        module,
        ColumnsCollection,
        ColumnModel,
        InitialDataCommand,
        BaseView,
        DatasetContentView,
        IndexesAndSourcetypesContentView,
        SearchContentView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'initial-data-sidebar',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                var command = this.model.command,
                    columnsJSON,
                    datasetColumns,
                    indexesAndSourcetypesColumns,
                    searchColumns;
                
                if (command) {
                    columnsJSON = command.columns.toJSON();
                    datasetColumns = new ColumnsCollection(columnsJSON);
                    indexesAndSourcetypesColumns = new ColumnsCollection(columnsJSON);
                    searchColumns = new ColumnsCollection(columnsJSON);
                }

                this.deferreds = this.options.deferreds;
                
                this.children.datasetContent = new DatasetContentView({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        basesearchTableAST: this.model.basesearchTableAST,
                        command: this.model.command,
                        resultJsonRows: this.model.resultJsonRows,
                        searchJob: this.model.searchJob,
                        serverInfo: this.model.serverInfo,
                        state: this.model.state,
                        table: this.model.table,
                        tablePristine: this.model.tablePristine,
                        timeRange: this.model.timeRange,
                        user: this.model.user
                    },
                    collection: {
                        columns: datasetColumns,
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    },
                    deferreds: {
                        timeRange: this.deferreds.timeRange
                    }
                });

                this.children.indexesAndSourcetypesContent = new IndexesAndSourcetypesContentView({
                    model: {
                        application: this.model.application,
                        basesearchTableAST: this.model.basesearchTableAST,
                        command: this.model.command,
                        resultJsonRows: this.model.resultJsonRows,
                        searchJob: this.model.searchJob,
                        state: this.model.state,
                        table: this.model.table,
                        tablePristine: this.model.tablePristine,
                        timeRange: this.model.timeRange
                    },
                    collection: {
                        columns: indexesAndSourcetypesColumns,
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    },
                    deferreds: {
                        timeRange: this.deferreds.timeRange
                    }
                });

                this.children.searchContent = new SearchContentView({
                    model: {
                        application: this.model.application,
                        basesearchTableAST: this.model.basesearchTableAST,
                        command: this.model.command,
                        resultJsonRows: this.model.resultJsonRows,
                        searchJob: this.model.searchJob,
                        state: this.model.state,
                        table: this.model.table,
                        tablePristine: this.model.tablePristine,
                        timeRange: this.model.timeRange
                    },
                    collection: {
                        columns: searchColumns,
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    },
                    deferreds: {
                        timeRange: this.deferreds.timeRange
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
                this.listenTo(this.model.command, 'change:selectedMethod', this.manageStateOfChildren);
            },

            manageStateOfChildren: function() {
                var method = this.model.command.get('selectedMethod');

                switch(method) {
                    case InitialDataCommand.METHODS.DATASET:
                        this.children.datasetContent.activate({ deep: true }).$el.css('display', '');
                        this.children.indexesAndSourcetypesContent.deactivate({ deep: true }).$el.hide();
                        this.children.searchContent.deactivate({ deep: true }).$el.hide();
                        break;
                    case InitialDataCommand.METHODS.INDEXES_AND_SOURCETYPES:
                        this.children.datasetContent.deactivate({ deep: true }).$el.hide();
                        this.children.indexesAndSourcetypesContent.activate({ deep: true }).$el.css('display', '');
                        this.children.searchContent.deactivate({ deep: true }).$el.hide();
                        break;
                    default:
                        this.children.datasetContent.deactivate({ deep: true }).$el.hide();
                        this.children.indexesAndSourcetypesContent.deactivate({ deep: true }).$el.hide();
                        this.children.searchContent.activate({ deep: true }).$el.css('display', '');
                }
            },

            render: function() {
                this.children.datasetContent.render().appendTo(this.$el);
                this.children.indexesAndSourcetypesContent.render().appendTo(this.$el);
                this.children.searchContent.render().appendTo(this.$el);

                return this;
            }
        });
    }
);