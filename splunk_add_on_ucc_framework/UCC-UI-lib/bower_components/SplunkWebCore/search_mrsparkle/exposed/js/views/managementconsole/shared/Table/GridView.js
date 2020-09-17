// draws the table header and the table body
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/shared/TableHead'
], function TabsView(
    _,
    $,
    backbone,
    module,
    BaseView,
    TableHeadView
) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'table',

        className: 'table listing-table table-chrome table-striped table-row-expanding',

        tableTemplates: {
            th: _.template('<th><%- value %></th>'),
            td: _.template('<td><%- value %></td>'),
            rawTD: _.template('<td><%= value %></td>')
        },

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.radio = this.options.radio;
        },

        /*
         These function are no longer in use
         since we are use the shared tableHead.
         renderTH: function renderTH(column) {
         if (column.type in this.options.headerTypes) {
         return this.options.headerTypes[column.type].apply(this, [column]);
         }
         return this.tableTemplates.th({ value: column.name });
         },
         renderHead: function renderHead() {
         var $thead = $('<thead></thead>');
         var $tr = $('<tr></tr>');
         _.reduce(
         _.map(
         this.options.columns,
         function mapHeader(column, i) {
         return this.renderTH(column, i);
         },
         this
         ),
         function reduceHeader(obj, $element) {
         this.append($element);
         },
         null,
         $tr
         );
         $thead.append($tr);
         return $thead;
         },
         */
        // Responsible for rendering individual table contents
        // returns <td><table contents</td>
        renderTD: function (column, model, count, totalCounter) {
            if (_.has(this.options.rowTypes, column.type)) {
                return this.options.rowTypes[column.type].apply(this, [column, model, count, totalCounter]);
            }
            if (_.isFunction(column.key)) {
                return this.tableTemplates.rawTD({
                    value: column.key.apply(this, [column, model, count, totalCounter])
                });
            }
            return this.tableTemplates.td({value: column.key});
        },

        // Responsible to draw every row of the table
        // It calls renderTD for each column of the row.
        // turns a jquery obj containing the table row
        // or an array of 2 jquery obj when row expansion is enabled.
        renderTR: function (model, count, totalCount) {
            var $tr = $('<tr></tr>');
            _.reduce(
                _.map(
                    this.options.columns,
                    function mapRow(column, i) {
                        return this.renderTD(column, model, count, totalCount);
                    },
                    this
                ),
                function reduceHeader(obj, $element) {
                    this.append($element);
                },
                null,
                $tr
            );

            if (this.options.rowExpansion.enabled === true) {
                // styling screws up
                var styleClass = (count + 1) % 2 === 0 ? 'even' : 'odd';
                var $dtr = this.options.rowTypes.rowExpansionDetail.apply(
                    this,
                    [this.options.columns, model, count, totalCount, styleClass]);
                $tr.addClass(styleClass);
                return [$tr, $dtr];
            }
            return $tr;
        },
        // This function is responsible for rendering the table body or <tbody>
        // It calls renderTR for each model in the collection.
        // returns a jquery obj
        renderBody: function () {
            var $tbody = $('<tbody></tbody>');
            _.reduce(
                _.map(
                    this.collection.models,
                    function mapRow(model, count) {
                        var totalCount = parseInt(this.collection.paging.get('offset'), 0) + count;
                        return this.renderTR(model, count, totalCount);
                    },
                    this
                ),
                function reduceRow(rows, row) {
                    this.append(row);
                },
                null,
                $tbody
            );

            return $tbody;
        },
        // Maps Table component's column config to
        // shared tableHead's configurations.
        renderSharedHead: function () {
            var columns = _.map(
                this.options.columns,
                function MapColumnHeader(column, i) {
                    var customOptions = {};
                    if (
                        _.has(this.options.headerTypes, column.type) &&
                        _.isFunction(this.options.headerTypes[column.type])
                    ) {
                        customOptions = this.options.headerTypes[column.type].apply(this, [column]);
                    }
                    column = $.extend(true, {}, column, customOptions);
                    return column;
                },
                this
            );
            // register the component
            this.children.head = new TableHeadView({
                model: this.collection.fetchData,
                columns: columns
            });
            return this.children.head.render().$el;
        },

        render: function () {
            var count = this.collection.length;
            if (count > 0) {
                this.$el.empty();
                this.renderSharedHead().appendTo(this.$el);
                this.renderBody().appendTo(this.$el);
                this.$el.addClass(this.options.tableClassName);
            }
            return this;
        }
    });
});
