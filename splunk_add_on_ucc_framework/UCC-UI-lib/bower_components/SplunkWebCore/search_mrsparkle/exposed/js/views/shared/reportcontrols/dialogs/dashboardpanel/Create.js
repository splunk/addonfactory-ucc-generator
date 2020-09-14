define(
    [
         'jquery',
         'underscore',
         'module',
         'backbone',
         'models/search/Dashboard',
         'models/services/search/IntentionsParser',
         'collections/shared/Dashboards',
         'views/Base',
         'views/shared/controls/ControlGroup',
         'views/shared/controls/TextControl',
         'views/shared/FlashMessages',
         'views/shared/Modal',
         'views/shared/delegates/PairedTextControls',
         'util/splunkd_utils',
         'splunk.util',
         'helpers/VisualizationRegistry',
         'dashboard/serializer/DashboardSerializer'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        DashboardModel,
        IntentionsParser,
        DashboardsCollection,
        Base,
        ControlGroup,
        TextControl,
        FlashMessage,
        Modal,
        PairedTextControls,
        splunkd_utils,
        splunkUtils,
        VisualizationRegistry,
        DashboardSerializer
    ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                var viz_type = VisualizationRegistry.findVisualizationForConfig(this.model.report.entry.content.toJSON());
                
                this.collection = this.collection || {};
                
                this.intentionsDeferred = $.Deferred();

                if (!this.model.searchJob || this.model.searchJob.isNew()) {
                    this.model.reportSearchIntentionsParser = new IntentionsParser();
                    this.intentionsDeferred = this.model.reportSearchIntentionsParser.fetch({
                        data:{
                            q:this.model.report.entry.content.get('search'),
                            parse_only: true,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        }
                    });
                } else {
                    this.intentionsDeferred.resolve();
                }

                this.collection.safeDashboardsCollection = new DashboardsCollection();
                this.children.flashMessage = new FlashMessage({
                    model: {
                        dashboard: this.model.dashboardToSave
                    }
                });

                this.children.dashCreateType = new ControlGroup({
                    label: _("Dashboard").t(),
                    controlType:'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            {value:"new", label:_("New").t()},
                            {value:"existing", label:_("Existing").t()}
                        ],
                        model: this.model.inmem,
                        modelAttribute: 'dashCreateType'
                    }
                });

                this.children.dashTitleTextControl = new TextControl({
                    model: this.model.inmem,
                    modelAttribute: 'dashTitle',
                    placeholder: _('optional').t()
                });

                this.children.dashNameTextControl = new TextControl({
                    model: this.model.inmem,
                    modelAttribute: 'dashName'
                });

                this.pairedTextControls = new PairedTextControls({
                    sourceDelegate: this.children.dashTitleTextControl,
                    destDelegate: this.children.dashNameTextControl,
                    transformFunction: splunkd_utils.nameFromString
                });

                this.children.dashTitle = new ControlGroup({
                    label: _("Dashboard Title").t(),
                    controlClass: 'controls-block',
                    controls: this.children.dashTitleTextControl
                });

                this.children.dashName = new ControlGroup({
                    label: _("Dashboard ID").t(),
                    controlClass: 'controls-block',
                    controls: this.children.dashNameTextControl,
                    tooltip: _('The ID is used as the filename on disk. Cannot be changed later.').t(),
                    help: _('Can only contain letters, numbers and underscores.').t()
                });

                this.children.dashDesc = new ControlGroup({
                    label: _("Dashboard Description").t(),
                    controlClass: 'controls-block',
                    controlType:'Textarea',
                    controlOptions: {
                        model: this.model.inmem,
                        modelAttribute: 'dashDesc',
                        placeholder: _('optional').t()
                    }
                });

                var isLite = this.model.serverInfo && this.model.serverInfo.isLite();
                var sharedLabel = (this.model.user.canUseApps()) ? _('Shared in App').t() : _('Shared').t();
                this.children.dashPerm = new ControlGroup({
                    label: _("Dashboard Permissions").t(),
                    controlType:'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group btn-group-2 locale-responsive-layout",
                        items: [
                            {value:"private", label:_("Private").t()},
                            {value:"shared", label:sharedLabel}
                        ],
                        model: this.model.inmem,
                        modelAttribute: 'dashPerm'
                    }
                });

                this.existingDashDeferred = this.collection.safeDashboardsCollection.fetchSafe({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        "eai:acl.app": this.model.application.get("app"),
                        // Only fetch SimpleXML views - SPL-88915
                        search: '(rootNode="dashboard" OR rootNode="form")'
                    }
                });

                $.when(this.existingDashDeferred).then(function(){
                    this.children.existingDash = new ControlGroup({
                        label: "",
                        controlType:'SyntheticSelect',
                        controlOptions: {
                            className: 'btn-group view-count',
                            toggleClassName: 'btn',
                            model: this.model.inmem,
                            modelAttribute: 'existingDash',
                            items: this.collection.safeDashboardsCollection.map(function(dashboard){
                                return {
                                    value: dashboard.id,
                                    label: dashboard.getLabel() || dashboard.entry.get('name')
                                };
                            }),
                            popdownOptions: {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        }
                    });
                }.bind(this));

                this.children.panelTitle = new ControlGroup({
                    label: _("Panel Title").t(),
                    controlType:'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.inmem,
                        modelAttribute: 'panelTitle',
                        placeholder: _('optional').t()
                    }
                });

                var poweredByReportTooltip = isLite ? _('Uses the report. Retains all report metadata such as schedule and permissions.').t() : _('Uses the report. Retains all report metadata such as schedule, acceleration and permissions.').t();
                this.children.panelInline = new ControlGroup({
                    label: _("Panel Powered By").t(),
                    controlType:'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group  locale-responsive-layout",
                        items: [
                            {value:true, label: _("Inline Search").t(), icon: 'search', iconSize: '', tooltip: _('Clones the report\'s search string and time range. The inline search exists only in the dashboard and has no external dependencies.').t()},
                            {value:false, label: _("Report").t(), icon: 'report', iconSize: '', tooltip: poweredByReportTooltip }
                        ],
                        model: this.model.inmem,
                        modelAttribute: 'panelInline'
                    }
                });

                this.children.panelInlineOnly = new ControlGroup({
                    label: _("Panel Powered By").t(),
                    controlType:'Label',
                    controlOptions: {
                        defaultValue: _("Inline Search").t(),
                        icon: 'search',
                        tooltip: _("The inline search exists only in the dashboard and has no external dependencies.").t(),
                        // This is to provide a consistent hook for QA automation
                        modelAttribute: 'panelInline'
                    }
                });

                // If for some reason no viz was found to match the report configuration (probably
                // a permissions mismatch between the report and an external viz), create a placeholder
                // viz type so we don't thrown an error.
                if (!viz_type) {
                    viz_type = { label: _('Unknown').t(), icon: '' };
                }
                this.children.panelContent = new ControlGroup({
                    label: _("Panel Content").t(),
                    controlType:'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group locale-responsive-layout",
                        items: [
                            {value:"table", label: _("Statistics").t(), icon: 'table', iconSize: ''},
                            {value:"chart", label: viz_type.label, icon: viz_type.icon, iconSize: '' }
                        ],
                        model: this.model.inmem,
                        modelAttribute: 'panelContent'
                    }
                });

                this.children.panelStatsOnly = new ControlGroup({
                    label: _("Panel Content").t(),
                    controlType:'Label',
                    controlOptions: {
                        defaultValue: _("Statistics Table").t(),
                        icon: 'table',
                        // This is to provide a consistent hook for QA automation
                        modelAttribute: 'panelContent'
                    }
                });

                this.children.panelEventsOnly = new ControlGroup({
                    label: _("Panel Content").t(),
                    controlType:'Label',
                    controlOptions: {
                        defaultValue: _("Events").t(),
                        icon: 'list',
                        // This is to provide a consistent hook for QA automation
                        modelAttribute: 'panelContent'
                    }
                });

                //listeners
                this.listenTo(this.model.inmem, 'change:dashCreateType', function() {
                    var dashType = this.model.inmem.get("dashCreateType");
                    if (dashType === "new"){
                        this.$(".existingDash").hide();
                        this.$(".newDash").show();
                    } else {
                        this.$(".newDash").hide();
                        this.$(".existingDash").show();
                    }
                });

                this.listenTo(this.model.report, 'change:' + this.model.report.idAttribute,
                    this.handlePanelInlineControlVisibility);
            },
            events: {
                "click .modal-btn-primary": function(e) {
                    this.submit();
                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save As Dashboard Panel").t());

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_FORM_SELECTOR).append(this.compiledTemplate({
                    _: _
                }));

                this.children.dashCreateType.render().prependTo(this.$(".dashboard"));

                var $newDash = this.$(".newDash");
                this.children.dashTitle.render().appendTo($newDash);
                this.children.dashName.render().appendTo($newDash);
                this.children.dashDesc.render().appendTo($newDash);

                if (this.model.report.entry.acl.get("can_share_app")) {
                    this.children.dashPerm.render().appendTo($newDash);
                }

                var $dashboardPanel = this.$(".dashboardPanel");
                this.children.panelTitle.render().appendTo($dashboardPanel);
                this.children.panelInlineOnly.render().appendTo($dashboardPanel);
                this.children.panelInline.render().appendTo($dashboardPanel);
                this.handlePanelInlineControlVisibility();

                var showViz = splunkUtils.normalizeBoolean(this.model.report.entry.content.get('display.visualizations.show'));
                var showStats = splunkUtils.normalizeBoolean(this.model.report.entry.content.get('display.statistics.show'));

                //Set panel content to initial values
                if (!(showViz && showStats)) {
                    if (showStats){
                        this.model.inmem.set({panelContent: 'table'});
                    } else {
                        this.model.inmem.set({ panelContent: 'chart' });
                    }
                } else {
                    this.model.inmem.set({ panelContent: 'chart' });
                }

                $.when(this.intentionsDeferred).then(function(){
                    if ((this.model.searchJob && this.model.searchJob.isReportSearch()) || (this.model.reportSearchIntentionsParser && this.model.reportSearchIntentionsParser.isReportsSearch())) {
                        var currentTab = this.model.report.entry.content.get("display.general.type");
                        if (currentTab === "visualizations") {
                            this.model.inmem.set({ panelContent: 'chart' });
                            this.children.panelContent.render().appendTo($dashboardPanel);
                        }
                        else {
                            this.model.inmem.set({ panelContent: 'table' });
                            this.children.panelStatsOnly.render().appendTo($dashboardPanel);
                        }
                    } else {
                        this.children.panelEventsOnly.render().appendTo($dashboardPanel);
                        this.model.inmem.set('panelContent', 'event');
                    }
                }.bind(this));

                $.when(this.existingDashDeferred).then(function(){
                    if (this.collection.safeDashboardsCollection.length){
                        this.children.existingDash.render().replaceContentsOf(this.$(".existingDash"));
                    } else {
                        this.$(".existingDash").html(splunkUtils.sprintf('<div class="alert alert-warning"><i class="icon-alert"></i>' + _("You have no writable dashboards for the app: %s").t()+'</div>', this.model.application.get("app")));
                    }
                }.bind(this));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            },
            focus: function() {
                this.$('input:first').focus();
            },
            handlePanelInlineControlVisibility: function() {
                if (this.model.report.isNew()) {
                    this.children.panelInlineOnly.show();
                    this.children.panelInline.hide();
                } else {
                    this.children.panelInline.show();
                    this.children.panelInlineOnly.hide();
                }
            },
            submit: function() {
                var dashType = this.model.inmem.get("dashCreateType"),
                    existingDash = this.model.inmem.get("existingDash"),
                    dashLabel = this.model.inmem.get("dashTitle"),
                    dashName = this.model.inmem.get("dashName"),
                    dashDesc = this.model.inmem.get("dashDesc"),
                    dashPerm = this.model.inmem.get("dashPerm"),
                    panelTitle = this.model.inmem.get("panelTitle"),
                    panelContent = this.model.inmem.get("panelContent"),
                    panelInline = this.model.inmem.get("panelInline"),
                    data = {},
                    existingDashDeferred = $.Deferred(),
                    panelProperties, existingDashModel;
                
                this.model.dashboardToSave.clear();

                //we need to determine if they are saving from new or existing
                if (dashType === "new"){
                    if (dashLabel) {
                        this.model.dashboardToSave.setLabel(dashLabel);
                    }
                    if (dashDesc) {
                        this.model.dashboardToSave.setDescription(dashDesc);
                    }

                    this.model.dashboardToSave.entry.content.set("name", dashName);
                    data = this.model.application.getPermissions(dashPerm);
                    
                    existingDashDeferred.resolve();
                } else {
                    existingDashModel = this.collection.safeDashboardsCollection.get(existingDash) || this.collection.safeDashboardsCollection.at(0);
                    
                    if (existingDashModel){
                        existingDashModel.fetch({
                            success: function() {
                                this.model.dashboardToSave.entry.content.set(existingDashModel.entry.content.toJSON());
                                this.model.dashboardToSave.set("id", existingDashModel.id);
                                existingDashDeferred.resolve();
                            }.bind(this),
                            error: function() {
                                this.model.dashboardToSave.trigger(
                                    "error",
                                    this.model.dashboardToSave,
                                    splunkd_utils.createSplunkDMessage(
                                        splunkd_utils.ERROR,
                                        _("The dashboard you selected no longer exists.").t()
                                    )
                                );
                                existingDashDeferred.reject();
                            }.bind(this)
                         });
                    } else {
                        this.model.dashboardToSave.trigger(
                            "error",
                            this.model.dashboardToSave,
                            splunkd_utils.createSplunkDMessage(
                                splunkd_utils.ERROR,
                                _("You must select an existing dashboard.").t()
                            )
                        );
                        existingDashDeferred.reject();
                    }
                }

                existingDashDeferred.done(function() {
                    var $XML = this.model.dashboardToSave.get$XML();
                    var reportProperties = this.model.report.entry.content.toJSON({tokens: true});
                    var $newXML = DashboardSerializer.addReportToDashboard(reportProperties, $XML,
                        {
                            searchType: panelInline ? 'inline' : 'saved',
                            searchName: this.model.report.entry.get('name'),
                            panelTitle: panelTitle,
                            vizType: panelContent == 'table' ? panelContent : null,
                            omitHeight: true
                        });
                    this.model.dashboardToSave.set$XML($newXML);
                    this.model.dashboardToSave.save({}, {
                        data: data,
                        success: function(model, response) {
                            this.model.inmem.trigger('createSuccess');
                        }.bind(this)
                    });
                }.bind(this));
            },
            template: '\
                <div class="dashboard">\
                    <div class="newDash">\
                    </div>\
                    <div class="existingDash" style="display:none">\
                        <%- _("waiting for data...").t() %>\
                    </div>\
                </div>\
                <hr/>\
                <div class="dashboardPanel">\
                </div>\
            '
        });
    }
);
