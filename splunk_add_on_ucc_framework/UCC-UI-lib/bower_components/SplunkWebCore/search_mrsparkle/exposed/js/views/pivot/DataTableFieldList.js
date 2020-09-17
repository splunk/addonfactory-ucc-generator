define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'util/datamodel/field_icon_utils',
            'splunk.util',
            './DataTableFieldList.pcss'
        ],
        function(
            $,
            _,
            module,
            BaseView,
            fieldIconUtils,
            splunkUtils,
            css
        ) {

    return BaseView.extend({

        showEventFields: true,
        showTimestampFields: true,

        moduleId: module.id,

        events: {
            'click .field-button': function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget),
                    fieldName = $target.attr('data-field-name'),
                    fieldOwner = $target.attr('data-field-owner');

                this.trigger('action:selectField', fieldName, fieldOwner);
            },
            'click .save-data-model-button': function(e) {
                e.preventDefault();
                this.trigger('action:saveDataModel');
            }
        },

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            options = options || {};
            if(options.hasOwnProperty('showEventFields')) {
                this.showEventFields = !!options.showEventFields;
            }
            if(options.hasOwnProperty('showTimestampFields')) {
                this.showTimestampFields = !!options.showTimestampFields;
            }
            if(_.isArray(options.hiddenFieldList)) {
                this.hiddenFieldList = options.hiddenFieldList;
            }
            if(_.isArray(options.dataTypeBlacklist)) {
                this.dataTypeBlacklist = options.dataTypeBlacklist;
            }
        },

        render: function() {
            var fieldGroups = this.model.getGroupedFieldList();
            if(!this.showEventFields) {
                fieldGroups['objectCount'] = [];
            }
            if(!this.showTimestampFields) {
                fieldGroups['timestamp'] = [];
            }
            var that = this;
            if(this.hiddenFieldList) {
                var fieldIsNotHidden = function(field) {
                        return !_(that.hiddenFieldList).contains(field.fieldName);
                    };
                _(fieldGroups).each(function(fieldList, groupName) {
                    fieldGroups[groupName] = _(fieldList).filter(fieldIsNotHidden);
                }, this);
            }
            if(this.dataTypeBlacklist) {
                var fieldIsAllowed = function(field) {
                        return !_(that.dataTypeBlacklist).contains(field.type);
                    };
                _(fieldGroups).each(function(fieldList, groupName) {
                    fieldGroups[groupName] = _(fieldList).filter(fieldIsAllowed);
                }, this);
            }
            var html = _(this.template).template({
                    dataModelIsTemporary: this.options.dataModelIsTemporary,
                    fieldGroups: fieldGroups,
                    getIcon: fieldIconUtils.fieldIconByType,
                    eventButtonClass: this.options.eventButtonClass || '',
                    timestampButtonClass: this.options.timestampButtonClass || '',
                    otherButtonClass: this.options.otherButtonClass || '',
                    changeDataTypeMessage: splunkUtils.sprintf(
                        _('To change a fields\'s data type, %s the data model.').t(),
                        '<a href="#" class="save-data-model-button">' + _('save and edit').t() + '</a>'
                    )
                });
            this.$el.html(html);
            return this;
        },

        template: '\
            <% if(fieldGroups["objectCount"].length || fieldGroups["timestamp"].length || fieldGroups["other"].length) { %>\
                <table class="table field-list">\
                    <% if(fieldGroups["objectCount"] && fieldGroups["objectCount"].length > 0) { %>\
                        <tr class="event-group">\
                            <td class="group-name"><%- _("Event").t() %></td>\
                            <td>\
                                <% _(fieldGroups["objectCount"]).each(function(field) { %>\
                                    <div data-group-name="event">\
                                        <a href="#" class="field-button <%- eventButtonClass %>" \
                                                data-field-name="<%- field.fieldName %>" data-field-owner="<%- field.owner %>">\
                                            <span class="type-icon"><%= getIcon(field.type) %></span><%- field.displayName %>\
                                        </a>\
                                    </div>\
                                <% }); %>\
                            </td>\
                        </tr>\
                    <% } %>\
                    <% if(fieldGroups["timestamp"] && fieldGroups["timestamp"].length > 0) { %>\
                        <tr class="time-group">\
                            <td class="group-name"><%- _("Time").t() %></td>\
                            <td>\
                                <% _(fieldGroups["timestamp"]).each(function(field) { %>\
                                    <div data-group-name="time">\
                                        <a href="#" class="field-button  <%- timestampButtonClass %>" \
                                                data-field-name="<%- field.fieldName %>" data-field-owner="<%- field.owner %>">\
                                            <span class="type-icon"><%= getIcon(field.type) %></span><%- field.displayName %>\
                                        </a>\
                                    </div>\
                                <% }); %>\
                            </td>\
                        </tr>\
                    <% } %>\
                    <% if(fieldGroups["other"] && fieldGroups["other"].length > 0) { %>\
                        <tr class="attribute-group">\
                            <td class="group-name"><%- _("Field").t() %></td>\
                            <td>\
                                <% _(fieldGroups["other"]).each(function(field) { %>\
                                    <div data-group-name="attribute">\
                                        <a href="#" class="field-button  <%- otherButtonClass %>" \
                                                data-field-name="<%- field.fieldName %>" data-field-owner="<%- field.owner %>">\
                                            <span class="type-icon"><%= getIcon(field.type) %></span><%- field.displayName %>\
                                        </a>\
                                    </div>\
                                <% }); %>\
                            </td>\
                        </tr>\
                    <% } %>\
                </table>\
                <% if(dataModelIsTemporary) { %>\
                    <hr>\
                    <%= changeDataTypeMessage %>\
                <% } %>\
            <% } else {%>\
            No more fields available.\
            <% } %>\
        '

    });

});
