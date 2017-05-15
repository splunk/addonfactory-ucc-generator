import {configManager} from 'app/util/configManager';
import {parseErrorMsg} from 'app/util/promptMsgController';
import {
    MODE_CLONE,
    MODE_EDIT
} from 'app/constants/modes';
import {PAGE_STYLE} from 'app/constants/pageStyle';
import WaitSpinner from 'app/views/component/WaitSpinner';

define([
    'lodash',
    'jquery',
    'views/shared/PopTart',
    'app/views/component/EntityDialog',
    'app/views/component/DeleteDialog',
    'app/views/component/Error',
    'app/util/Util'
], function (
    _,
    $,
    PopTartView,
    EntityDialog,
    DeleteDialog,
    ErrorDialog,
    Util
) {
    return PopTartView.extend({
        className: 'dropdown-menu dropdown-menu-narrow',
        initialize: function (options) {
            _.bindAll(this, ['edit', 'delete', 'clone']);
            PopTartView.prototype.initialize.apply(this, arguments);
            /**
                collection, model, stateModel, url, component,
                dispatcher, rowDispatcher, deleteTag, navModel
            **/
            _.extend(this, options);
        },

        events: {
            'click a.edit': 'edit',
            'click a.delete': 'delete',
            'click a.enable': 'enable',
            'click a.disable': 'disable',
            'click a.clone':  'clone'
        },

        render: function () {
            this.$el.html(_.template(this.template));
            let actions = this.component.table.actions;
            if (actions.indexOf('enable') > -1 ||
                    actions.indexOf('disable') > -1) {
                let disabledVal = this.model.entry.content.get('disabled');
                // Load enable/disable menu based on disabled value,
                // disable by default
                if (Util.parseBoolean(disabledVal, false)) {
                    this.$('.second-group').append(
                        _.template(this.listTemplate)({
                            'actionClass': 'enable',
                            'actionLabel': "Enable"
                        })
                    );
                } else {
                    this.$('.second-group').append(
                        _.template(this.listTemplate)({
                            'actionClass': 'disable',
                            'actionLabel': "Disable"
                        })
                    );
                }
            }
            if (actions.indexOf('clone') > -1) {
                this.$('.second-group').append(
                    _.template(this.listTemplate)({
                        'actionClass': 'clone',
                        'actionLabel': "Clone"
                    })
                );
            }
            return this;
        },

        edit: function (e) {
            let component = this._getComponent();
            if (component['style'] && component['style'] === PAGE_STYLE) {
                this.navModel.dataModel = this.model;
                this.navModel.navigator.navigate({
                    'service': component.name,
                    'action': MODE_EDIT
                });
            } else {
                let editDialog = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: this.collection,
                    model: this.model,
                    mode: MODE_EDIT,
                    component: this._getComponent()
                });
                editDialog.render().modal();
            }
            this.hide();
            e.preventDefault();
        },

        delete: function (e) {
            let inUse = false,
                deleteDialog;
            if (this.model.entry.content.get('refCount')) {
                inUse = this.model.entry.content.get('refCount') > 0 ?
                    true : false;
            }

            deleteDialog = new DeleteDialog({
                el: $(".dialog-placeholder"),
                collection: this.collection,
                model: this.model,
                stateModel: this.stateModel,
                dispatcher: this.dispatcher,
                inUse: inUse,
                deleteTag: this.deleteTag
            });
            deleteDialog.render().modal();
            this.hide();
            e.preventDefault();
        },

        enable: function (e) {
            this._addLoading(e);
            this._enable();
            e.preventDefault();
        },

        _enable: function () {
            let url, collection, enable_url;
            collection = this.model.collection;
            if (!collection) {
                collection = this.collection;
            }
            url =  this.model._url === undefined ?
                collection._url : this.model._url;
            enable_url = [
                collection.proxyUrl,
                url,
                this.encodeUrl(this.model.entry.attributes.name)
            ].join('/') + '?output_mode=json';

            $.ajax({
                type: 'POST',
                data: {disabled: 0},
                url: enable_url
            }).done(() => {
                this.rowDispatcher.trigger('enable-input');
            }).fail((model) => {
                this._displayError(parseErrorMsg(model));
            }).always(() => {
                this._removeLoading();
                this.hide();
            });
        },

        disable: function (e) {
            this._addLoading(e);
            var url, collection, disable_url;
            collection = this.model.collection;
            if (!collection) {
                collection = this.collection;
            }
            url =  this.model._url === undefined ?
                collection._url : this.model._url;
            disable_url = [
                collection.proxyUrl,
                url,
                this.encodeUrl(this.model.entry.attributes.name)
            ].join('/') + '?output_mode=json';

            $.ajax({
                type: 'POST',
                data: {disabled: 1},
                url: disable_url
            }).done(() => {
                this.rowDispatcher.trigger('disable-input');
            }).fail((model) => {
                this._displayError(parseErrorMsg(model));
            }).always(() => {
                this._removeLoading();
                this.hide();
            });
            this.hide();
            e.preventDefault();
        },

        clone: function (e) {
            let component = this._getComponent();
            if (component['style'] && component['style'] === PAGE_STYLE) {
                this.navModel.dataModel = this.model;
                this.navModel.navigator.navigate({
                    'service': component.name,
                    'action': MODE_CLONE
                });
            } else {
                let cloneDialog = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: this.collection,
                    model: this.model,
                    mode: MODE_CLONE,
                    component: this._getComponent()
                });
                cloneDialog.render().modal();
            }
            this.hide();
            e.preventDefault();
        },

        _displayError: function (msg) {
            let errorDialog = new ErrorDialog({
                el: $('.dialog-placeholder'),
                msg: msg
            });
            errorDialog.render().modal();
        },

        _getComponent: function () {
            let component;
            if (this.component.services) {
                const {unifiedConfig: {meta: {restRoot}}} = configManager;
                component = _.find(this.component.services, service => {
                    // In UCC 3.0, the "name" retrieved from model id
                    // which is restRoot_originalName
                    const idStrings = this.model.id.split('/');
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

        _addLoading: function (e) {
            this.waitSpinner = new WaitSpinner();
            let el = this.waitSpinner.render().$el;
            el.css({
                'position': 'absolute',
                'right': '5px',
                'top': '5px'
            });
            $(e.target.parentElement).append(el);
        },

        _removeLoading: function () {
            if (this.waitSpinner) {
                this.waitSpinner.remove();
            }
        },

        encodeUrl: function (str) {
            return encodeURIComponent(str)
                .replace(/'/g, "%27").replace(/"/g, "%22");
        },

        isSearchHead: function (roles) {
            return _.some(roles, function (role) {
                return role.indexOf("search") > -1;
            });
        },

        listTemplate: `
            <li>
                <a href="#" class="<%- actionClass %>">
                    <%- _(actionLabel).t() %>
                </a>
            </li>
        `,

        template: `
            <ul class="first-group">
                <li><a href="#" class="edit"><%- _("Edit").t() %></a></li>
                <li><a href="#" class="delete"><%- _("Delete").t() %></a></li>
            </ul>
            <ul class="second-group">
            </ul>
        `
    });
});
