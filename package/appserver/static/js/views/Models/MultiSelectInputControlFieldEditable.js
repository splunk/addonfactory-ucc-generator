/*global define*/
define([
    'jquery',
    'underscore',
    'views/shared/controls/Control',
    'app/util/EditablePopoverUtil',
    'select2/select2'
], function (
    $,
    _,
    Control,
    EditablePopoverUtil
) {
    /**
     * Multiple select control with editable fields
     *
     * @param {Object} options
     *                        {Object} model The model to operate on
     *                        {String} modelAttribute The attribute on the model to observe and update on selection
     *                        {Object} items The attribute set by setItems and following certain struture
     */
    var DELIMITER = '::::',
        NO_MATCH_STRING = "No matches found.";

    function findItem(items, id) {
        return _.find(items, function (item) {
            return item.mainField.id === id;
        });
    }

    return Control.extend({
        className: 'control multiselect-input-control splunk-multidropdown splunk-chioce-input',
        // moduleId: module.id,
        initialize: function () {
            if (this.options.modelAttribute) {
                this.$el.attr('data-name', this.options.modelAttribute);
            }
            this._noMatchString = NO_MATCH_STRING;
            this.options.fieldDelimiter = "/";
            this.defaultItems = this.options.items;

            //Set the selected item list
            if (this.options.model.get(this.options.modelAttribute) !== undefined) {
                this.initSelectedItems = this.parseItems(this.options.model.get(this.options.modelAttribute));
            }

            //Set the default item list
            var that = this,
                selectedIds = _.map(this.initSelectedItems, function (item) {
                return item.mainField.id;
            });
            _.each(this.defaultItems, function (item) {
                var index = selectedIds.indexOf(item.mainField.id);
                if (index < 0) {
                    item.mainField.initialSelected = false;
                    item.editableFields[0].value = item.editableFields[0].defaultValue;
                } else {
                    item.mainField.initialSelected = true;
                    item.editableFields[0].value = that.initSelectedItems[index].editableFields[0].value;
                }
            });

            this.setItems(this.defaultItems);

            Control.prototype.initialize.call(this, this.options);
            this.compliedSelectContentTemplate = _.template(this._templateSelectContent);
            this.compliedDropdownContentTemplate = _.template(this._templateDropdownContent);
        },
        render: function () {
            this.$el.html(this.compiledTemplate({
                items: this.defaultItems
            }));
            var _this = this,
                compliedSelectContentTemplate = this.compliedSelectContentTemplate,
                compliedDropdownContentTemplate = this.compliedDropdownContentTemplate,
                fieldDelimiter = this.options.fieldDelimiter,
                $popContainer = this.$("div.popover-container"),
                $select = this.$('select');
            $select.select2({
                placeholder: this.options.placeholder,
                formatNoMatches: function () {
                    return _this._noMatchString;
                },
                dropdownCssClass: 'empty-results-allowed',
                separator: DELIMITER,
                formatSelection: function (state) {
                    var item, $el;
                    item = findItem(_this.defaultItems, state.id);

                    _.each(item.editableFields, function (field) {
                        if (field.value === undefined) {
                            field.value = field.defaultValue;
                        }
                    });
                    $el = $(compliedSelectContentTemplate({
                        item: item,
                        delimiter: fieldDelimiter
                    }));
                    EditablePopoverUtil.addPopover($el.find(".editable-field"), {
                        container: $popContainer,
                        placement: "top",
                        scope: _this,
                        onConfirming: function ($el, val) {
                            var selectItemId = $el.parent().find(".select-item").data("id");
                            return this._validateFieldInput(selectItemId, $el.data("name"), val);
                        },
                        onConfirmed: function ($el, val) {
                            var selectItemId = $el.parent().find(".select-item").data("id");
                            this._setFieldValue(selectItemId, $el.data("name"), val);
                        }
                    });
                    return $el;
                },
                formatResult: function (state) {
                    var item = findItem(_this.defaultItems, state.id);
                    return compliedDropdownContentTemplate({
                        item: item,
                        delimiter: fieldDelimiter
                    });
                },
                // SPL-77050, this needs to be false for use inside popdowns/modals
                openOnEnter: false
            }).on("select2-removing", function (e) {
                //destroy popover instances
                var item = findItem(_this.defaultItems, e.val);
                _.each(item.editableFields, function (field) {
                    delete field.value;
                });
                EditablePopoverUtil.removePopover($(this.parentNode).find("[data-id='" + e.val + "']~a.editable-field"));

            });
            this._setInitValue();
            // .select2('val', splunkUtils.stringToFieldList(this._value || ''));
            return this;
        },
        setFieldDelimiter: function (fieldDelimiter) {
            this.options.fieldDelimiter = fieldDelimiter;
            return this;
        },
        _setInitValue: function () {
            var val = _.chain(this.defaultItems).filter(function (item) {
                return item.mainField.initialSelected;
            }).map(function (item) {
                return item.mainField.id;
            }).value();
            if (val && val.length) {
                this.$("select").select2("val", val);
                if (_.isEqual(val.sort(), this._fullList)) {
                    this._noMatchString = "";
                }
            }
            //this._setControlValue(val,this.options.items);
        },
        _setFieldValue: function (itemId, fieldName, fieldValue) {
            var item = findItem(this.defaultItems, itemId),
                field = _.find(item.editableFields, function (f) {
                    return f.name === fieldName;
                }),
                $select,
                val;
            if (String(field.value) !== String(fieldValue)) {
                field.value = fieldValue;
                $select = this.$('select');
                // reset select2's value to refresh the result.
                val = $select.select2("val");
                $select.select2("val", "").select2("val", val);
                this._setControlValue(val, this.defaultItems);
            }
        },
        _validateFieldInput: function (itemId, fieldName, fieldValue) {
            var item = findItem(this.defaultItems, itemId),
                field = _.find(item.editableFields, function (f) {
                    return f.name === fieldName;
                });
            if (_.isFunction(field.validator)) {
                return field.validator(fieldValue);
            }
            return true;
        },
        _setControlValue: function (values, items) {
            // FIXME try better way to set control value.
            var delimiter = this.options.fieldDelimiter,
                value = _.chain(values).map(function (val) {
                    var item = findItem(items, val);
                    return [val].concat(_.map(item.editableFields, function (f) {
                        return f.value || f.defaultValue;
                    })).join(delimiter);
                }).value().join(", ");
            this.setValue(value, false, {
                silent: true
            });
        },
        parseItems: function (str) {
            function myTrim(x) {
                return x.replace(/^\s+|\s+$/gm, '');
            }
            var values = str.split(','),
                items = [],
                item;
            _.each(values, function (value) {
                var id_interval = value.split(this.options.fieldDelimiter);
                item = {
                    mainField: {
                        id: myTrim(id_interval[0]),
                        label: findItem(this.defaultItems, myTrim(id_interval[0])).mainField.label,
                        initialSelected: true
                    },
                    editableFields: [{
                        name: "interval",
                        defaultValue: "3600",
                        value: id_interval[1],
                        unit: "second",
                        type: "number",
                        title: "Collection interval",
                        config: {
                            min: 0
                        },
                        validator: function (val) {
                            return val > 0;
                        },
                        errorMessage: "Value should be greater than zero."
                    }]
                };
                items.push(item);
            }.bind(this));
            return items;
        },
        setItems: function (items) {
            /**
             * @param items should be contructed in following format:
             *     [{
             *         mainField: {
             *             id: "...",
             *             label: "...",
             *             initialSelected: true||false // whether initial selected or not.
             *         },
             *         editableFields: [{
             *             name: "...", // would be filtered if null or empty
             *             defaultValue: "...", // could be plain object, would be " " if null or empty
             *             type: "...", // would be text if null or empty
             *             formatter: function(value){}, // format the default value before rendering
             *             unit: "...", // unit of the editable field
             *             title: "...", // title of the popover dialog
             *             value: "..." // initial value of the field if this item is initially seleted
             *             config: {
             *                 // would be passed in popover template.
             *             },
             *             validator: function(){},// the validator before onConfirmed is called.
             *             errorMessage: "..."// the error message which shows when value is invalid.
             *         }, {
             *             // other editable fields.
             *         }]
             *     }, {
             *        // other items
             *     }]
             */
            this._fullList = _.map(items, function (item) {
                return item.mainField.id;
            }).sort();
            //this.options.items = items;
        },
        remove: function () {
            this.$('select').select2('close').select2('destroy');
            return Control.prototype.remove.apply(this, arguments);
        },
        events: {
            'change select': function (e) {
                this._setControlValue(e.val, this.defaultItems);
                // this.setValue(splunkUtils.fieldListToString(values), false);
                var val = this.$('select').select2("val");
                if (_.isEqual(val.sort(), this._fullList)) {
                    this._noMatchString = "";
                } else {
                    this._noMatchString = NO_MATCH_STRING;
                }
            }
        },
        template: [
            '<select multiple="multiple">',
            '<% _.each(items, function(item){ %>',
            '<option value="<%- item.mainField.id %>"><%- item.mainField.label %></option>',
            '<% }) %>',
            '</select>',
            '<div class="popover-container" style="position:fixed;z-index:1000;"></div>'
        ].join(''),
        _templateSelectContent: [
            '<span>',
            '<span class="select-item" data-id=<%- item.mainField.id %>><%- item.mainField.label %></span>',
            '<% _.each(item.editableFields, function(field){ %>',
            '<%- delimiter %>',
            '<a class="editable-field" ',
            'data-name="<%- field.name %>"" ',
            'data-value="<%- field.value %>"" ',
            'data-type="<%- field.type? field.type:"text" %>" ',
            'data-title="<%- field.title? field.title:"" %>" ',
            'data-unit="<%- field.unit? field.unit:"" %>" ',
            'data-errorMessage="<%- field.errorMessage? field.errorMessage:"" %>" ',
            'data-config="<%- field.config? JSON.stringify(field.config):"{}" %>">',
            '<%- _.isFunction(field.formatter) ? field.formatter(field.value) : field.value %>',
            '</a>',
            '<% }); %>',
            '</span>'
        ].join(''),
        _templateDropdownContent: [
            '<span>',
            '<span class="dropdown-item" data-id=<%- item.mainField.id %>><%- item.mainField.label %></span>',
            '<% _.each(item.editableFields, function(field){ %>',
            '<%- delimiter %>',
            '<span class="optional-field" >',
            '<%- _.isFunction(field.formatter) ? field.formatter(field.defaultValue) : (field.defaultValue) %>',
            '</span>',
            '<% }); %>',
            '</span>'
        ].join('')
    });
});