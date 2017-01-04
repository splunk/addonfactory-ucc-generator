import {configManager} from 'app/util/configManager';
import {
    parseErrorMsg
} from 'app/util/promptMsgController';

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
        className: 'dropdown-menu',
        initialize: function (options) {
            _.bindAll(this, ['edit', 'delete', 'clone']);
            PopTartView.prototype.initialize.apply(this, arguments);
            this.collection = options.collection;
            this.model = options.model;
            this.stateModel = options.stateModel;
            this.url = options.url;
            this.component = options.component;
            this.dispatcher = options.dispatcher;
            this.rowDispatcher = options.rowDispatcher;
            this.deleteTag = options.deleteTag;
        },

        events: {
            'click a.edit': 'edit',
            'click a.delete': 'delete',
            'click a.enable': 'enable',
            'click a.disable': 'disable',
            'click a.clone':  'clone'
        },

        render: function () {
            var html = this.compiledTemplate({}),
                actions;
            this.el.innerHTML = PopTartView.prototype.template_menu;
            this.$el.append(html);
            this.$el.addClass('dropdown-menu-narrow');

            actions = this.component.table.actions;
            if (actions.indexOf('enable') > -1 || actions.indexOf('disable') > -1) {
                let disabledVal = this.model.entry.content.attributes.disabled;
                // load enable/disable menu based on disabled value, disable by default
                if (Util.parseBoolean(disabledVal, false)) {
                    this.$('.second-group').append(
                        '<li><a href="#" class="enable">' +
                        _("Enable").t() +
                        '</a></li>'
                    );
                } else {
                    this.$('.second-group').append(
                        '<li><a href="#" class="disable">' +
                        _("Disable").t() +
                        '</a></li>'
                    );
                }
            }
            if (actions.indexOf('clone') > -1) {
                this.$('.second-group').append(
                    '<li><a href="#" class="clone">' +
                    _("Clone").t() +
                    '</a></li>'
                );
            }
            return this;
        },

        edit: function (e) {
            var editDialog = new EntityDialog({
                el: $(".dialog-placeholder"),
                collection: this.collection,
                model: this.model,
                mode: "edit",
                component: this._getComponent()
            });
            editDialog.render().modal();
            this.hide();
            e.preventDefault();
        },

        delete: function (e) {
            var inUse = false,
                deleteDialog;
            if (this.model.entry.content.attributes.hasOwnProperty('refCount')) {
                inUse = this.model.entry.content.attributes.refCount > 0 ? true : false;
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
            this.hide();
            this._enable();
            e.preventDefault();
        },

        _enable: function () {
            var url, collection, enable_url;
            collection = this.model.collection;
            if (!collection) {
                collection = this.collection;
            }
            url =  this.model._url === undefined ? collection._url : this.model._url;
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
            }).fail((model, response) => {
                this._displayError(parseErrorMsg(model));
            });
        },

        disable: function (e) {
            this.hide();
            var url, collection, disable_url;
            collection = this.model.collection;
            if (!collection) {
                collection = this.collection;
            }
            url =  this.model._url === undefined ? collection._url : this.model._url;
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
            }).fail((model, response) => {
                this._displayError(parseErrorMsg(model));
            });
            e.preventDefault();
        },

        clone: function (e) {
            var cloneDialog = new EntityDialog({
                el: $(".dialog-placeholder"),
                collection: this.collection,
                model: this.model,
                mode: "clone",
                component: this._getComponent()
            });
            cloneDialog.render().modal();
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
                    // In UCC 3.0, the "name" retrieved form model id is restRoot_originalName
                    const name = this.model.id.split('/')[this.model.id.split('/').length - 2];
                    if (`${restRoot}_${service.name}` === name) {
                        return service;
                    }
                });
            } else {
                component = this.component;
            }
            return component;
        },

        encodeUrl: function (str) {
            return encodeURIComponent(str).replace(/'/g, "%27").replace(/"/g, "%22");
        },

        isSearchHead: function (roles) {
            return _.some(roles, function (role) {
                return role.indexOf("search") > -1;
            });
        },

        template: [
            '<ul class="first-group">',
            '<li><a href="#" class="edit"><%- _("Edit").t() %></a></li>',
            '<li><a href="#" class="delete"><%- _("Delete").t() %></a></li>',
            '</ul>',
            '<ul class="second-group">',
            '</ul>'
        ].join('')
    });
});
