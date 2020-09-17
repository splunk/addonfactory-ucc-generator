define([
            'jquery',
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/SyntheticSelectControl',
            'util/datamodel/field_icon_utils'
        ],
        function(
            $,
            _,
            module,
            ControlGroup,
            SyntheticSelectControl,
            fieldIconUtils
        ) {

    var FieldPickerControl = SyntheticSelectControl.extend({

        initialize: function() {
            this.options = $.extend({
                modelAttribute: 'fieldName',
                toggleClassName: 'btn',
                menuClassName: 'pivot-field-picker-dropdown',
                popdownOptions: { detachDialog: true }
            }, this.options);
            _(this.options.items).each(this.prepareItem, this);
            SyntheticSelectControl.prototype.initialize.call(this, this.options);
        },

        updateModel: function(options) {
            var that = this,
                item = _(this.options.items).find(function(item) { return item.value === that._value; }),
                attrs = this.options.dataTable.getFieldByName(item.fieldName);

            this.model.trigger('hotSwap', attrs);
            return true;
        },

        prepareItem: function(item) {
            item.icon = fieldIconUtils.fieldIconClassByType(item.type);
            item.value = item.fieldName;
            item.label = item.label || item.displayName;
        }

    });

    return ControlGroup.extend({

        moduleId: module.id,

        control: FieldPickerControl,

        events: $.extend({}, ControlGroup.prototype.events, {

            'click .remove-button': function(e) {
                e.preventDefault();
                this.model.trigger('removeField');
            }

        }),

        /**
         * @constructor
         * @param options {
         *     report <models/pivot/PivotReport> the current pivot report
         *     dataTable <models/pivot/PivotableDataTable> the current data table
         *     dataTypes optional {Array<String>} white-list of allowed field data types, if not specified all fields are allowed
         *     model: <sub class of models/pivot/elements/BaseElement> the report element
         * }
         */

        initialize: function() {
            this.dataTable = this.options.dataTable;
            this.options.controls = [
                new this.control({ items: this.generateMenuItems(), model: this.model, dataTable: this.dataTable })
            ];
            if(!this.options.label) {
                this.options.label = _('Field').t();
            }
            this.$el.addClass('pivot-field-picker-group');
            ControlGroup.prototype.initialize.call(this, this.options);
        },

        generateMenuItems: function() {
            var groupedReportFields = this.dataTable.getGroupedFieldList(),
                orderedReportFields = _.union(groupedReportFields.objectCount || [], groupedReportFields.timestamp || [],
                    groupedReportFields.other);

            if(this.options.hasOwnProperty('dataTypes')) {
                orderedReportFields = _(orderedReportFields).filter(function(field) {
                    return _(this.options.dataTypes).contains(field.type);
                }, this);
            }
            // selectively remove some fields from the list that are available for swap
            // here we are enforcing that the same row- or column-split cannot be added twice
            var elementType = this.model.get('elementType');
            if(elementType in { row: true, column: true }) {
                var existingFieldNames = this.options.report.getElementCollectionByType(elementType).pluck('fieldName');
                orderedReportFields = _(orderedReportFields).filter(function(field) {
                    return field.fieldName === this.model.get('fieldName') || !_(existingFieldNames).contains(field.fieldName);
                }, this);
            }
            return orderedReportFields;
        },

        render: function() {
            ControlGroup.prototype.render.call(this);
            if(this.options.showRemoveButton !== false) {
                this.$('.dropdown-toggle').after('<a class="remove-button" href="#"><i class="icon-x-circle icon-large"></i></a>');
            }
            this.$('.dropdown-toggle').tooltip({
                animation: false,
                container: 'body',
                title: function() {
                    return $(this).text().trim();
                },
                placement: function(tooltip) {
                    // Use the placement hook to add a custom classname to the tooltip container.
                    $(tooltip).addClass('tooltip-full-width');
                    return 'top';
                }
            });
            return this;
        }

    });

});