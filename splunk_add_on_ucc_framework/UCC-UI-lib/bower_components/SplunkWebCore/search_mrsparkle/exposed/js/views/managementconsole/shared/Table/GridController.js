// Grid controller is responsible for handling all the
// bells & whistles to the grid view
// @author: nmistry
define([
    'underscore',
    'jquery',
    'views/Base',
    './GridView',
    './column_types/Header',
    './column_types/Dynamic',
    './column_types/Link',
    './column_types/NameDescription',
    './column_types/RowExpansion',
    './column_types/BulkEdit',
    './column_types/Actions',
    './column_types/DMCPendingChange',
    './column_types/EnableDisableStatus',
    './column_types/Highlighted',
    './column_types/Tooltip',
    'module'
], function TableControllerAMD(
    _,
    $,
    BaseView,
    GridView,
    HeaderTypes,
    DynamicType,
    LinkType,
    NameDescriptionType,
    RowExpansionType,
    BulkEditType,
    ActionsType,
    DMCPendingChangeType,
    EnableDisableStatus,
    Highlighted,
    Tooltip,
    module
) {
    var gridDefaults = {
        columns: [],
        sorting: {
            keyAttr: 'sortKey',
            dirAttr: 'sortDirection'
        },
        rowExpansion: {
            enabled: false,
            renderer: null,
            showToggleAll: false,
            initialState: 'collapsed'
        },
        bulkEdit: {
            enabled: false
        }
    };
    var TableController = BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: 'grid-controller',

        // column configurations
        columnDefaults: {
            label: null,
            type: null,
            key: null,
            sortable: false,
            sortKey: null,
            actions: []
        },

        // header types
        // mixins will register headertypes here
        headerTypes: {},

        // row data types
        // mixins will register rowtypes here
        rowTypes: {},

        // event hash
        events: {},

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            // merge grid defaults.
            this.config = $.extend(true, {}, this.gridDefaults, this.options.config);
            this.config.rowExpansion.currentState = this.config.rowExpansion.initialState;

            // radio is required.
            this.radio = this.options.radio;

            // normalize the columns
            this.initializeColumnDefinition();

            // instantiate the Grid
            this.children.gridView = new GridView({
                tableClassName: this.config.tableClassName,
                collection: this.collection,
                columns: this.config.columns,
                headerTypes: this.headerTypes,
                rowTypes: this.rowTypes,
                sorting: this.config.sorting,
                rowExpansion: this.config.rowExpansion,
                radio: this.radio
            });

            // handle grid view updates when collection is updated.
            this.listenTo(this.collection, 'reset', this.render);
            this.listenTo(this.radio, 'toggleRows', this.handleToggleAllRows);
        },

        handleToggleAllRows: function (expand) {
            this.config.rowExpansion.currentState = !!expand ? 'expanded' : 'collapsed';
            RowExpansionType.toggleAllRows.call(this, expand);
        },

        initializeColumnDefinition: function () {
            // for bulk edits we need to add column
            if (this.config.bulkEdit.enabled === true) {
                this.config.columns.unshift({type: 'bulkEdit'});
            }
            // for row expansion we need to add column
            if (this.config.rowExpansion.enabled === true) {
                this.config.columns.unshift({type: 'rowExpansion'});
            }
            // merge columnDefaults for each column
            this.config.columns = _.map(
                this.config.columns,
                function normalizeColumn(column) {
                    _.defaults(column, this);
                    return column;
                },
                this.columnDefaults
            );
        },

        render: function () {
            // remove the existing grid
            // before rendering new one.
            this.children.gridView.remove();
            if (this.collection.length > 0) {
                this.children.gridView.render().$el.appendTo(this.$el);
            }
            return this;
        }

    }, {gridDefaults: gridDefaults});

    // add column type Mixins.
    TableController.prototype = $.extend(true, {},
        TableController.prototype,
        HeaderTypes,
        DynamicType,
        LinkType,
        NameDescriptionType,
        ActionsType,
        RowExpansionType,
        DMCPendingChangeType,
        EnableDisableStatus,
        Highlighted,
        Tooltip,
        BulkEditType
    );

    return TableController;
});
