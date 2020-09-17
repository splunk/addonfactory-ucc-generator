/**
 * @author lbudchenko
 * @date 10/1/2015
 * Page controller for SAML manager page.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageController',
        'collections/services/admin/SAML-groups',
        'collections/services/authorization/Roles',
        'models/services/authentication/providers/SAML',
        'models/shared/EAIFilterFetchData',
        'models/services/admin/SAML-idp-metadata',
        'models/services/admin/SAML-groups',
        'models/services/authentication/providers/services',
        './ConfigEditDialog',
        './GroupEditDialog',
        './GridRow',
        './NewButtons',
        'views/shared/pcss/basemanager.pcss',
        './PageController.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseController,
        SAMLGroupsCollection,
        RolesCollection,
        SAMLModel,
        SAMLFetchData,
        SAMLMetadataModel,
        SAMLGroupModel,
        AuthModuleModel,
        ConfigEditDialog,
        GroupEditDialog,
        GridRow,
        NewButtons,
        cssShared,
        css
    ) {

        return BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                //MODELS
                this.model.controller = new Backbone.Model();
                // Model for editing saml config
                this.model.saml = new SAMLModel();
                // Metadata that can be uploaded or copy-pasted to speed up filling up the config form
                this.model.samlMetadata = new SAMLMetadataModel();
                // Fetch current authentication method
                this.model.authModule = new AuthModuleModel();
                this.deferreds.authModule = this.refreshAuthModule();

                //COLLECTIONS
                this.collection.roles = new RolesCollection();
                this.deferreds.roles = this.collection.roles.fetch({
                    data: {
                        count: '-1'
                    }
                });

                options.header = {
                    pageDesc: _("Map the groups from your SAML server to roles in Splunk Enterprise. <br>").t() +
                    _("Once mapped, SAML groups possess the abilities and permissions of the assigned Splunk roles. <br>").t() +
                    _("Click SAML Configuration to modify your existing SAML setup. Click New Group to add a new SAML group.").t(),
                    learnMoreLink: 'learnmore.launcher.saml'
                };
                options.entitiesPlural = _('SAML Groups').t();
                options.entitySingular = _('SAML Group').t();
                options.grid = {
                    noEntitiesMessage: _('No SAML Groups are defined.').t(),
                    showAppFilter: false,
                    showOwnerFilter: false,
                    showSharingColumn: false
                    };
                options.model = this.model;
                options.collection = this.collection;
                options.deferreds = this.deferreds;  // wait on all deferreds
                options.entitiesCollectionClass = SAMLGroupsCollection;
                options.entityModelClass = SAMLGroupModel;
                options.customViews = {
                    AddEditDialog: GroupEditDialog,
                    NewButtons: NewButtons,
                    GridRow: GridRow
                };

                BaseController.prototype.initialize.call(this, options);
            },

            initEventHandlers: function(options) {
                BaseController.prototype.initEventHandlers.call(this, options);
                this.listenTo(this.model.controller, "configSAML", this.onConfigSAML);
                this.listenTo(this.model.controller, "fetchMetadata", this.onFetchMetadata);
            },

            refreshAuthModule: function() {
                return this.model.authModule.fetch();
            },

            onConfigSAML: function() {
                this.showConfigDialog();
            },

            onSaveDialogHidden: function() {
                this.stopListening(this.children.editDialog, "samlSaved", this.onSAMLSaved);
                this.stopListening(this.children.editDialog, "hidden", this.onSaveDialogHidden);
            },

            onFetchMetadata: function(metadataXml) {
                this.fetchSAMLMetadata(metadataXml).done(function() {
                    this.model.controller.trigger('metadataComplete', this.model.samlMetadata);
                }.bind(this));
            },

            onSAMLSaved: function() {
                this.fetchEntitiesCollection();
                this.refreshAuthModule();
            },

            fetchSAMLMetadata: function(metadataXml) {
                this.model.samlMetadata.id = '';
                return this.model.samlMetadata.fetch({
                    data: {
                        idpMetadataPayload: metadataXml
                    }
                });
            },

            showConfigDialog: function() {
                this.model.saml.clear({silent: true});
                if (this.model.authModule.entry.content.get('active_authmodule') === 'SAML') {
                    this.model.saml.isSAMLMode = true;
                    this.model.saml.set(this.model.saml.idAttribute, '');
                } else {
                    this.model.saml.isSAMLMode = false;
                }
                this.model.saml.fetch().done(function() {
                    var dialogOptions = {};
                    dialogOptions.model = this.model;
                    dialogOptions.collection = this.collection;

                    this.children.editDialog = new ConfigEditDialog(dialogOptions);
                    this.listenTo(this.children.editDialog, "samlSaved", this.onSAMLSaved);
                    this.listenTo(this.children.editDialog, "hidden", this.onSaveDialogHidden);
                    this.children.editDialog.render().appendTo($("body"));
                    this.children.editDialog.show();
                }.bind(this));
            },

            render: function() {
                $.when(this.renderDfd).then(function() {
                    var authMode = this.model.authModule.getAuthMode();

                    if (this.children.masterView) {
                        this.children.masterView.detach();
                        this.children.masterView.render().appendTo(this.$el);

                        if (authMode !== 'SAML') {
                            this.model.controller.trigger("configSAML");
                        }
                    }
                }.bind(this));

                return this;
            }
        });
    });
