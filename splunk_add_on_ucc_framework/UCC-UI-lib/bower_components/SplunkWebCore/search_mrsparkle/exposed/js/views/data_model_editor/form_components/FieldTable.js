/**
 * @author jszeto
 * @date 12/18/12
 *
 * Displays a set of FieldRows for the extracted fields derived from an Object's search string
 *
 * Inputs:
 *
 *     collection {collections/Base} - {
 *                                      extractedFields:  collection of {models/datamodel/ExtractedField}, 
 *                                      manualFields: collection of {models/datamodel/ExtractedField}
 *                                     }
 */

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/data_model_editor/form_components/FieldRow',
    'views/data_model_editor/form_components/TimestampFieldRow',
    'views/data_model_editor/form_components/ManualFieldRow',
    'views/shared/delegates/RowExpandCollapse',
    'helpers/grid/RowIterator'
],
    function(
        $,
        _,
        module,
        Base,
        SyntheticCheckboxControl,
        FieldRow,
        TimestampFieldRow,
        ManualFieldRow,
        RowExpandCollapse,
        RowIterator
        ) {

        return Base.extend({

            moduleId: module.id,
            fieldRows: [],

            initialize: function(options) {
                Base.prototype.initialize.call(this, options);

                this.collection.manualFields.on('reset add remove', this.debouncedRender, this);
                this.collection.extractedFields.on('reset add remove', this.debouncedRender, this);

                this.children.selectAllCheckbox = new SyntheticCheckboxControl();
                this.children.selectAllCheckbox.on("change", this.selectAllCheckBoxChangeHandler, this);
            },

            /**
             * Set each field as selected/unselected
             * @param newValue
             * @param oldValue
             */
            selectAllCheckBoxChangeHandler: function(newValue, oldValue) {
                this.collection.extractedFields.each(function(field) {
                    field.set("selected", newValue);
                }, this);
            },

            removeField: function(field) {
                this.collection.manualFields.remove(field); 
            }, 
            render: function() {

                this.children.selectAllCheckbox.detach();

                _(this.fieldRows).each(function(fieldRow) {
                    fieldRow.detach();
                }, this);

                this.fieldRows = [];

                var rowIterator = new RowIterator();

                var html = this.compiledTemplate({
                        headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS,
                        toggleHeaderBody: RowExpandCollapse.HEADER_CELL_MARKUP,
                        rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR
                    });

                var $html = $(html);

               
                rowIterator.eachRow(this.collection.manualFields, function(field, index, rowNumber, isExpanded) {
                    var fieldRow = new ManualFieldRow({tagName: "tr",
                                                 model:field,
                                                 isExpanded: isExpanded,
                                                 index: index,
                                                 rowNumber: rowNumber});
                    this.fieldRows.push(fieldRow);
                    $html.find(".field-table-body").append(fieldRow.render().el);
                    fieldRow.on('action:removeField', this.removeField, this); 
                }, this);


                rowIterator.eachRow(this.collection.extractedFields, function(field, index, rowNumber, isExpanded) {
                    var fieldRow;
                    // Note we've set the root tag of the FieldRow and TimestampFieldRow to be a TR
                    if(field.get('type') === 'timestamp') {
                        fieldRow = new TimestampFieldRow({tagName: "tr",
                            model: field,
                            index: index,
                            rowNumber: rowNumber});
                    }
                    else {
                        fieldRow = new FieldRow({tagName: "tr",
                            model: field,
                            index: index,
                            rowNumber: rowNumber});
                    }
                    this.fieldRows.push(fieldRow);
                    $html.find(".field-table-body").append(fieldRow.render().el);
                }, this);

                this.$el.html($html);

                this.$el.find(".select-all-checkbox").append(this.children.selectAllCheckbox.render().el);

                return this;
            },

         template: '\
            <table class="table table-chrome table-striped expand-collapse-sandbox">\
                <thead>\
                    <tr>\
                        <th class="<%- headerCellClass %>"></th>\
                        <th class="col-checkbox select-all-checkbox"></th>\
                        <th class="col-field"><%- _("Field").t() %></th>\
                        <th class="col-rename"><%- _("Rename").t() %></th>\
                        <th class="col-type"><%- _("Type").t() %></th>\
                    </tr>\
                </thead>\
                <tbody class="field-table-body">\
                </tbody>\
            </table>\
        '

        });

    });
