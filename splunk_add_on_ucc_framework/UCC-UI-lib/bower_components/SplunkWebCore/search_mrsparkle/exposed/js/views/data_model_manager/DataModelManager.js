/**
 * @author jszeto
 * @date 1/23/13
 *
 * TODO [JCS] Document inputs and events
 */

define(
    [
        'underscore',
        'module',
        'models/services/datamodel/DataModel',
        'views/Base',
        'views/data_model_manager/components/DataModelTable',
        'views/data_model_manager/DataModelActionController',
        'views/shared/CollectionPaginator',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl',
        'views/shared/dataenrichment/preview/components/SelectPageCount',
        'views/shared/CollectionCount',
        'splunk.util',
        'util/splunkd_utils',
        'uri/route',
        'contrib/text!views/data_model_manager/DataModelManager.html',
        './DataModelManager.pcss'
    ],
    function(
        _,
        module,
        DataModel,
        BaseView,
        DataModelTable,
        DataModelActionController,
        CollectionPaginator,
        SyntheticSelectControl,
        TextControl,
        SelectPageCount,
        CollectionCount,        
        splunkUtil,
        splunkDUtils,
        route,
        template,
        css
        )
    {


        return BaseView.extend({

            moduleId: module.id,
            template: template,
            dataModelToEdit: undefined,

            events: {
                ///////////////////////
                //  Object Actions
                ///////////////////////
                'click .new-data-model-button': function(e) {
                    e.preventDefault();
                    this.children.dataModelController.trigger("action:createDataModel");
                },
                'click .upload-data-model-button': function(e) {
                    e.preventDefault();
                    this.children.dataModelController.trigger("action:uploadDataModel");
                }
            },

            /**
             * Called when we get the action:editDataModel event. Redirects us to the Data Model Editor or Table UI
             *
             * @param modelName - id of the model to edit
             */
            editDataModelHandler: function(dataModel) {

                var sharing = dataModel.entry.acl.get("sharing");
                var app = sharing == splunkDUtils.GLOBAL
                    ? this.model.application.get("app") : dataModel.entry.acl.get("app");
                var editUrl;

                // Figure out which editor to use
                if (dataModel.getType() === DataModel.DOCUMENT_TYPES.DATAMODEL) {
                    editUrl = route.data_model_editor(this.model.application.get("root"),
                        this.model.application.get("locale"),
                        app,
                        { data: { model: dataModel.get("id") } });
                } else if (dataModel.getType() === DataModel.DOCUMENT_TYPES.TABLE) {
                    editUrl = route.table(this.model.application.get("root"),
                        this.model.application.get("locale"),
                        app,
                        { data: {t: dataModel.id}});
                }
                window.location = editUrl;
            },

            fetchDataModelHandler: function(modelName) {
                var dataModel = this.collection.dataModels.get(modelName);

                if (dataModel)
                    return dataModel.fetch({data:{concise:true}});
            },

            /**
             * Applies changes directly to a DataModel instead of asking the DM to fetch itself. This allows for updates
             * to the DataModel to be rendered immediately instead of waiting for a fetch.
             *
             * @param modelName
             * @param accelerationChanges
             * @param contentChanges
             */
            updateDataModelHandler: function(modelName, accelerationChanges, contentChanges) {
                var dataModel = this.collection.dataModels.get(modelName);
                if (!dataModel) return;

                if (accelerationChanges) {
                    dataModel.entry.content.acceleration.set(accelerationChanges);
                }
                if (contentChanges) {
                    dataModel.entry.content.set(contentChanges);
                }
            },

            /**
             * Handler for when the app filter control changes. If the value is set to "", which means "All Apps", then
             * we need to disable the "Created in the App" item in the visible filter control and set the metadata
             * visible property to true.
             * @param value
             * @param oldValue
             */
            appFilterChange: function(value, oldValue) {
                this.children.selectVisibleFilter.setItems(this.getVisibleItems(value != ""));

                if (value == "")
                    this.model.metadata.set("visible", "true");
            },

            /**
             * Helper to retrieve the items in the visible filter control.
             *
             * @param enableCreated - if false, then set the "Created in the App" item to disabled
             * @return {Array}
             */
            getVisibleItems: function(enableCreated) {
                return [
                    {label: _("Created in the App").t(), value: "false", enabled: enableCreated},
                    {label: _("Visible in the App").t(), value: "true", enabled: true}
                ];
            },

            /**
             * Helper function for direct access to createDataModelDialog from router
             */
            showCreateDataModelDialog: function(){
                this.children.dataModelController.trigger("action:createDataModel");
            },

            /**
             * @constructor
             * @param options {Object} {
             *     collection: <collections/services/datamodel/DataModels> the collection of data models
             *     model: {
             *         application: <models/shared/Application> the application state model
             *     }
             * }
             */

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.dataModelController = new DataModelActionController({
                    model: {
                        application: this.model.application,
                        user: this.model.user
                    },
                    collection: {
                        apps: this.collection.apps,
                        vix: this.collection.vix,
                        archives: this.collection.archives
                    }
                });
            
                this.children.dataModelController.on("action:clonedDataModel action:dataModelPermissionsChange action:deletedDataModel",
                                                        function() {this.trigger("action:fetchDataModels");}, this);
                this.children.dataModelController.on("action:fetchDataModel", this.fetchDataModelHandler, this);
                this.children.dataModelController.on("action:updateDataModel", this.updateDataModelHandler, this);
                this.children.dataModelController.on("action:createdDataModel", this.editDataModelHandler, this);
                this.children.dataModelController.on("action:uploadedDataModel", this.editDataModelHandler, this);

                this.children.dmList = new DataModelTable({
                    collection: this.collection.dataModels,
                    model: {
                        application: this.model.application,
                        metadata: this.model.metadata,
                        settings: this.model.settings,
                        user: this.model.user
                    }
                });

                // Proxy the table events so the controller can handle them
                this.children.dmList.on("all", function() {
                    var eventType = arguments[0];
                    var modelName = arguments[1];

                    // If we are deleting a DataModel, we pass in the model we are deleting
                    if (eventType == "action:editDataModel") {
                        this.editDataModelHandler(modelName);
                    } else if (eventType == "action:deleteDataModel") {
                        var dataModel = this.collection.dataModels.get(modelName);
                        this.children.dataModelController.trigger("action:deleteDataModel", dataModel);
                    } else {
                        this.children.dataModelController.trigger.apply(this.children.dataModelController, arguments);
                    }
                }, this);

                // App filter
                var staticAppItems = [{label:_('All').t(), value: ''}];
                var dynamicAppItems = this.collection.apps.map(function(model, key, list){
                    return {
                        label: splunkUtil.sprintf(_('%s (%s)').t(), model.entry.content.get('label'), model.entry.get("name")),
                        value: model.entry.get('name')
                    };
                });
                var appItems = [staticAppItems, dynamicAppItems];

                this.children.selectAppFilter = new SyntheticSelectControl({label: _('App').t()+': ',
                                                                      toggleClassName: 'btn-pill',
                                                                      menuWidth: 'wide',
                                                                      model: this.model.metadata,
                                                                      modelAttribute: 'appSearch',
                                                                      items: appItems});

                this.children.selectAppFilter.on("change", this.appFilterChange, this);

                this.children.selectVisibleFilter = new SyntheticSelectControl({toggleClassName: 'btn-pill',
                                                                      menuWidth: 'narrow',
                                                                      model: this.model.metadata,
                                                                      modelAttribute: 'visible',
                                                                      items: this.getVisibleItems(this.model.metadata.get("appSearch") != "")});

                // User filter
                var staticUserItems = [ {label:_('Any').t(), value:'*'},
                                        {label:_('None (nobody)').t(), value: 'nobody'}];
                var dynamicUserItems = this.collection.users.map(function(model, key, list){
                    return {
                        label: splunkUtil.sprintf(_('%s (%s)').t(),
                                                    model.entry.content.get('realname'),
                                                    model.entry.get('name')),
                        value: model.entry.get('name')
                    };
                });
                var userItems = [staticUserItems, dynamicUserItems];

                this.children.selectOwnerFilter = new SyntheticSelectControl({label: _('Owner').t()+': ',
                    toggleClassName: 'btn-pill',
                    menuWidth: 'narrow',
                    model: this.model.metadata,
                    modelAttribute: 'ownerSearch',
                    items: userItems});

                this.children.textNameFilter = new TextControl({model: this.model.metadata,
                                                                modelAttribute: "nameFilter",
                                                                inputClassName: 'search-query',
                                                                placeholder: _("filter").t()});

                this.children.collectionPaginator = new CollectionPaginator({
                    collection: this.collection.dataModels,
                    model: this.model.metadata
                });

                this.children.collectionCount = new CollectionCount({
                    collection:this.collection.dataModels, countLabel:_("Data Models").t()
                });

                this.children.selectPageCount = new SelectPageCount({
                    model:this.model.metadata
               });
            },

            render: function() {

                // Detach so jQuery doesn't remove their event listeners when we reassign the DOM
                this.children.selectAppFilter.detach();
                this.children.selectVisibleFilter.detach();
                this.children.selectOwnerFilter.detach();
                this.children.textNameFilter.detach();
                this.children.collectionPaginator.detach();

                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.datamodel.about'
                );

                var html = this.compiledTemplate({
                	docUrl: docUrl,
                	displayNewDataModel:
                		this.model.settings.get("canCreateDataModel")
                });
                this.$el.html(html);

                this.children.dmList.render().appendTo(this.$(".dm-list-placeholder"));
                this.children.selectAppFilter.render().appendTo(this.$(".select-app-filter-placeholder"));
                this.children.selectVisibleFilter.render().appendTo(this.$(".select-visible-filter-placeholder"));
                this.children.selectOwnerFilter.render().appendTo(this.$(".select-owner-filter-placeholder"));
                this.children.textNameFilter.render().appendTo(this.$(".text-name-filter-placeholder"));
                this.children.collectionPaginator.render().appendTo(this.$(".paginator-container"));
                this.children.collectionCount.render().appendTo(this.$(".collection-count"));
                this.children.selectPageCount.render().appendTo(this.$(".select-page-count"));

                return this;
            }

        });

    });
