/**
 * Created by rtran on 4/19/16.
 */
define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'views/Base',
    'collections/managementconsole/topology/Instances',
    'views/managementconsole/utils/string_utils',
    'views/managementconsole/configuration/group/components/SimpleTextDialog',
    'views/managementconsole/deploy/components/StatusDialogHeader.pcss'
], function($,
            _,
            module,
            Backbone,
            BaseView,
            InstancesCollection,
            string_utils,
            SimpleTextDialog,
            css) {

    var STRINGS = {
        unknown: _('Unknown').t()
        },
        INSTANCE_LABELS = InstancesCollection.TABLE_COLUMN_LABELS,
        MODE = {
            instance: {
                headerClass: 'instance-header',
                header: {label: _('Instance: ').t(), field: 'clientName'},
                details: [
                    {label: INSTANCE_LABELS.HOST_NAME.label, field: 'hostname'},
                    {label: INSTANCE_LABELS.DNS_NAME.label, field: 'dns'},
                    {label: INSTANCE_LABELS.CLIENT_NAME.label, field: 'clientName'},
                    {label: INSTANCE_LABELS.IP_ADDRESS.label, field: 'ip'},
                    {label: INSTANCE_LABELS.PHONE_HOME.label, method: 'getRelativeLastPhoneHomeTime'},
                    {label: INSTANCE_LABELS.DEPLOY_STATUS.label, method: 'getDeployStatusLabel'}
                ]
            },
            app: {
                headerClass: 'app-header',
                header: {label: _('App: ').t(), field: 'name'},
                details: [
                    {label: _('Version').t(), method: 'getVersion'}
                    // COMMENT: hide for now until ratios are exposed for app/<name> endpoint
                    //{label: _('Instances Up to Date').t(), method: 'getInstancesUpToDateRatio'}
                ]
            },
            forwarders: {
                headerClass: 'all-forwarders-header',
                header: {label: _('All Forwarders').t()},
                details: [
                    {label: _('Apps').t(), method: 'getApps'},
                    {label: _('Instances Up to Date').t(), method: 'getInstancesUpToDateRatio'}
                ]
            },
            custom: {
                headerClass: 'server-class-header',
                header: {label: _('Server Class: ').t(), field: 'name'},
                details: [
                    {label: _('Apps').t(), method: 'getApps'}
                    // COMMENT: hide for now until ratios are exposed for group/<name> endpoint
                    //{label: _('Instances Up to Date').t(), method: 'getInstancesUpToDateRatio'}
                ]
            }
        };

    return BaseView.extend({
        moduleId: module.id,
        className: 'status-dialog-header',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.mode = this.options.mode;

            this.collection.moreList = new Backbone.Collection();
            this.children.moreListDialog = new SimpleTextDialog({collection: this.collection.moreList});
        },

        render: function() {
            var renderFields = this.constructRenderObject();

            renderFields.detailFields = this.overwriteUndefinedFields(renderFields.detailFields);
            this.$el.html(this.compiledTemplate(renderFields));

            return this;
        },

        events: {
            'click .show-details': function(e) {
                e.preventDefault();
                var method = $(e.currentTarget).data('method');
                var list = this.model[method].apply(this.model);

                list = _.map(list, function(listItem) {
                    return {text: listItem};
                });

                var simpleDialog = new SimpleTextDialog({collection: new Backbone.Collection(list)});
                $('body').append(simpleDialog.render().el);
                simpleDialog.show($(e.currentTarget));
            }
        },

        constructRenderObject: function() {
            var config = MODE[this.mode],
                renderObject = {};

            renderObject.headerClass = config.headerClass;
            renderObject.headerText = config.header.label;
            if (!_.isUndefined(config.header.field)) {
                if (config.header.field === 'name') {
                    renderObject.headerText += this.model.entry.get(config.header.field);
                } else {
                    renderObject.headerText += this.model.entry.content.get(config.header.field);
                }
            }
            renderObject.detailFields = [];

            _.each(config.details, function(detail) {
                var value, html;

                // if: the field is a function -> call function
                if(!_.isUndefined(detail.method)) {
                    value = this.model[detail.method].apply(this.model);
                    // if: the result of the call is an array -> format array to a pretty string
                    if (_.isArray(value)) {
                        value = value.length;
                        if (value !== 0) {
                            html = '<a class="show-details" data-method="'+detail.method+'">'+'('+_('details').t()+')'+'</a>';
                        }
                    }
                // else: the field is the field of the model -> retrieve value
                } else {
                    value = this.model.entry.content.get(detail.field);
                }

                renderObject.detailFields.push({label: detail.label, value: value, html: html});
            }, this);
            return renderObject;
        },

        /**
         * Fill in undefined values with the label "Unknown"
         */
        overwriteUndefinedFields: function(fields) {
            _.each(fields, function(field) {
                if (_.isUndefined(field.value) || _.isNull(field.value)) {
                    field.value = STRINGS.unknown;
                }
            });
            return fields;
        },

        template: '<div class="<%- headerClass %> section-header"> \
            <h2 class="section-title"><%- headerText %></h2> \
            <div class="details-header"> \
                <dl class="list-dotted pull-left"> \
                    <% _.each(detailFields, function(field) { %> \
                    <dt><%- field.label %></dt> \
                    <dd> \
                    <%- field.value %> \
                    <% if (field.html) { %> \
                    <%= field.html %> \
                    <% } %> \
                    </dd> \
                    <% }) %> \
                </dl> \
            </div> \
        </div>'
    });
});