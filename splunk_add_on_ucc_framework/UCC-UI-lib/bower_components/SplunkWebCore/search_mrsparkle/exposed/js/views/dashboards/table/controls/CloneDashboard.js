define([
    'jquery',
    'underscore',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'models/Base',
    'models/search/Dashboard',
    'views/shared/FlashMessages',
    'util/splunkd_utils',
    'views/dashboards/table/controls/CloneSuccess',
    'views/shared/delegates/PairedTextControls',
    'views/shared/controls/TextControl',
    'util/xml'
],

    function (
        $,
        _,
        module,
        Modal,
        ControlGroup,
        BaseModel,
        DashboardModel,
        FlashMessagesView,
        splunkDUtils,
        CloneSuccessView,
        PairedTextControls,
        TextControl,
        XML
    )
{

    return Modal.extend({
        moduleId: module.id,
        initialize: function () {
            Modal.prototype.initialize.apply(this, arguments);

            this.model.perms = new BaseModel({
                'clonePermissions': false
            });

            this.children.flashMessages = new FlashMessagesView({
                model: {
                    dashboard: this.model.dashboard,
                    dashboardMeta: this.model.dashboard.meta
                }
            });

            this.model.dashboard.meta.set({
                label: this.model.dashboard.meta.get('label') + _(' Clone').t()
            });

             this.children.titleTextControl = new TextControl({
                modelAttribute: 'label',
                model: this.model.dashboard.meta,
                placeholder: _('optional').t(),
                save: false
            });

            this.children.filenameTextControl = new TextControl({
                modelAttribute: 'name',
                model: this.model.dashboard.entry.content,
                save: false
            });
            this.children.filenameTextControl.setValue(
                splunkDUtils.nameFromString(this.model.dashboard.meta.get('label'))
            );

            this.pairedTextControls = new PairedTextControls({
                sourceDelegate: this.children.titleTextControl,
                destDelegate: this.children.filenameTextControl,
                transformFunction: splunkDUtils.nameFromString
            });

            this.children.title = new ControlGroup({
                controls: this.children.titleTextControl,
                label: _("Title").t()
            });

            this.children.filename = new ControlGroup({
                controls: this.children.filenameTextControl,
                label: _("ID").t(),
                help: _("Can only contain letters, numbers and underscores.").t(),
                tooltip: _("The ID is used as the filename on disk. Cannot be changed later.").t()
            });

            this.children.description = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.dashboard.meta,
                    placeholder: _("optional").t(),
                    save: false
                },
                label: _("New Description").t()
            });

            this.children.permissions = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlClass: 'controls-halfblock',
                controlOptions: {
                    className: "btn-group btn-group-2",
                    modelAttribute: 'clonePermissions',
                    model: this.model.perms,
                    items: [
                        { label: _("Private").t(), value: false },
                        { label: _("Clone").t(), value: true }
                    ],
                    save: false
                },
                label: _("Permissions").t()
            });

        },
        events: $.extend({}, Modal.prototype.events, {
            'click a.modal-btn-primary': function (e) {
                e.preventDefault();
                this.submit();
            }
        }),
        createSuccess: function() {
            if(this.collection && this.collection.dashboards) {
                this.collection.dashboards.add(this.model.dashboard);
            }

            _.defer(function(){
                var successDialog = new CloneSuccessView({
                    model: {
                        dashboard: this.model.dashboard,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        state: this.model.state, 
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection
                });
                successDialog.render().show();
            }.bind(this));

            this.hide();
            this.remove();
        },
        dashboardContainsExternalAssets: function(xml) {
            return XML.root(xml).is('[script],[stylesheet]');
        },
        updateDashboardAssets: function(type, node, assets, app) {
            var updatedAssets = _.map(assets.split(','), function(asset) {
                if (_.indexOf(asset, ':') > -1) {
                    return asset.trim();
                } else {
                    return app + ':' + asset.trim();
                }
            }).join(',');
            node.attr(type, updatedAssets);
        },
        applyAppContextToDashboardXML: function(dashboard, dashboardAppName) {
            var dashboardSource = dashboard.entry.content.get('eai:data');
            var parsedXML = XML.parse(dashboardSource);
            if (parsedXML && this.dashboardContainsExternalAssets(parsedXML)) {
                var rootNode = XML.root(parsedXML);
                var scripts = rootNode.attr('script');
                var stylesheets = rootNode.attr('stylesheet');
                if (scripts || stylesheets) {
                    if (scripts) {
                        this.updateDashboardAssets('script', rootNode, scripts, dashboardAppName);
                    }
                    if (stylesheets) {
                        this.updateDashboardAssets('stylesheet', rootNode, stylesheets, dashboardAppName);
                    }
                    var updatedDashboardXML = XML.serializeDashboardXML(parsedXML, true);
                    dashboard.entry.content.set('eai:data', updatedDashboardXML, {silent:true});
                }
            }
        },
        submit: function() {
            var dashboard = this.model.dashboard;
            var dashboardAppName = this.model.acl.get('app');
            if (dashboardAppName && dashboardAppName != this.model.application.get('app')) {
                this.applyAppContextToDashboardXML(dashboard, dashboardAppName);
            }
            dashboard.meta.validate();
            if (dashboard.meta.isValid()) {
                if(dashboard.entry.content.get('eai:type') === 'views'){
                    dashboard.meta.apply();
                }
                var clonePermissions = this.model.perms.get('clonePermissions'),
                    data = {app: this.model.application.get('app')};
                data.owner = (clonePermissions && this.model.acl.get('sharing') !== splunkDUtils.USER) ?
                    splunkDUtils.NOBODY : this.model.application.get("owner");
                dashboard.save({}, {
                    data: data,
                    success: function(model, response) {
                        if (clonePermissions) {
                            var data = this.model.acl.toDataPayload();
                            data.owner = this.model.application.get('owner');
                            dashboard.acl.save({}, {
                                data: data,
                                success: function(model, response){
                                    dashboard.fetch().done(function() {
                                        this.createSuccess();
                                    }.bind(this));
                                }.bind(this)
                            });
                        } else {
                            this.createSuccess();
                        }
                    }.bind(this)
                });
            }
        },
        render: function () {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Clone").t());
            this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
            if (!this.model.dashboard.isHTML()) {
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.title.render().el);
            }
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.filename.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.description.render().el);

            var sharing = this.model.acl.get('sharing');
            if ((sharing===splunkDUtils.APP && this.model.dashboard.entry.acl.get("can_share_app")) ||
                (sharing===splunkDUtils.GLOBAL && this.model.dashboard.entry.acl.get("can_share_global"))) {
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.permissions.render().el);
            }

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Clone Dashboard").t() + '</a>');
            return this;
        }
    });

});
