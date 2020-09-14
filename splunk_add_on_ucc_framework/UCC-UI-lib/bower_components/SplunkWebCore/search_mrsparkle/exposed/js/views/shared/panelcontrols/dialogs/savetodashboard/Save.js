/**
 * @author ahebert
 * @date 3/29/15
 *
 * Modal step saving the prebuilt panel to a new or existing dashboard.
 * 
 * Inspired from views/shared/reportcontrols/dialogs/dashboardpanel/Create.js
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'models/search/Dashboard',
        'collections/shared/Dashboards',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/delegates/PairedTextControls',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        DashboardModel,
        DashboardsCollection,
        Base,
        ControlGroup,
        TextControl,
        FlashMessage,
        Modal,
        PairedTextControls,
        splunkd_utils,
        splunkUtils
    ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.collection = this.collection || {};

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
                    label: _("Dashboard title").t(),
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
                    label: _("Dashboard description").t(),
                    controlClass: 'controls-block',
                    controlType:'Textarea',
                    controlOptions: {
                        model: this.model.inmem,
                        modelAttribute: 'dashDesc',
                        placeholder: _('optional').t()
                    }
                });

                var sharedLabel = (this.model.user.canUseApps()) ? _('Shared in App').t() : _('Shared').t();
                this.children.dashPerm = new ControlGroup({
                    label: _("Dashboard permissions").t(),
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
            },
            events: {
                "click .modal-btn-primary": function(e) {
                    this.submit();
                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Add prebuilt panel to dashboard').t());

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_FORM_SELECTOR).append(this.compiledTemplate());

                this.children.dashCreateType.render().prependTo(this.$(".dashboard"));

                var $newDash = this.$(".newDash");
                this.children.dashTitle.render().appendTo($newDash);
                this.children.dashName.render().appendTo($newDash);
                this.children.dashDesc.render().appendTo($newDash);

                if (this.model.panel.entry.acl.get("can_share_app")) {
                    this.children.dashPerm.render().appendTo($newDash);
                }

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
            submit: function() {
                var dashType = this.model.inmem.get("dashCreateType"),
                    existingDash = this.model.inmem.get("existingDash"),
                    dashLabel = this.model.inmem.get("dashTitle"),
                    dashName = this.model.inmem.get("dashName"),
                    dashDesc = this.model.inmem.get("dashDesc"),
                    dashPerm = this.model.inmem.get("dashPerm"),
                    data = {},
                    existingDashDeferred = $.Deferred(),
                    existingDashModel;

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
                    existingDashModel = this.collection.safeDashboardsCollection.get(existingDash) ||
                        this.collection.safeDashboardsCollection.at(0);

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
                    this.model.dashboardToSave.appendPrebuiltPanel(this.model.panel);
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
            '
        });
    }
);
