/**
 * @author lbudchenko
 * @date 8/20/2015
 * Page controller for HTTP Inputs manager page.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageController',
        'collections/services/data/inputs/HTTP',
        'collections/knowledgeobjects/Sourcetypes',
        'collections/services/data/Indexes',
        'collections/services/data/outputs/tcp/Groups',
        'models/knowledgeobjects/Sourcetype',
        'models/services/data/inputs/HTTP',
        './EditDialog',
        './GridRow',
        './NewButtons',
        './GlobalSettings',
        'uri/route',
        'views/shared/pcss/basemanager.pcss',
        './PageController.pcss'

    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseController,
        InputCollection,
        SourcetypesCollection,
        IndexesCollection,
        OutputsCollection,
        SourcetypeModel,
        InputModel,
        AddEditDialog,
        GridRow,
        NewButtons,
        GlobalSettingsDialog,
        route,
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

                //COLLECTIONS
                this.deferreds.sourcetypesCollection = new $.Deferred();

                this.collection.sourcetypesCollection = new SourcetypesCollection();
                this.deferreds.sourcetypesCollection = this.collection.sourcetypesCollection.fetch({
                    data: {
                        search: 'pulldown_type=1',
                        count: '-1'
                    }
                });
                //this sourcetype collection is used for the category drop down
                this.collection.sourcetypesCategories = new SourcetypesCollection();

                this.collection.sourcetypesCategories.fetchData.set({count: 1000});
                this.deferreds.sourcetypesCategories = this.collection.sourcetypesCategories.fetch({
                    search: 'pulldown_type=1',
                    app: "-",
                    owner: "-"
                });
                this.collection.indexes = new IndexesCollection();

                this.deferreds.indexes = this.collection.indexes.fetch({
                    data: {
                        search: 'isInternal=0 disabled=0 isVirtual=0',
                        count: -1
                    }
                });
                var supportsOutputGroups = this.model.user.supportsOutputGroups();

                this.collection.outputs = new OutputsCollection();
                if (supportsOutputGroups) {
                    this.deferreds.outputs = this.collection.outputs.fetch({
                        data: {
                            search: 'disabled=0',
                            count: -1
                        }
                    });
                } else {
                    this.deferreds.outputs = $.Deferred().resolve();
                }
                this.model.settings = new InputModel();

                this.deferreds.globalSettings = this.fetchGlobalSettings();

                var dataInputHref = route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'datainputstats'
                );

                options.entitiesPlural = _('Tokens').t();
                options.entitySingular = _('Token').t();
                options.header = {
                    pageDesc: '<a href="' + dataInputHref + '">' + _("Data Inputs").t() + '</a> &#187; ' + _("HTTP Event Collector").t(),
                    learnMoreLink: ''
                };
                options.header.pageTitle = _('HTTP Event Collector').t();

                options.model = this.model;
                options.collection = this.collection;
                options.deferreds = this.deferreds;  // wait on all deferreds
                options.entitiesCollectionClass = InputCollection;
                options.entityModelClass = InputModel;

                options.customViews = {
                    AddEditDialog: AddEditDialog,
                    GridRow: GridRow,
                    NewButtons: NewButtons
                };

                options.grid = {
                    showOwnerFilter: false,
                    showSharingColumn: false,
                    showStatusColumn: false
                };

                BaseController.prototype.initialize.call(this, options);

            },

            initEventHandlers: function(options) {
                BaseController.prototype.initEventHandlers.call(this, options);
                this.listenTo(this.model.controller, "globalSettings", this.onGlobalSettings);
                this.listenTo(this.model.controller, "globalSaved", this.onGlobalSaved);
            },

            fetchGlobalSettings: function() {
                if (this.model.settings) {
                    this.model.settings.clear();
                }
                this.model.settings.set('id', 'http');
                return this.model.settings.fetch();
            },

            onGlobalSaved: function() {
                this.fetchEntitiesCollection();
            },

            onGlobalSettings: function() {
                this.fetchGlobalSettings().done(function() {
                    var dialogOptions = {};
                    dialogOptions.isNew = false;
                    dialogOptions.model = this.model;
                    dialogOptions.collection = this.collection;

                    this.children.globalSettingsDialog = new GlobalSettingsDialog(dialogOptions);
                    this.children.globalSettingsDialog.render().appendTo($("body"));
                    this.children.globalSettingsDialog.show();
                }.bind(this));
            },


            onEditEntity: function(model) {
                if (!model) {
                    var url = route.addData(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        'selectsource',
                        {
                            data: {
                                input_type: 'http',
                                input_mode: 1
                            }
                        }
                    );
                    window.document.location.href = url;
                    return;
                } else {
                    this.model.entity = new InputModel();
                    this.model.entity.set('id', encodeURIComponent(model.entry.get("name")));
                    this.model.entity.fetch().done(function() {
                        var dialogOptions = {};
                        dialogOptions.isNew = false;
                        dialogOptions.model = this.model;
                        dialogOptions.collection = this.collection;

                        this.children.editDialog = new AddEditDialog(dialogOptions);
                        this.listenTo(this.children.editDialog, "entitySaved", this.onEntitySaved);
                        this.children.editDialog.render().appendTo($("body"));
                        this.children.editDialog.show();
                    }.bind(this));
                }

            }


        });
    });
