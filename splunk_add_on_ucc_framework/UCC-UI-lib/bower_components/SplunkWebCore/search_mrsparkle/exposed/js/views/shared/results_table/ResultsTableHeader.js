/**
 * @author sfishel
 *
 * View that encapsulates the header of the results table.
 *
 * Meant to be lightweight so that it can be re-instantiated and rendered each time the table re-renders.
 */

define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'splunk.i18n',
            'util/time'
        ],
        function(
            $,
            _,
            module,
            Base,
            i18n,
            timeUtils
        ) {

    return Base.extend({

        moduleId: module.id,

        tagName: 'thead',

        /**
         * @constructor
         *
         * @param options {Object} {
         *     rowNumbers {Boolean} whether or not to leave an empty column at the left for the row numbers in the table body
         *     fields {Array<String>} the fields to render as the column headers
         *     sortKeyAttribute {String} the HTML attribute to use when encoding the sort-key into <th> tag
         *     sortableFields {Boolean} disable/enable the sortable fields
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            _.defaults(this.options, {sortableFields: true, sortableFieldsExcluded: []});
        },

        render: function() {
            var columnClasses = {};
            this.formattedFields = [];

            _(this.options.columnTypes).each(function(columnType, field) {
                columnClasses[field] = this.columnTypeToClassName(columnType);
            }, this);

            var timestampFormat = 'YYYY-MM-dd HH:mm:ss';
            _(this.options.fields).each(function(fields,i){
                if(timeUtils.isValidIsoTime(fields)) {
                    this.formattedFields[i] = i18n.format_date(timeUtils.isoToDateObject(fields), timestampFormat);
                }
                else{
                    this.formattedFields[i] = fields;
                }
            }, this);
            var html = this.compiledTemplate({
                columnTypes: this.options.columnTypes,
                rowExpansion: this.options.rowExpansion,
                rowNumbers: this.options.rowNumbers,
                fields: this.options.fields,
                sortKeyAttribute: this.options.sortKeyAttribute,
                sortableFields: this.options.sortableFields,
                sortableFieldsExcluded: this.options.sortableFieldsExcluded,
                columnClasses: columnClasses,
                formattedFields: this.formattedFields,
                enableEditing: this.options.enableEditing,
                // pass a reference to all options so sub-classes can more easily customize rendering
                viewOptions: this.options
            });

            this.$el.html(html);

            var index = this.options.selectedColumnIndex;

            if (index !== null) {
                if (this.options.rowExpansion) {
                    index++;
                }
                if(this.options.rowNumbers) {
                    index++;
                }

                this.$('th').eq(index).addClass('editing-column');
            }

            return this;
        },

        highlightColumn: function(index) {
            if (this.options.rowExpansion) {
                index++;
            }
            if(this.options.rowNumbers) {
                index++;
            }
            this.$('th').eq(index).addClass('highlighted');
        },

        unHighlightColumn: function(index) {
            if (this.options.rowExpansion) {
                index++;
            }
            if(this.options.rowNumbers) {
                index++;
            }
            this.$('th').eq(index).removeClass('highlighted');
        },

        columnTypeToClassName: function(columnType) {
            if(columnType === 'number') {
                return 'numeric';
            }
            if(columnType === 'timestamp') {
                return 'timestamp';
            }
            return '';
        },

        template: '\
            <tr class="">\
                <% if(rowExpansion) { %>\
                    <th class="col-info" style="width: 15px;"><i class="icon-info"></i></th>\
                <% } %>\
                <% if(rowNumbers) { %>\
                    <th class="row-number"></th>\
                <% } %>\
                <% _(fields).each(function(field, i) { %>\
                    <% if (sortableFields && !_.contains(sortableFieldsExcluded, field)) { %>\
                        <th class="sorts <%- columnClasses[field] %>" <%- sortKeyAttribute %>="<%- field %>">\
                            <% if (enableEditing && (columnTypes[field] !== "timestamp") && (columnTypes[field] !== "sparkline")) { %>\
                                <a class="btn-col-format suppress-sort pull-right" href="#"><i class="icon-paintbrush "></i></a>\
                            <% } %>\
                            <a href="#"><%- formattedFields[i] %><i class="icon-sorts "></i></a>\
                        </th>\
                    <% } else { %>\
                        <th class="<%- columnClasses[field] %>" <%- sortKeyAttribute %>="<%- field %>">\
                            <% if (enableEditing && (columnTypes[field] !== "timestamp") && (columnTypes[field] !== "sparkline")) { %>\
                                <a class="btn-col-format suppress-sort pull-right" href="#"><i class="icon-paintbrush "></i></a>\
                            <% } %>\
                            <span><%- formattedFields[i] %></span>\
                        </th>\
                    <% } %>\
                <% }) %>\
            </tr>\
        '

    });

});
