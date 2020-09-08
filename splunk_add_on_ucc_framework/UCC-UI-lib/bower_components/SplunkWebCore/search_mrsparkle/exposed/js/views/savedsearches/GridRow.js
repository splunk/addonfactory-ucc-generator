/**
 * @author claral
 * @date 3/30/16
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given saved search. 
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/search/Alert',
    'views/Base',
    'views/shared/alertcontrols/EditMenu',
    'views/shared/alertcontrols/dialogs/edit/Master',
    'views/shared/basemanager/SharingCell',
    'views/shared/basemanager/StatusCell',
    'views/shared/documentcontrols/dialogs/EditSearchDialog',
    'views/shared/reportcontrols/editmenu/Master',
    'contrib/text!views/savedsearches/GridRow.html',
    'util/general_utils',
    'util/string_utils',
    'uri/route',
    'splunk.util'
],
    function (
        $,
        _,
        Backbone,
        module,
        AlertModel,
        BaseView,
        AlertEditMenuView,
        AlertEditDialog,
        SharingCellView,
        StatusCellView,
        ReportEditSearchDialog,
        ReportEditMenuView,
        Template,
        util,
        stringUtils,
        route,
        splunkUtils
        ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",
            template: Template,

            events: {
                'click .edit-entity-link': function(e) {
                    if (this.model.entity.isAlert()) {
                        this.children.editAlertDialog = new AlertEditDialog({
                            model: {
                                alert: this.model.entity,
                                application: this.model.application,
                                user: this.model.user,
                                serverInfo: this.model.serverInfo,
                                controller: this.model.controller
                            },
                            collection: {
                                alertActions: this.collection.alertActions,
                                searchBNFs: this.collection.searchBNFs
                            },
                            onHiddenRemove: true,
                            showSearchField: true
                        });
                        this.children.editAlertDialog.render().appendTo($("body"));
                        this.children.editAlertDialog.show();
                    } else {
                        this.children.reportEditSearchDialog = new ReportEditSearchDialog({
                            model: {
                                report: this.model.entity,
                                user: this.model.user,
                                application: this.model.application
                            },
                            collection: {
                                searchBNFs: this.collection.searchBNFs
                            },
                            onHiddenRemove: true,
                            showSearchField: true
                        });
                        this.children.reportEditSearchDialog.render().appendTo($("body"));
                        this.children.reportEditSearchDialog.show();
                    }
                    e.preventDefault();
                },
                'click .run-action': function(e) {
                    // use SS app if it's visible, otherwise take app from url
                    var app = this.model.entity.entry.acl.get('app'),
                        isInvisible = this.collection.appLocalsUnfilteredAll.find(function(model) {
                            if (model.entry.get('name') === app &&
                                model.entry.content.get('visible') === false) {
                                return true;
                            }
                        });
                    if (isInvisible) {
                        app = this.model.application.get("app");
                        if (app === 'system') {
                            app = 'search';
                        }
                    }
                    window.open(route.search(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        app,
                        {data: {s: this.model.entity.id}}));
                    e.preventDefault();
                },
                'click .view-recent-action': function(e) {
                    var app = this.model.application.get("app");
                    if (app === 'system') {
                        app = 'search';
                    }
                    window.open(route.job_manager(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        app,
                        {data: {
                            app: "",
                            filter: "label=\"" + this.model.entity.entry.get('name') + "\""
                        }}));
                    e.preventDefault();
                },
                'click .model-more-description, .model-less-description': function(e) {
                    e.preventDefault();
                    this.$('.model-description-short, .model-description-full').toggle();
                }
            },

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.sharingCell = new SharingCellView({
                    collection: this.collection,
                    model: this.model,
                    showPermissions: false
                });

                this.children.statusCell = new StatusCellView({
                    collection: this.collection,
                    model: this.model
                });

                if (this.model.entity.isAlert()) {
                    this.createEditAlertDialog();
                } else {
                    this.createEditReportDialog();
                }
            },

            createEditReportDialog: function() {
                this.children.editmenu = new ReportEditMenuView({
                    model: {
                        application: this.model.application,
                        report: this.model.entity,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        controller: this.model.controller
                    },
                    collection: {
                        roles: this.collection.rolesCollection,
                        appLocals: this.collection.appLocals,
                        searchBNFs: this.collection.searchBNFs
                    },
                    button: false,
                    showOpenActions: false,
                    showDisable: true,
                    entitySingular: this.options.entitySingular,
                    showMove: true,
                    showAdvancedEdit: this.model.user.isAdminLike() && true,
                    showSearchField: true
                });

                this.listenTo(this.model.entity, 'updateCollection', function() {
                    this.model.controller.trigger('refreshEntities');
                });
                this.listenTo(this.model.entity.entry.acl, 'change:sharing', function() {
                    this.model.controller.trigger('refreshEntities');
                });
                this.listenTo(this.model.entity.entry.content, 'change:disabled', function() {
                    this.model.controller.trigger('refreshEntities');
                });
            },

            createEditAlertDialog: function() {
                // Convert model to alert
                this.model.entity = new AlertModel({}, {splunkDPayload: this.model.entity.toSplunkD()});

                this.children.editmenu = new AlertEditMenuView({
                    model: {
                        savedAlert: this.model.entity,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        controller: this.model.controller
                    },
                    collection: {
                        roles: this.collection.rolesCollection,
                        alertActions: this.collection.alertActions,
                        appLocals: this.collection.appLocals,
                        searchBNFs: this.collection.searchBNFs
                    },
                    button: false,
                    showOpenActions: false,
                    entitySingular: this.options.entitySingular,
                    showMove: true,
                    showAdvancedEdit: this.model.user.isAdminLike() && true,
                    showSearchField: true
                });

                this.listenTo(this.model.entity, 'updateCollection', function() {
                    this.model.controller.trigger('refreshEntities');
                });
                this.listenTo(this.model.entity.entry.acl, 'change:sharing', function() {
                    this.model.controller.trigger('refreshEntities');
                });
                this.listenTo(this.model.entity.entry.content, 'change:disabled', function() {
                    this.model.controller.trigger('refreshEntities');
                });
            },

            getAlertCount: function() {
                return this.model.entity.entry.content.get('triggered_alert_count') || _('0').t();
            },

            render: function () {
                var showNameLink = true;
                // Hide name link if the entity is a report and the license is free
                if (this.model.entity.isAlert() && !this.model.user.canUseAlerts()) {
                    showNameLink = false;
                }
                // Hide name link if the user lacks permission to edit or the report is embedded.
                if (showNameLink && !this.model.entity.canWrite(this.model.user.canScheduleSearch(), this.model.user.canRTSearch()) ||
                    util.normalizeBoolean(this.model.entity.entry.content.get('embed.enabled'))) {
                    showNameLink = false;
                }

                var html = this.compiledTemplate({
                    model: this.model.entity,
                    canDeleteSourcetype: this.model.entity.entry.links.has('remove'),
                    description: _(this.model.entity.entry.content.get('description') || '').t(),
                    stringUtils: stringUtils,
                    descMaxLength: 300,
                    isCloud: this.model.serverInfo.isCloud(),
                    alertCount: this.getAlertCount(),
                    showNameLink: showNameLink
                });

                this.$el.html(html);
                this.children.editmenu.render().prependTo(this.$('.cell-actions'));
                this.children.sharingCell.render().appendTo(this.$('.sharing-cell-placeholder'));
                this.children.statusCell.render().appendTo(this.$('.status-cell-placeholder'));
                this.$('.model-description-full').hide();

                return this;
            }
        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t()
                }, {
                    id: 'next_scheduled_time',
                    title: _('Scheduled Time').t()
                }, {
                    id: 'displayview',
                    title: _('Display View').t()
                }, {
                    id: 'eai:acl.owner',
                    title: _('Owner').t()
                }, {
                    id: 'eai:acl.app',
                    title: _('App').t()
                }, {
                    id: 'triggered_alert_count',
                    title: _('Alerts').t()
                }, {
                    id: 'eai:acl.sharing',
                    title: _('Sharing').t()
                }, {
                    id: 'disabled',
                    title: _('Status').t()
                }
            ]
        });
    });
