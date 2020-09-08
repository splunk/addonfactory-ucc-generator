/**
 * Created by ykou on 2/21/14.
 */
define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        UserImpersonationModel = require('models/services/admin/Impersonation'),
        BaseView = require('views/Base'),
        Backbone = require('backbone'),
        ControlGroup = require('views/shared/controls/ControlGroup'),
        FlashMessagesView = require('views/shared/FlashMessages'),
        SplunkDBase = require('models/SplunkDBase'),
        splunkUtils = require('splunk.util'),
        route = require('uri/route');
    // http://eswiki.splunk.com/Hunk_README#Provider_config_variables

    var NO_PROVIDERS_ERROR = "__no_providers_error";

    return BaseView.extend({
        moduleId: module.id,
        className: 'section-padded',

        initialize: function(options){
            /** we use a mediator to read/write data of user impersonation
             * on page load:
             *      - providers write to mediator
             *      - splunkUsers write to mediator
             *
             * on mediator change:provider and change:splunkUser):
             *      - read userImpersonation collection
             *      - update mediator: hadoopUser and queue
             *
             * on click save button:
             *      - write to userImpersonation collection
             *      - userImpersonation collection save to server
             */
            BaseView.prototype.initialize.call(this, options);

            this._providerListViewDfd = $.Deferred();
            this._usersListViewDfd = $.Deferred();
            this._mediator = new Backbone.Model();

            this.children.flashMessagesView = new FlashMessagesView({collection:this.collection});

            $.when(this.options.providersAllDfd, this.options.splunkUsersDfd, this.options.userImpersonationDfd).done(function() {
                this._initProviderList();
                this._initAvailableUsersList();
            }.bind(this));

            this._initHadoopUser();
            this._initQueue();

            this.listenTo(this._mediator,
                'change:provider reset:provider change:splunkUser reset:splunkUser',
                this._onChooseProviderAndUser
            );

            this.listenTo(this.collection.providersAll,
                'change reset remove',
                this._initProviderList
            );
        },

        events: {
            'click .btn-primary': function(e) {
                e.preventDefault();
                // synchronize data from mediator to collection, then save collection
                this._enableImpersonation();
                this._copyFromMediatorToModel();
            }
        },

        _initProviderList: function() {
            this._providerListItems = this.collection.providersAll.filter(function(model) {
                return model.entry.content.get("vix.splunk.impersonation") == 1;
            }).map(function(model) {
                    return {
                        value: model.entry.get('name'),
                        label: model.entry.get('name')
                    };
            });

            this.children.providerList = new ControlGroup({
                className: 'provider-list control-group',
                controlType: 'SyntheticSelect',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'provider',
                    model: this._mediator,
                    items: this._providerListItems,
                    className: 'btn-group view-count',
                    menuWidth: 'narrow',
                    toggleClassName: 'btn',
                    prompt: _("Select a Provider").t()
                },
                label: _("Providers").t()
            });

            // resolve deferred, so that providerList is ready to render
            this._providerListViewDfd.resolve();

            this.$el.find('.provider-list-container').empty().append(this.children.providerList.render().el);

            this.updateView();
        },


        _initAvailableUsersList: function() {
            this._usersListThisProvider = this.collection.splunkUsers.map(function(model) {
                return {
                    value: model.entry.get('name'),
                    label: model.entry.get('name')
                };
            });

            this.children.usersList = new ControlGroup({
                className: 'users-list control-group',
                controlType: 'SyntheticSelect',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'splunkUser',
                    model: this._mediator,
                    items: this._usersListThisProvider,
                    className: 'btn-group view-count',
                    menuWidth: 'narrow',
                    toggleClassName: 'btn',
                    prompt: _("Select a User").t()
                },
                label: _("Users").t()
            });

            this._usersListViewDfd.resolve();
        },

        _initHadoopUser: function() {
            this.children.hadoopUser = new ControlGroup({
                className: 'hadoop-user-name control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'hadoopUser',
                    model: this._mediator,
                    save: false
                },
                label: _('Hadoop User').t()
            });
        },

        _initQueue: function() {
            this.children.hadoopQueue = new ControlGroup({
                className: 'queue control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'hadoopQueue',
                    model: this._mediator,
                    save: false
                },
                label: _('Queue').t()
            });

//            var $queue = this.children.hadoopQueue.render().$el.hide();
//            this.$el.find('.adminContent > .queue').empty().append($queue);
//            $queue.show('fast');
        },

        _onChooseProviderAndUser: function(e) {
            var name = this._mediator.get('provider');
            var user = this._mediator.get('splunkUser');
            var hadoopUser;
            var hadoopQueue;
            var provider = this.collection.userImpersonation.find(function(model) {
                return model.getName('name') === name;
            });

            if (name && user) {
                this.children.hadoopUser.enable();
                this.children.hadoopQueue.enable();
                this.$el.find('a.btn-primary').removeClass('disabled');
            }

            if (provider) {
                hadoopUser = provider.getHadoopUser(user);
                hadoopQueue = provider.getHadoopQueue(user);
            }

            // update hadoop user and hadoop queue fields
            this._mediator.set('hadoopUser', hadoopUser);
            this._mediator.set('hadoopQueue', hadoopQueue);
        },

        _copyFromMediatorToModel: function() {
            var name = this._mediator.get('provider');
            var splunkUser = this._mediator.get('splunkUser');
            var hadoopUser = this._mediator.get('hadoopUser');
            var hadoopQueue = this._mediator.get('hadoopQueue');

            var impersonation = this.collection.userImpersonation.find(function(model) {
                return model.getName('name') === name;
            });

            var userImpersonationModel = impersonation ? impersonation : new UserImpersonationModel();

            userImpersonationModel.setAllAttributes(name, splunkUser, hadoopUser, hadoopQueue);
            // Save the impersonation model as app sharing

            userImpersonationModel.save({}, {data: {app: "search",owner: "nobody"}}).done(_(function() {
                this.collection.userImpersonation.fetch(); // Refresh the collection with the latest changes
            }).bind(this));

            this.$el.find('#save-message').html(_('saved!').t()).hide().show('').delay(1000).hide('slow');
        },

        _enableImpersonation: function() {

            var provider = this._mediator.get('provider');
            this.collection.providersAll.each(function(model) {
                if (model.entry.get('name') === provider) {
                    model.entry.content.set('vix.splunk.impersonation', 1);
                    model.save();
                }
            }, this);
        },

        updateView: function() {
            var providersLength = this._providerListItems.length;
            var pageRouter = route.getContextualPageRouter(this.model.application);

            if (providersLength > 0) {
                this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(NO_PROVIDERS_ERROR);
                this.$(".admin-content").show();
            } else {
                var providerUrl = pageRouter.manager("virtual_indexes", {data:{t:"providers"}});
                var providerMsg = splunkUtils.sprintf(
                    _("The admin has not created any Hadoop providers with Pass Through Authentication enabled. <a href='%s'> Manage providers.</a>").t(),
                    providerUrl);

                // Show an error message saying that there are no providers with Pass Through Authentication
                this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(NO_PROVIDERS_ERROR,
                    {type: splunkUtils.WARNING,
                        html:providerMsg});
                this.$(".admin-content").hide();
            }
        },


        render: function() {
            var $html = $(this.compiledTemplate());

            this.$el.empty();

            $.when(this._providerListViewDfd, this._usersListViewDfd).done(function() {
                $html.children('.provider-list-container').append(this.children.providerList.render().el);
                $html.children('.users-list').append(this.children.usersList.render().el);
                $html.children('.hadoop-user').append(this.children.hadoopUser.render().el);
                $html.children('.queue').append(this.children.hadoopQueue.render().el);

                // only editable when user choose provider and user
                if (!this._mediator.get('provider') || !this._mediator.get('splunkUser')) {
                    this.children.hadoopUser.disable();
                    this.children.hadoopQueue.disable();
                }
            }.bind(this));

            this.$el.html($html);

            this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-placeholder"));

            return this;
        },
        template:
            '<div class="flash-messages-placeholder"></div>' +
            '<div class="admin-content dashboard-panel clearfix">' +
                    '<div class="provider-list-container"></div>' +
                    '<div class="users-list"></div>' +
                    '<div class="hadoop-user"></div>' +
                    '<div class="queue"></div>' +

                    '<div class="button-wrapper">' +
                        '<a href="#" class="btn btn-primary pull-right disabled">' + _('Save').t() + '</a>' +
                        '<div class="pull-left" id="save-message" style="font-size: 20px; font-weight: bold; background-color:#ffff99;"></div>' +
                    '</div>' +
                  '</div>'
    });
});