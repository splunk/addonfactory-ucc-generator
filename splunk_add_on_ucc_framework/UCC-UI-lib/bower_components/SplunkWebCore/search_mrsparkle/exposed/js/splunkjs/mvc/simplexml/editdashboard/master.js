define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var BaseView = require('views/Base');
    var DashboardModel = require('models/search/Dashboard');
    var ACLReadOnlyModel = require('models/ACLReadOnly');
    var Roles = require('collections/services/authorization/Roles');
    var EditMenu = require('views/dashboard/header/EditMenu');
    var PermissionsDialog = require('views/shared/documentcontrols/dialogs/permissions_dialog/Master');
    var ConvertDialog = require('views/dashboards/table/controls/ConvertDashboard');
    var CloneDialog = require('views/dashboards/table/controls/CloneDashboard');
    var SchedulePDFDialog = require('views/dashboards/table/controls/SchedulePDF');
    var TextDialog = require('views/shared/dialogs/TextDialog');
    var DashboardSerializer = require('../serializer');
    var Printer = require('helpers/Printer');
    var splunkUtils = require('splunk.util');
    var utils = require('../../utils');
    var route = require('uri/route');
    var mvc = require('../../../mvc');
    var pdfUtils = require('util/pdf_utils');

    return BaseView.extend({
        className: "splunk-dashboard-controls",

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.rolesCollection = new Roles();
            this.rolesCollection.fetch();
            this._mockController = new Backbone.Model();
            this.children.menuView = new EditMenu({
                model: {
                    controller: this._mockController,
                    view: this.model.dashboard,
                    application: this.model.application,
                    scheduledView: this.model.scheduledView,
                    serverInfo: this.model.serverInfo,
                    user: this.model.state.user,
                    userPref: this.model.userPref
                },
                collection: {
                    apps: this.collection.appLocalsUnfiltered
                }
            });
            this._handleControllerEvent();
        },
        render: function() {
            this.$el.append(this.children.menuView.render().el);
            return this;
        },
        _handleControllerEvent: function() {
            this.stopListening(this._mockController);
            this.listenTo(this._mockController, 'all', function(event) {
                switch (event) {
                    case 'action:export-pdf':
                    case 'action:schedule-pdf':
                    case 'action:convert-html':
                        // dead code, ideally these actions will not be triggered.
                        break;
                    case 'action:make-home':
                        this.model.userPref.entry.content.set({
                            'display.page.home.dashboardId': this.model.dashboard.get('id')
                        });
                        this.model.userPref.save({}, {
                            success: function() {
                                window.location.href = route.home(this.model.application.get('root'), this.model.application.get('locale'));
                            }.bind(this)
                        });
                        break;
                    case 'action:edit-permission':
                        this.children.permissionsDialog = new PermissionsDialog({
                            model: {
                                document: this.model.dashboard,
                                nameModel: this.model.dashboard.entry.content,
                                user: this.model.state.user,
                                serverInfo: this.model.serverInfo
                            },
                            collection: this.rolesCollection,
                            nameLabel: "Dashboard",
                            nameKey: 'label',
                            onHiddenRemove: true
                        });
                        $("body").append(this.children.permissionsDialog.render().el);
                        this.children.permissionsDialog.show();
                        break;
                    case 'action:clone':
                        var clone = new DashboardModel();
                        clone.fetch({
                            success: function() {
                                if (this.model.dashboard.entry.content.get('eai:type') === 'html') {
                                    clone.setHTML(this.model.dashboard.entry.content.get('eai:data'));
                                } else {
                                    clone.setXML(this.model.dashboard.entry.content.get('eai:data'));
                                }
                                clone.meta.set(this.model.dashboard.meta.toJSON());

                                var cloneDialog = this.children.cloneDialog = new CloneDialog({
                                    model: {
                                        dashboard: clone,
                                        acl: new ACLReadOnlyModel($.extend(true, {}, this.model.dashboard.entry.acl.toJSON())),
                                        application: this.model.application,
                                        appLocal: this.model.state.appLocal,
                                        state: this.model.state,
                                        user: this.model.state.user,
                                        serverInfo: this.model.serverInfo
                                    },
                                    collection: {
                                        roles: this.rolesCollection
                                    },
                                    onHiddenRemove: true
                                });
                                $("body").append(cloneDialog.render().el);
                                cloneDialog.show();
                            }.bind(this)
                        });
                        break;
                    case 'action:delete':
                        var dialog = new TextDialog({id: "modal-delete-dashboard"});
                        //override DialogBase dialogShown to put focus on the Delete button
                        dialog.dialogShown = function() {
                            this.trigger("show");
                            // Apply focus to the first text input in the dialog. [JCS] Doesn't work without doing a debounce. Not sure why.
                            _.debounce(function() {
                                this.$('.btn-primary:first').focus();
                            }.bind(this), 0)();
                            return;
                        };
                        dialog.settings.set("primaryButtonLabel", _("Delete").t());
                        dialog.settings.set("cancelButtonLabel", _("Cancel").t());
                        dialog.settings.set("titleLabel", _("Delete").t());
                        dialog.setText(splunkUtils.sprintf(_("Are you sure you want to delete %s?").t(),
                            '<em>' + _.escape(this.model.state.get('label') !== "" ? this.model.state.get('label') : this.model.dashboard.entry.get('name')) + '</em>'));
                        dialog.render().appendTo(document.body);

                        dialog.once('click:primaryButton', function() {
                            this.model.dashboard.destroy().done(function() {
                                var cur = utils.getPageInfo();
                                utils.redirect(route.page(cur.root, cur.locale, cur.app, 'dashboards'));
                            });
                        }, this);

                        dialog.on("hidden", function() {
                            dialog.remove();
                        }, this);

                        dialog.show();
                        break;
                    case 'action:print':
                        Printer.printPage();
                        break;
                    case 'mode:edit':
                        var app = this.model.application.toJSON();
                        utils.redirect(route.manager(app.root, app.locale, app.app, ['data', 'ui', 'views', app.page], {
                            data: {
                                action: 'edit',
                                ns: app.app,
                                redirect_override: route.page(app.root, app.locale, app.app, app.page)
                            }
                        }));
                        break;
                }
            });
        }
    });
});
