/*global define*/
define([
    'underscore',
    'jquery',
    'views/shared/PopTart',
    'app/views/component/EntityDialog',
    'app/views/component/DeleteDialog',
    'app/views/component/Error',
    'app/views/component/Warning'
], function (
    _,
    $,
    PopTartView,
    EntityDialog,
    DeleteDialog,
    ErrorDialog,
    WarningDialog
) {
    return PopTartView.extend({
        className: 'dropdown-menu',
        initialize: function (options) {
            _.bindAll(this, 'edit', 'delete', 'clone');
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
            if ($.inArray('enable', actions) > 0 || $.inArray('disable', actions) > 0) {
                if (this.model.entry.content.attributes.disabled) {
                    this.$('.second-group').append('<li><a href="#" class="enable">' + _("Enable").t() + '</a></li>');
                } else {
                    this.$('.second-group').append('<li><a href="#" class="disable">' + _("Disable").t() + '</a></li>');
                }
            }
            if ($.inArray('clone', actions) > 0) {
                this.$('.second-group').append('<li><a href="#" class="clone">' + _("Clone").t() + '</a></li>');
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
                this.encodeUrl(this.model.entry.attributes.name),
                'enable'
            ].join("/") + '?output_mode=json';

            $.post(enable_url).done(function () {
                this.rowDispatcher.trigger('enable-input');
            }.bind(this)).fail(function (model, response) {
                this._displayError(model, response);
            }.bind(this));
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
                this.encodeUrl(this.model.entry.attributes.name),
                'disable'
            ].join("/") + '?output_mode=json';
            $.post(disable_url).done(function () {
                this.rowDispatcher.trigger('disable-input');
            }.bind(this)).fail(function (model, response) {
                this._displayError(model, response);
            }.bind(this));
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

        _displayError: function (model) {
            var error_msg, rsp, regx, msg, matches, errorDialog;
            try {
                rsp = JSON.parse(model.responseText);
                regx = /In handler[\s\S]+and output:\s+\'([\s\S]*)\'\.\s+See splunkd\.log for stderr output\./;
                msg = String(rsp.messages[0].text);
                matches = regx.exec(msg);
                if (!matches || !matches[1]) {
                    // try to extract another one
                    regx = /In handler[^:]+:\s+([\s\S])/;
                    matches = regx.exec(msg);
                    if (!matches || !matches[1]) {
                        matches = [msg];
                    }
                }
                error_msg = matches[1];
            } catch (err) {
                error_msg = "ERROR in processing the request";
            } finally {
                errorDialog = new ErrorDialog({
                    el: $('.dialog-placeholder'),
                    msg: error_msg
                });
                errorDialog.render().modal();
            }
        },

        _getComponent: function () {
            let component;
            if (this.component.services) {
                component = _.find(this.component.services, service => {
                    let name = this.model.id.split('/')[this.model.id.split('/').length - 2];
                    if (service.name === name) {
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
