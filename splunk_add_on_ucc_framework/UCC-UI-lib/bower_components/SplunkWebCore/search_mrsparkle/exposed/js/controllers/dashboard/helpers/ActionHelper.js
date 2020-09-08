define([
    'jquery',
    'underscore',
    'models/search/Report',
    'views/shared/dialogs/TextDialog',
    'views/dashboard/editor/dialogs/SaveAs',
    'views/dashboards/table/controls/ConvertDashboard',
    'views/dashboards/table/controls/SchedulePDF',
    'views/dashboards/table/controls/CloneDashboard',
    'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
    'models/search/Dashboard',
    'models/ACLReadOnly',
    'helpers/Printer',
    'splunkjs/mvc',
    'splunkjs/mvc/utils',
    'util/infodelivery_utils',
    'splunk.util',
    'uri/route',
    'dashboard/state/DashboardState',
    'dashboard/state/PanelState',
    'dashboard/state/ElementState',
    'dashboard/state/SearchState',
    'dashboard/state/DashboardHeaderState',
    'dashboard/serializer/DashboardSerializer',
    'util/pdf_utils',
    'util/console'
], function($,
            _,
            ReportModel,
            TextDialog,
            SaveAsDialog,
            ConvertDialog,
            SchedulePDFDialog,
            CloneDialog,
            PermissionsDialog,
            DashboardModel,
            ACLReadOnlyModel,
            Printer,
            mvc,
            MvcUtils,
            InfoUtils,
            SplunkUtil,
            Route,
            DashboardState,
            PanelState,
            ElementState,
            SearchState,
            DashboardHeaderState,
            DashboardSerializer,
            PDFUtils,
            console) {

    var sprintf = SplunkUtil.sprintf;

    var ActionHelper = {
        // Handle action is called with the scope bound to the viewmode controller
        handleAction: function(action, state, model, collection, deferreds) {
            switch (action) {
                // actions
                case 'action:print':
                    ActionHelper.print();
                    return true;
                case 'action:export-png':
                    ActionHelper.exportInfoDelivery.call(this, 'png');
                    // should only run if info delivery is installed, will do the same thing as exportPDF
                    return true;
                case 'action:export-pdf':
                    ActionHelper.exportPDF.call(this);
                    return true;
                case 'action:schedule-pdf':
                    // pass in list of sids since it is required for info delivery
                    var sids = ActionHelper._getSids(this.managers);
                    ActionHelper.schedulePDF(model, sids);
                    return true;
                case 'action:edit-permission':
                    ActionHelper.editPermission(model, collection, deferreds);
                    return true;
                case 'action:convert-html':
                    ActionHelper.convertToHtml(model, collection, deferreds);
                    return true;
                case 'action:clone':
                    ActionHelper.clone(model, collection, deferreds);
                    return true;
                case "action:make-home":
                    ActionHelper.setHome(model);
                    return true;
                case 'action:delete':
                    ActionHelper['delete'](model);
                    return true;
            }
        },
        // print related function
        print: function() {
            Printer.printPage();
        },
        exportPDF: function() {
            // Create a flattened DashboardState instance and populate it
            var flattenedState = new DashboardState();
            var layout = this.layouts[0];
            var flattenedLayoutStructure = layout.captureStructure({omitFormInputs: true, omitHidden: true});

            var elementIndex = 0;
            var exportParams = {};

            flattenedState.updateLayout(flattenedLayoutStructure);
            var dashboardState = new DashboardHeaderState(null, null, {stateOptions: {tokens: false}});
            dashboardState.setState(this.components[0]);
            flattenedState.addStateObject(dashboardState);
            _(flattenedLayoutStructure.children).each(function(rowStructure) {
                _(rowStructure.children).each(function(panelStructure) {
                    var panel = mvc.Components.get(panelStructure.id);
                    var panelState = new PanelState(null, null, {stateOptions: {tokens: false}});
                    panelState.id = panelStructure.id;
                    panelState.setState(panel);
                    flattenedState.addStateObject(panelState);

                    _(panelStructure.children).each(function(elementStructure) {
                        var element = mvc.Components.get(elementStructure.id);
                        var elementState = new ElementState(null, null, {stateOptions: {tokens: false}});
                        elementState.id = elementStructure.id;
                        elementState.setState(element);
                        flattenedState.addStateObject(elementState);

                        function addSearchState(managerid, root) {
                            if (managerid) {
                                var searchState = flattenedState.searches.get(managerid);
                                if (!searchState) {
                                    var searchManager = mvc.Components.get(managerid);
                                    if (searchManager) {
                                        searchState = new SearchState(null, null, {stateOptions: {tokens: false}});
                                        searchState.id = managerid;
                                        searchState.setState(searchManager);
                                        flattenedState.addStateObject(searchState);
                                        addSearchState(searchState.getState().base);

                                        if (root) {
                                            exportParams['sid_' + elementIndex] = searchManager.getSid();
                                        }
                                    }
                                }
                                // Flag search state
                                searchState.isReferenced = searchState.isReferenced || !root;
                            }
                        }

                        addSearchState(elementState.getState()['dashboard.element.managerid'], true);
                        elementIndex++;
                    });
                });
            });
            var flattenedXML = DashboardSerializer.applyDashboardState(flattenedState, '<dashboard />', {
                forceDirty: true,
                addGlobalSearches: true
            });
            console.info('GENERATED FLATTENED XML', flattenedXML);
            PDFUtils.downloadReportFromXML(flattenedXML, this.model.application.get('app'), this.model.application.get('page'), exportParams);
        },
        /**
         * Helper method to get object of sids.
         *
         * @param managers, this.managers
         * @returns object containing sids
         * @private
         */
        _getSids: function (managers) {
            var elementIndex = 0;
            var sids = {};
            // sets the keys as sid_0, sid_1, etc ... and the value is the sid itself
            _.each(managers, function (manager) {
                sids['sid_' + elementIndex] = manager.getSid();
                elementIndex++;
            });

            return sids;
        },
        /**
         * Gathers the required fields for sending a request to download a PDF or PNG for Info Delivery.
         * Once information is collected, will perform the request.
         *
         * @param exportFormat, either pdf or png
         * @private
         */
        exportInfoDelivery: function(exportFormat) {
            if(exportFormat) {
                // perform the request
                var sids = ActionHelper._getSids(this.managers);
                InfoUtils.dashboardDownload(this.model.application.get('app'), this.model.application.get('page'), sids, exportFormat);
            }
        },
        schedulePDF: function(model, sids) {
            var dialog = new SchedulePDFDialog({
                model: {
                    scheduledView: model.scheduledView,
                    dashboard: model.view,
                    application: model.application,
                    appLocal: model.state.appLocal,
                    infoDeliveryAvailable: model.infoDeliveryUIControl ? model.infoDeliveryUIControl.infoDeliveryAvailable : false
                },
                sids: sids, // for info delivery features, not required to pass in
                onHiddenRemove: true
            });
            dialog.render().appendTo($('body'));
            dialog.show();
        },
        editPermission: function(model, collection, deferreds) {
            deferreds.roles.then(function() {
                var dialog = new PermissionsDialog({
                    model: {
                        document: model.view,
                        nameModel: model.view.entry.content,
                        user: model.user,
                        serverInfo: model.serverInfo,
                        application: model.application
                    },
                    collection: collection.roles,
                    nameLabel: "Dashboard",
                    nameKey: 'label',
                    onHiddenRemove: true
                });
                dialog.render().appendTo($('body'));
                dialog.show();
            });
        },
        clone: function(model, collection, deferreds) {
            //display clone dialog and handle it to CloneDialog for actual clone
            var clone = new DashboardModel();
            $.when(deferreds.roles, clone.fetch()).done(function() {
                clone.setXML(model.view.entry.content.get('eai:data'));
                clone.meta.set(model.view.meta.toJSON());

                var cloneDialog = new CloneDialog({
                    model: {
                        dashboard: clone,
                        acl: new ACLReadOnlyModel($.extend(true, {}, model.view.entry.acl.toJSON())),
                        application: model.application,
                        appLocal: model.state.appLocal,
                        state: model.state,
                        user: model.user,
                        serverInfo: model.serverInfo
                    },
                    collection: {
                        roles: collection.roles
                    },
                    onHiddenRemove: true
                });
                $("body").append(cloneDialog.render().el);
                cloneDialog.show();
            });
        },
        setHome: function(model) {
            model.userPref.entry.content.set({
                'display.page.home.dashboardId': model.view.get('id')
            });
            model.userPref.save({}, {
                success: function() {
                    window.location.href = Route.home(model.application.get('root'), model.application.get('locale'));
                }
            });
        },
        'delete': function(model) {
            var view = model.view;
            var dialog = new TextDialog({id: "modal-delete-dashboard"});
            var label = view.entry.content.get('label') || view.entry.get('name');
            dialog.settings.set({
                    primaryButtonLabel: _("Delete").t(),
                    cancelButtonLabel: _("Cancel").t(),
                    titleLabel: _("Delete").t()
                }
            );
            dialog.setText(sprintf(_("Are you sure you want to delete %s?").t(),
                '<em>' + _.escape(label) + '</em>'));
            dialog.render().appendTo(document.body);

            dialog.once('click:primaryButton', function() {
                view.destroy().done(function() {
                    MvcUtils.redirect(Route.page(model.application.get('root'), model.application.get('locale'), model.application.get('app'), 'dashboards'));
                    dialog.remove();
                });
            }, this);
            dialog.show();
        },
        convertToHtml: function(model, collection, deferreds) {
            deferreds.roles.then(function() {
                var dashboard = new DashboardModel();
                dashboard.meta.set(model.view.meta.toJSON());

                var convertDialog = new ConvertDialog({
                    model: {
                        dashboard: dashboard,
                        currentDashboard: model.view,
                        application: model.application,
                        user: model.user
                    },
                    collection: {
                        roles: collection.roles
                    },
                    onHiddenRemove: true
                });

                $("body").append(convertDialog.render().el);
                convertDialog.show();
            });
        },
        saveAs: function(xml, model, collection, deferreds) {
            var result = $.Deferred();
            var newDashboard = new DashboardModel();
            $.when(deferreds.roles).done(function() {
                newDashboard.setXML(xml);
                newDashboard.meta.set(model.view.meta.toJSON());
                var saveAsDialog = new SaveAsDialog({
                    model: {
                        dashboard: newDashboard,
                        acl: new ACLReadOnlyModel($.extend(true, {}, model.view.entry.acl.toJSON())),
                        application: model.application,
                        appLocal: model.state.appLocal,
                        state: model.state,
                        user: model.user,
                        serverInfo: model.serverInfo
                    },
                    collection: {
                        roles: collection.roles
                    },
                    onHiddenRemove: true
                });
                $("body").append(saveAsDialog.render().el);
                saveAsDialog.once('success', function() {
                    result.resolve(newDashboard);
                });
                saveAsDialog.show();
            });
            return result.promise();
        }
    };
    return ActionHelper;
});