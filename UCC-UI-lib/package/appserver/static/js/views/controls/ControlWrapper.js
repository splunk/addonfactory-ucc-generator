import CONTROL_TYPE_MAP from 'app/constants/controlTypeMap';
import restEndpointMap from 'app/constants/restEndpointMap';
import {generateCollection} from 'app/util/backboneHelpers';

define([
    'views/Base',
    'lodash'
], function(
    BaseView,
    _
) {
    /**
     *  A wrapper view for controls.
     *      An extra label will be render
     *      (TODO)A loading indicator will be render along with the control.
     */
    return BaseView.extend({
        className: 'form-horizontal',
        initialize: function(options) {
            _.extend(this, options);

            const {type} = options;
            // Support both string mapping and raw component
            const controlType = typeof type === 'string' ?
                CONTROL_TYPE_MAP[type] : type;

            this.control = new controlType(this.controlOptions);
            this.listenTo(this.control, 'all', this.trigger);

            this.existingValue = this.controlOptions.model.get(
                this.controlOptions.modelAttribute
            );
            const {
                referenceName,
                endpointUrl,
                autoCompleteFields,
                items
            } = this.controlOptions;
            if(referenceName || endpointUrl) {
                if (!restEndpointMap[referenceName]) {
                    this.collection = generateCollection(referenceName, {endpointUrl});
                } else {
                    this.collection = generateCollection('', {'endpointUrl': restEndpointMap[referenceName]});
                }
                this.collection.fetch();

                this.listenTo(this.collection, 'sync', () => {
                    if (type === 'singleSelect' || type === 'multipleSelect') {
                        this._updateSelect();
                    }
                });
            } else if (autoCompleteFields && this.existingValue){
                this.controlOptions.autoCompleteFields = this._addValueToSelection(
                    this.existingValue,
                    autoCompleteFields
                );
            } else if (items && this.existingValue) {
                this.controlOptions.items = this._addValueToSelection(
                    this.existingValue,
                    items
                );
            }
        },

        events: {
            'click a.tooltip-link': function(e) {
                e.preventDefault();
            }
        },

        _updateSelect: function() {
            let dic = _.map(this.collection.models, model => ({
                label: model.entry.attributes.name,
                value: model.entry.attributes.name
            }));
            // filter result with white list
            if (this.controlOptions.whiteList) {
                dic = this._filterByWhiteList(dic);
            }
            // filter result with black list
            if (this.controlOptions.blackList) {
                dic = this._filterByBlackList(dic);
            }
            // add value to selection if it does exist
            if (this.existingValue) {
                dic = this._addValueToSelection(
                    this.existingValue,
                    dic
                );
            }
            if(this.control.setAutoCompleteFields) {
                // set singleSelect selection list
                this.control.setAutoCompleteFields(dic, true);
            }
            if(this.control.setItems) {
                // set multipleSelect selection list
                this.control.setItems(dic, true);
            }
            // unset defaultValue if not in loading list
            if (dic.every(d => d.value !== this.existingValue)) {
                this.controlOptions.model.set(this.controlOptions.modelAttribute, '');
            } else {
                this.control.setValue(this.existingValue, false);
            }
        },

        validate: function() {
            return this.control.validate();
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                label: this.label,
                tooltip: this.tooltip,
                required: this.required,
                help: this.help
            }));
            if (this.tooltip) {
                this.$('.tooltip-link').tooltip({
                    animation: false,
                    title: this.options.tooltip,
                    container: 'body'
                });
            }
            var $control = this.control.render().$el;
            if (this.controlClass) {
                $control.addClass(this.controlClass);
            }
            this.$('.control-placeholder').prepend($control);
            this.$el.addClass('form-small');
            return this;
        },

        remove: function() {
            if (this.tooltip) {
                this.$('.tooltip-link').tooltip('destroy');
            }
            return BaseView.prototype.remove.apply(this, arguments);
        },

        _filterByWhiteList: function(fields) {
            let whiteRegex;
            try {
                whiteRegex = new RegExp(this.controlOptions.whiteList);
            } catch(e) {
                console.log("Invalid regex for option whiteList");
                return fields;
            }
            return _.filter(fields, (field) => {
                return whiteRegex.test(field.value);
            });
        },

        _filterByBlackList: function(fields) {
            let blackRegex;
            try {
                blackRegex = new RegExp(this.controlOptions.blackList)
            } catch(e) {
                console.log("Invalid regex for option blackList");
                return fields;
            }
            return _.filter(fields, (field) => {
                return !blackRegex.test(field.value);
            });
        },

        _addValueToSelection: function(fieldValue, fields) {
            if (_.find(fields, (field) => {
                    return field.value === fieldValue;
                }) === undefined) {
                let selectedItem = {
                    label: fieldValue,
                    value: fieldValue
                };
                return fields.concat(selectedItem);
            }
            return fields;
        },

        template: `
            <div class="form-group control-group">
                <% if (label) { %>
                    <div class="control-label col-sm-2">
                    <p>
                        <%- _(label).t() %>
                        <% if (tooltip) { %>
                            <a href="#" class="tooltip-link"><%- _("?").t() %></a>
                        <% } %>
                        <% if (required) { %>
                            <span class="required">*</span>
                        <% } %>
                    </p>
                    </div>
                <% } %>
                <div class="col-sm-10 controls control-placeholder">
                    <% if (help) { %>
                        <span class="help-block">
                        <%- _(help).t() %></span>
                    <% } %>
                </div>
            </div>
        `
    });
});
