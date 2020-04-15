import { configManager } from 'app/util/configManager';
import {
    MODE_CLONE,
    MODE_EDIT
} from 'app/constants/modes';
import { PAGE_STYLE } from 'app/constants/pageStyle';

define([
    'jquery',
    'lodash',
    'backbone',
    'views/Base',
    'app/util/Util',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticCheckboxControl',
    'app/views/component/EntityDialog',
    'app/views/component/DeleteDialog',
    'app/views/component/SwitchButton'
], function(
    $,
    _,
    Backbone,
    BaseView,
    Util,
    ControlGroup,
    SyntheticCheckboxControl,
    EntityDialog,
    DeleteDialog,
    SwitchButton
) {
    return BaseView.extend({
        tagName: 'tr',

        className: 'apps-table-tablerow',

        events: {
            'click a.edit': function(e) {
                e.preventDefault();
                this.edit();
            },

            'click a.clone': function(e) {
                e.preventDefault();
                this.clone();
            },

            'click a.delete': function(e) {
                e.preventDefault();
                this.delete();
            }
        },

        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');

            /*
                Attributes: collection, stateModel, allCollection,
                enableBulkActions, enableMoreInfo, showActions,
                component, navModel;
                Splunk data model: this.model.entity;
                Splunk data collection: this.model.collection;
            */
            _.extend(this, this.model);

            if (options.dispatcher) {
                this.dispatcher = options.dispatcher;
            }

            if (this.enableBulkActions) {
                if (!this.model.checkbox) {
                    this.model.checkbox = new Backbone.Model();
                    this.model.checkbox.set("checked", 0);
                }
                this.bulkboxControl = new SyntheticCheckboxControl({
                    modelAttribute: 'checked',
                    model: this.model.checkbox
                });
                this.bulkbox = new ControlGroup({
                    controls: [this.bulkboxControl]
                });
            }

            this.activate();
        },

        edit: function() {
            const component = this._getComponent();
            if (component['style'] && component['style'] === PAGE_STYLE) {
                this.navModel.dataModel = this.model.entity;
                this.navModel.navigator.navigate({
                    'service': component.name,
                    'action': MODE_EDIT
                });
            } else {
                const editDialog = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: this.model.collection,
                    model: this.model.entity,
                    mode: MODE_EDIT,
                    component: component,
                    dispatcher: this.dispatcher
                });
                editDialog.render().modal();
            }
        },

        clone: function() {
            const component = this._getComponent();
            if (component['style'] && component['style'] === PAGE_STYLE) {
                this.navModel.dataModel = this.model.entity;
                this.navModel.navigator.navigate({
                    'service': component.name,
                    'action': MODE_CLONE
                });
            } else {
                const cloneDialog = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: this.model.collection,
                    model: this.model.entity,
                    mode: MODE_CLONE,
                    component: component,
                    dispatcher: this.dispatcher
                });
                cloneDialog.render().modal();
            }
        },

<<<<<<< HEAD
        delete: function () {
=======
        delete: function() {
>>>>>>> c1ce5c162f986d49d79babe53c7a63f0cc2838bb

            const deleteDialog = new DeleteDialog({
                el: $(".dialog-placeholder"),
                collection: this.model.collection,
                model: this.model.entity,
                stateModel: this.stateModel,
                dispatcher: this.dispatcher,
                deleteTag: this.deleteTag
            });
            deleteDialog.render().modal();
        },

        _loadCustomCell: function(module, field, model, index) {
            const deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module], (CustomCell) => {
                const el = document.createElement("td");
                el.className = 'col-' + field;
                const serviceName = Util.extractServiceName(model);
                const customCell = new CustomCell(
                    this.unifiedConfig,
                    serviceName,
                    el,
                    field,
                    model
                );
                this.cells[index] = customCell.render().el;
                deferred.resolve(CustomCell);
            });
            return deferred.promise();
        },

        _renderRow: function() {
            this.deferreds = [];
            this.cells = [];
            const header = this.component.table.header;
            _.each(header, ({ field, mapping, customCell }, index) => {
                let fieldValue;
                if (field === 'name') {
                    fieldValue = this.model.entity.entry.get(field);
                } else {
                    fieldValue = this.model.entity.entry.content.get(field);
                }

                if (!customCell) {
                    // Add switch button for status column
                    if (field === 'disabled') {
                        if (_.isUndefined(fieldValue)) {
                            fieldValue = false;
                        }
                        const el = document.createElement("td");
                        el.className = 'col-' + field;

                        const switchButton = new SwitchButton({
                            el: el,
                            enabled: !fieldValue, // disabled field value
                            name: this.model.entity.entry.get('name'),
                            url: this.model.entity._url,
                            app: this.model.entity.get('appData').app,
                            dispatcher: this.dispatcher
                        }).render();
                        this.cells[index] = switchButton.el;
                    } else if (field === '_input_service') {
                        // Sample Id: /servicesNS/nobody/Addon-name/service_name/stanza_name
                        var service_input_id_path = this.model.entity.attributes.id;
                        var service_input_id_list = service_input_id_path.split("/");
                        var service_input_id = service_input_id_list[service_input_id_list.length - 2];
                        var service_id = service_input_id.replace(this.model.entity.attributes.appData.stanzaPrefix + "_", "");
                        var service_title = "";
                        _.each(this.model.component.services, function(service_obj) {
                            if (service_obj.name === service_id) {
                                service_title = service_obj.title;
                            }
                        });
                        this.cells[index] = '<td>' + service_title + '</td>';
                    } else if (field === '_app_name') {
                        this.cells[index] = '<td>' + this.model.entity.attributes.targetApp + '</td>';
                    } else {
                        fieldValue = fieldValue === undefined ?
                            '' : String(fieldValue);
                        if (mapping) {
                            fieldValue = !_.isUndefined(mapping[fieldValue]) ?
                                mapping[fieldValue] : fieldValue;
                        }
                        const html = `<td  class="col-${field}">
                                    ${Util.encodeHTML(fieldValue)}</td>`;
                        this.cells[index] = html;
                    }
                } else {
                    this.deferreds.push(
                        this._loadCustomCell(
                            customCell.src,
                            field,
                            this.model.entity,
                            index
                        )
                    );
                }
            });
        },

        render: function() {
            if (this.enableBulkActions) {
                this.$el.append(`<td class="box checkbox col-inline"></td>`);
                this.$('.box').append(this.bulkbox.render().el);
            }
            if (this.enableMoreInfo) {
                this.$el.append(_.template(this.expandTemplate));
            }

            this._renderRow();
            $.when(...this.deferreds).done(() => {
                _.each(this.cells, cell => {
                    this.$el.append(cell);
                });

                if (this.showActions) {
                    this.$el.append(_.template(this.actionTemplate));
                }
                // For automation test
                if (this.model.entity.entry.get('name')) {
                    this.$el.addClass(
                        `row-${this.model.entity.entry.get('name')}`
                    );
                }
            });
            return this;
        },

        _getComponent: function() {
            let component;
            if (this.component.services) {
                const { unifiedConfig: { meta: { restRoot } } } = configManager;
                component = _.find(this.component.services, service => {
                    // In UCC 3.x, the "name" retrieved from model id
                    // which is restRoot_originalName
                    const idStrings = this.model.entity.id.split('/');
                    const name = idStrings[idStrings.length - 2];
                    if (`${restRoot}_${service.name}` === name) {
                        return service;
                    }
                });
            } else {
                component = this.component;
            }
            return component;
        },

        expandTemplate: `
            <td class="expands">
                <a href="#">
                    <i class="icon-triangle-right-small"></i>
                </a>
            </td>
        `,

        actionTemplate: `
            <td class="actions col-actions">
                <a class="edit"><%- _("Edit").t() %></a> |
                <a class="clone"><%- _("Clone").t() %></a> |
                <a class="delete"><%- _("Delete").t() %></a>
            </td>
        `
    });
});