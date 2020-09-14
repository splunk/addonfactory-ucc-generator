/**
 * @author jszeto
 * @date 6/30/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'collections/Base',
    'collections/knowledgeobjects/Sourcetypes',
    'collections/services/data/vix/Indexes',
    'collections/services/data/vix/Providers',
    'collections/services/data/vix_indexes/DirectoryItems',
    'collections/services/AppLocals',
    'controllers/Base',
    'models/add_data/WizardModel',
    'models/Base',
    'models/classicurl',
    'models/data_explorer/ExplorerState',
    'models/data_explorer/PreparePreview',
    'models/data_explorer/PropsSource',
    'models/services/data/inputs/BaseInputModel',
    'models/services/indexing/Preview',
    'models/services/search/jobs/Result',
    'models/SplunkDBase',
    'routers/Datapreview',
    'views/data_explorer/AdditionalSettings',
    'views/data_explorer/Browse',
    'views/data_explorer/Confirmation',
    'views/data_explorer/Preview',
    'views/data_explorer/ReviewSettings',
    'views/data_explorer/SelectVirtualIndex',
    'views/shared/controls/StepWizardControl',
    'views/shared/FlashMessages',
    'views/shared/ViewStack',
    'util/splunkd_utils'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseCollection,
        SourcetypesCollection,
        IndexesCollection,
        ProviderCollection,
        DirectoryItems,
        AppsCollection,
        BaseController,
        BaseModel,
        WizardModel,
        classicurlModel,
        ExplorerState,
        PreparePreview,
        PropsSource,
        BaseInputModel,
        PreviewModel,
        JobsResultModel,
        SplunkDBaseModel,
        Datapreview,
        AdditionalSettings,
        Browse,
        Confirmation,
        PreviewWrapper,
        ReviewSettings,
        SelectVirtualIndex,
        StepWizardControl,
        FlashMessagesView,
        ViewStack,
        splunkDUtils
        )
        {

            var DataExplorerController =  BaseController.extend(
            {
                moduleId: module.id,
                createDataPreview:true,

                initialize: function(options) {
                    BaseController.prototype.initialize.call(this, options);

                    // Initialize deferreds
                    this.deferreds = {};
                    this.deferreds.previewStep = $.Deferred();
                    this.deferreds.vixCollection = undefined;
                    this.deferreds.appsCollection = undefined;
                    this.deferreds.providerCollection = undefined;

                    // Initialize our models and collections
                    this.initModelsAndCollections();

                    //wait until deferreds resolve before creating the views
                    $.when(this.deferreds.vixCollection, this.deferreds.appsCollection, this.deferreds.providerCollection).then(function() {
                        // WIZARD STEPS
                        this.children.wizardSteps = new StepWizardControl({
                            label:_("Explore Data").t(),
                            model:this.model.explorerState,
                            modelAttribute: "selectedStep",
                            collection: this.collection.wizardStepsCollection});

                        //SELECT VIRTUAL INDEX
                        var selectVixCollection = {vix: this.collection.vixCollection,
                                                   providers: this.collection.providerCollection,
                                                   directoryItems: this.collection.directoryItems};
                        this.children.selectVixFlashMessages = new FlashMessagesView(selectVixCollection);
                        this.children.selectVirtualIndex = new SelectVirtualIndex({
                            model: {state: this.model.explorerState,
                                    application: this.model.application},
                            modelAttribute: {selectedVirtualIndex: "selectedVirtualIndex", selectedProvider: 'selectedProvider'},
                            collection: selectVixCollection,
                            flashMessagesView: this.children.selectVixFlashMessages
                        });

                        // BROWSE
                        this.children.browse = new Browse({
                            collection: {directoryItems: this.collection.directoryItems},
                            model: {application: this.model.application,
                                    state: this.model.explorerState,
                                    metadata: this.collection.directoryItems.fetchData},
                            fileModelAttribute: "selectedSource",
                            directoryModelAttribute: "selectedPath",
                            rootPathModelAttribute: "selectedRootPath",
                            rootPathsModelAttribute: "rootPaths"
                        });
                        this.children.browse.on("pathClicked",this.browsePathClickedHandler, this);

                        // PREVIEW
                        this.children.preview = new PreviewWrapper({model: {preparePreview: this.model.preparePreview,
                                                                            preview: this.model.preview}});

                        // CONTEXT SETTINGS
                       //will sharing be allowed here?
                        this.children.additionalSettings = new AdditionalSettings({
                           model: {application: this.model.application,
                                   state: this.model.explorerState,
                                   acl: this.model.newSource.entry.acl,
                                   user: this.model.user},
                           modelAttribute: {appContext: 'appContext', sharing: 'sharing'},
                           collection: {apps: this.collection.appsCollection }
                        });

                        // REVIEW
                        this.children.reviewSettings = new ReviewSettings({
                            model: {application: this.model.application,
                                    explorerState: this.model.explorerState,
                                    source: this.model.source,
                                    acl: this.model.source.acl},
                            modelAttribute: 'review',
                            collection: {apps: this.collection.appsCollection }

                        });

                        // CONFIRMATION
                        this.children.confirmation = new Confirmation( {
                                model : {explorerState: this.model.explorerState,
                                        source: this.model.source,
                                        application: this.model.application
                                }

                            }

                        );

//                      console.log("CREATE VIEW STACK");
                        this.viewSteps = [
                            this.children.selectVirtualIndex,
                            this.children.browse,
                            this.children.preview,
                            this.children.additionalSettings,
                            this.children.reviewSettings,
                            this.children.confirmation
                        ];

                        // VIEWSTACK
                        this.children.viewStack = new ViewStack({panes:this.viewSteps, selectedIndex:this.model.explorerState.get("selectedStep")});

                        this.debouncedRender();
                    }.bind(this));


                },

                /**
                 * Initialize the models and collections
                 */
                initModelsAndCollections: function() {

                    // STATE
                    this.model.explorerState = new ExplorerState({selectedStep:DataExplorerController.SELECT_VIRTUALINDEX_STEP});
                    this.model.explorerState.on("change:selectedPath", this.onSelectedPathChanged, this);
                    this.model.explorerState.on("change:selectedRootPath", this.onSelectedRootPathChanged, this);
                    this.model.explorerState.on("change:selectedSource", this.onSelectedSourceChanged, this);
                    this.model.explorerState.on("change:selectedSourceType", this.onSelectedSourceTypeChanged, this);
                    this.model.explorerState.on("change:selectedStep", this.onSelectedStepChanged, this);
                    this.model.explorerState.on("change:selectedVirtualIndex", this.onSelectedVirtualIndexChanged, this);
                    this.model.explorerState.on("change:appContext", this.onAppContextChanged, this);
                    this.model.explorerState.on("change:sharing", this.onSharingChanged, this);

                    // WIZARD STEPS
                    var WizardStep = BaseModel.extend({idAttribute:"value"});
                    var wizardSteps = [
                        new WizardStep({value:DataExplorerController.SELECT_VIRTUALINDEX_STEP, label:_("Select Virtual Index").t(),
                                        enabled:true, nextLabel:_("Next").t(), validate:_(this.validateVirtualIndex).bind(this)}),
                        new WizardStep({value:DataExplorerController.SELECT_SOURCE_STEP, label:_("Select a File").t(),
                                        enabled:false, nextLabel:_("Next").t(), validate:_(this.validateBrowse).bind(this)}),
                        new WizardStep({value:DataExplorerController.PREVIEW_STEP, label:_("Preview Data").t(),
                                        enabled:false, nextLabel:_("Next").t(), validate:_(this.validatePreview).bind(this)}),
                        new WizardStep({value:DataExplorerController.INPUT_SETTINGS_STEP, label:_("Enter Context Settings").t(),
                                        enabled:false, nextLabel:_("Next").t()}),
                        new WizardStep({value:DataExplorerController.REVIEW_STEP, label:_("Review").t(),
                                        enabled:false, nextLabel:_("Finish").t(), validate:_(this.validateReview).bind(this)}),
                        new WizardStep({value:DataExplorerController.CONFIRMATION_STEP, label:_("Confirmation").t(),
                                        enabled:true, showNextButton:false, showPreviousButton:false})
                    ];
                    this.collection.wizardStepsCollection = new BaseCollection(wizardSteps);

                    // VIRTUAL INDEXES
                    this.collection.vixCollection = new IndexesCollection();
                    //{silent: true} --> don't perform the side effect fetch in set() here
                    this.collection.vixCollection.fetchData.set({count: -1}, {silent: true});

                    //This fetch() returns a deferred that allows us to initialize selectvirtualindex only after
                    // the deferred is resolved
                    this.deferreds.vixCollection = this.collection.vixCollection.fetch();

                    this.collection.providerCollection = new ProviderCollection();
                        //filtering for only hadoop providers by searching for vix.family=hadoop
                    this.collection.providerCollection.fetchData.set({count: -1, search: 'vix.family=hadoop'},  {silent: true});
                    this.deferreds.providerCollection = this.collection.providerCollection.fetch();

                    // DIRECTORY ITEMS
                    this.collection.directoryItems = new DirectoryItems();
                    this.collection.directoryItems.fetchData.set({count: 30}, {silent:true});
                    this.model.preparePreview = new PreparePreview();
                    this.model.preview = new PreviewModel();

                    // DATA PREVIEW
                    this.model.classicUrl = classicurlModel;
                    this.model.deploymentClass = new Backbone.Model(); // Don't think we need this
                    this.model.indexResultModel = new JobsResultModel(); // Results of search for indexes. Don't need this
                    this.model.input = new BaseInputModel(); // Do we need our own subclass to hold the input attributes?
                    this.model.previewPrimer = new Backbone.Model();
                    this.model.previewPrimer.on("change:sourcetype", this.onPreviewPrimerChanged, this);
                    this.collection.sourcetypesCollection = new SourcetypesCollection();

                    //ADDITIONAL SETTINGS
                    // TODO [JCS] These need to be filtered by the whether the user can write to them or not
                    this.collection.appsCollection = new AppsCollection();
                    this.collection.appsCollection.fetchData.set('count', -1, {silent:true});
                    //only retrieve apps that the user should see. collection is further filtered in additionalSettings
                    //for write permissions specified in each app model in the collection.
                    this.deferreds.appsCollection = this.collection.appsCollection.fetch( {
                        data : {
                            search: 'visible=true AND disabled=0'
                            }
                    });

                    // REVIEW
                    this.model.newSource = new PropsSource();
                    this.model.source = new PropsSource();
                },

                ////////////////////////////////////
                // STEP VALIDATION
                ////////////////////////////////////

                // VALIDATE Select Virtual Index Step
                validateVirtualIndex: function(stepModel, isSteppingNext) {
                    // TODO [JCS] Seems this logic really should live in SelectVirtualIndex
                    var selectedVixName = this.model.explorerState.get("selectedVirtualIndex");
                    var selectedVix = this.collection.vixCollection.get(selectedVixName);

                    // Get the first path for now
                    // TODO [JCS] Do we leave this undefined or default to first one?
                    var directoryPaths = selectedVix.entry.content.get("vix.input.roots");

                    // TODO [JCS] eventually get this from the vix links. For now we need to hardcode
                    this.collection.directoryItems.url = selectedVix.id + "/browse";
                    this.model.explorerState.set({
                        selectedRootPath: directoryPaths[0],
                        selectedPath: directoryPaths[0],
                        selectedVixName: selectedVix.entry.get('name'),
                        selectedSource: undefined,
                        selectedSourceType: undefined,
                        rootPaths: directoryPaths.slice(0)
                    });

                    this.clearBrowseErrors();

                    return;
                },

                // VALIDATE Browse Step
                validateBrowse: function(stepModel, isSteppingNext) {
                    if (isSteppingNext) {
                        if(this.createDataPreview) {

                            if (this.previewRouter) {
                                // The datapreview router will only turn off event listeners if shouldRender = false
                                this.previewRouter.shouldRender = false;
                                this.previewRouter.deactivate();
                                this.previewRouter.detach();
                                delete this.previewRouter;
                                this.children.preview.detachRouter();
                            }
                            var selectedVixName = this.model.explorerState.get("selectedVirtualIndex");
                            var selectedVix = this.collection.vixCollection.get(selectedVixName);

                            this.model.preparePreview.url = selectedVix.id + "/prepare_preview";
                            this.model.preview.clear(); // Clear out the preview model
                            var selectedPath = this.model.explorerState.get("selectedSource");
                            var validateDeferred = $.Deferred();

                            var preparePreviewDeferred = this.model.preparePreview.save({}, {data: {path:selectedPath, output_mode:"json"}});
                            var previewDeferred;

                            preparePreviewDeferred.done(_(function(model) {
                                previewDeferred = this.model.preview.save({}, {
                                    getSourceTypeSettings: false,
                                    data:{"job.id": this.model.preparePreview.get("sid")}});

                                previewDeferred.done(_(function(model) {
    //                                console.log("preview done sid",this.model.preview.get("id"),"name",this.model.explorerState.getSourceFile());
                                    this.model.previewPrimer.set({sid:this.model.preview.get("id"),
                                                                  name:this.model.explorerState.getSourceFile(),
                                                                  sourcetype:undefined,
                                                                  descriptionText: DataExplorerController.PREVIEW_DESCRIPTION
                                    });
                                    this.createPreviewRouter();

                                    this.deferreds.previewStep.done(_(function() {
                                        validateDeferred.resolve();
                                    }).bind(this));
                                }).bind(this));
                            }).bind(this));

    //                        return validateDeferred.promise();
                            this.createDataPreview = false;
                        }
                    }

                    return;
                },

                // Validate the preview step
                validatePreview: function(stepModel, isSteppingNext) {

                    if (isSteppingNext) {
                        // If we have changes to the source type settings, prompt the user to save the changes
                        var unsavedSourcetype = this.model.previewPrimer.get('unsavedSourcetype');
                        var deferredResult = $.Deferred();
                        //console.log("DataExplorerController.validatePreview sourceType",sourceType,"previewSourceType",previewSourceType,"unsavedSourceType",unsavedSourcetype);

                        if (unsavedSourcetype) {
                            // Tell the wizard to not step forward
                            deferredResult.fail();
                            // Trigger the Datapreview router to prompt the user to save. If user accepts, then the router
                            // will call the callback function which advances the wizard to the next step.
                            this.model.previewPrimer.trigger("confirmSavedState", function () {
                                this.children.wizardSteps.step(DataExplorerController.INPUT_SETTINGS_STEP);
                            }.bind(this));
                            return deferredResult;
                        }
                    }

                    return;
                },

                validateReview: function(stepModel, isSteppingNext) {
                    if (isSteppingNext) {
                        var reviewDeferred = $.Deferred();
                        var path = this.model.explorerState.get("selectedSource");
                        var stanzaName = PropsSource.createStanzaFromName(path);
                        this.model.source.entry.content.set("name", stanzaName);

                        var sourceType = this.model.explorerState.get('selectedSourceType');
                        var sharing = this.model.explorerState.get('sharing');
                        var owner = (sharing == splunkDUtils.USER) ? this.model.application.get("owner") : "nobody";
                        var appName = this.model.explorerState.get('appName');

                        this.model.source.save({},{data:{app:appName, owner:owner, sourcetype:sourceType}})
                            .done(_(function() {
//                              console.log("saved props source");
                                if (sharing == splunkDUtils.GLOBAL) {
                                    this.model.newSource.entry.acl.set("sharing", sharing);
                                    var data = this.model.newSource.entry.acl.toDataPayload();
                                    this.model.source.acl.save({}, {data: data}).done(_(function() {
                                        reviewDeferred.resolve();
                                    }).bind(this));
                                } else {
                                    reviewDeferred.resolve();
                                }
                            }).bind(this));

                        return reviewDeferred.promise();
                    }
                    return;
                },


                ////////////////////////////////////
                // CHANGE HANDLERS
                ////////////////////////////////////

                onSelectedStepChanged: function(model, newSelectedStep) {
                    this.children.viewStack.setSelectedIndex(newSelectedStep);
                },

                onSelectedSourceChanged: function(model, newSelectedSource) {
//                    console.log("SelectedSource CHANGED",newSelectedSource,"clear sourcetype");
                    var previewStep = this.collection.wizardStepsCollection.get(DataExplorerController.PREVIEW_STEP);
                    previewStep.set("enabled", !_(newSelectedSource).isUndefined());

                    //Check if we are on review step (index 4 of the viewstack array). If selected source changes at this point, then disable back button
                    if(this.model.explorerState.get('selectedStep') === 4) {
                        var inputSettingsStep = this.collection.wizardStepsCollection.get(DataExplorerController.INPUT_SETTINGS_STEP);
                        inputSettingsStep.set("enabled", false);
                    } else {
                        this.model.explorerState.set({selectedSourceType:undefined});
                    }
                    // Source changed, so remove the Datapreview router and start over again
                    this.createDataPreview = true;

                    // Clear the endpoint model of any errors
                    this.clearPreviewErrors();
                    this.clearSourceErrors();

                    // TODO [JCS] We shouldn't be calling this. Instead, confirmation page should listen for model changes
                    this.children.confirmation.render();
                },

                onSelectedSourceTypeChanged: function(model, newSelectedSourceType) {
//                    console.log("SelectedSourceType changed",newSelectedSourceType)
                    var inputSettingsStep = this.collection.wizardStepsCollection.get(DataExplorerController.INPUT_SETTINGS_STEP);
                    inputSettingsStep.set("enabled", !_(newSelectedSourceType).isUndefined());
                },

                // Get the name of the virtual index when the selected virtual index changes
                onSelectedVirtualIndexChanged: function(model, newSelectedVirtualIndex) {
//                    console.log("SelectedVirtualIndex CHANGED",newSelectedVirtualIndex);
                    if (!_(newSelectedVirtualIndex).isUndefined()) {
                        var selectedVix = this.collection.vixCollection.get(newSelectedVirtualIndex);
                        var selectSourceStep = this.collection.wizardStepsCollection.get(DataExplorerController.SELECT_SOURCE_STEP);
                        var directoryPaths = selectedVix.entry.content.get("vix.input.roots");
                        if (_(directoryPaths).isUndefined() || directoryPaths.length == 0) {
                            this.children.selectVixFlashMessages.flashMsgHelper.addGeneralMessage(
                                DataExplorerController.MISSING_PATHS_ID,
                                {type: splunkDUtils.ERROR,
                                    html:_("The virtual index you have selected does not contain a path.").t()});
                            selectSourceStep.set("enabled", false);
                        } else {
                            this.children.selectVixFlashMessages.flashMsgHelper.removeGeneralMessage(
                                DataExplorerController.MISSING_PATHS_ID);
                            selectSourceStep.set("enabled", true);
                        }

//                        console.log("SelectedVirtualIndex changed. Clear explorerState");
                        this.model.explorerState.set({selectedRootPath: undefined,
                                                      selectedPath: undefined,
                                                      selectedVixName: selectedVix.entry.get('name'),
                                                      selectedSourceType: undefined
                                                     }, {silent:true});
                    }
                    this.clearBrowseErrors();
                    this.clearPreviewErrors();
                    this.clearSourceErrors();
                },

                // Get the name of the app when the appContext changes
                onAppContextChanged: function(model, newAppContext) {
                    var theAppName = "";
                    var appModel = this.collection.appsCollection.get(newAppContext);
                    if (appModel)
                        theAppName = appModel.entry.get('name');
                    this.model.explorerState.set('appName', theAppName);

                    // Fetch a new props source to get the ACL
                    this.model.newSource.fetch({data: {app:theAppName,
                                                        owner:this.model.application.get("owner")}});
                    this.checkInputSettings();
                    // TODO [JCS] Listen for changes to this model in the view, instead of manually rendering
                    this.children.confirmation.debouncedRender();
                    this.clearSourceErrors();
                },

                onSharingChanged: function(model, newSharing) {
                    this.checkInputSettings();
                    this.clearSourceErrors();
                },

                checkInputSettings: function() {
                    var reviewStep = this.collection.wizardStepsCollection.get(DataExplorerController.REVIEW_STEP);
                    var appContext = this.model.explorerState.get("appContext");
                    var sharing = this.model.explorerState.get("sharing");
                    reviewStep.set("enabled", !_(appContext).isUndefined() && !_(sharing).isUndefined());
                },

                createPreviewRouter: function() {
                    this.history = {};
                    this.previewDeferreds = {};
                    this.previewRouter = new Datapreview({
                        el: $('<div></div>'),
                        routes: function(){
                            return;
                        },
                        enableHeader: true,
                        enableAppBar: false,
                        enableFooter: false,
                        model: this.model,
                        collection: this.collection,
                        history: this.history,
                        deferreds: this.previewDeferreds,
                        canChangeSource: false
                    });

                    this.previewRouter.on("rendered", function() {
                        this.deferreds.previewStep.resolve();
                        this.children.preview.appendRouter(this.previewRouter);
                    }, this);

                    this.previewRouter.page(
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        this.model.application.get('page')
                    );
                },

                onSelectedRootPathChanged: function(model, newRootPath) {
                    //console.log("SelectedRootPath CHANGED",newRootPath);
                    this.model.explorerState.set({selectedPath: newRootPath, selectedSource: undefined});
                },

                onSelectedPathChanged: function(model, newSelectedPath) {
                    //console.log("SelectedPath CHANGED",newSelectedPath);
                    this.collection.directoryItems.fetchData.set({path: newSelectedPath, offset: 0});
                },

                onPreviewPrimerChanged: function(model, newSourceType, options) {
//                    console.log("previewPrimer changed sourceType",newSourceType);
                    this.model.explorerState.set("selectedSourceType", newSourceType);
                },

                // Handle when user clicks on breadcrumbs, or a file or directory in the listing table
                browsePathClickedHandler: function(type, fullPath) {
                    if (type == "file") {
                        // If file, then set selectedPath as well
                        this.model.explorerState.set({selectedSource: fullPath});
                    } else {
                        this.model.explorerState.set({selectedPath: fullPath, selectedSource: undefined}); // Clear the source
                    }
                },

                ////////////////////////////////////////////
                // Error Clearing Functions
                ////////////////////////////////////////////

                clearBrowseErrors: function() {
                    this.collection.directoryItems.clearErrors();
                },

                clearPreviewErrors: function() {
                    this.model.preparePreview.clearErrors();
                    this.model.preview.clearErrors();
                },
                clearSourceErrors: function() {
                    this.model.source.clearErrors();
                },

                render: function() {
                    // Detach children
                    if (this.children.wizardSteps) {
                        this.children.wizardSteps.detach();
                    }

                    // Use template
                    this.$el.html(this.compiledTemplate({}));

                    // Attach children and render them
                    if (this.children.viewStack) {
                        this.children.wizardSteps.render().appendTo(this.$(".wizard-steps-placeholder"));
                        this.children.viewStack.render().appendTo(this.$(".viewstack-placeholder"));
                    }

                    return this;
                },

                template: '\
                    <div class="wizard-steps-placeholder"></div>\
                    <div class="viewstack-placeholder"></div>\
                '
            },
            {
                SELECT_VIRTUALINDEX_STEP: 0,
                SELECT_SOURCE_STEP: 1,
                PREVIEW_STEP: 2,
                INPUT_SETTINGS_STEP: 3,
                REVIEW_STEP: 4,
                CONFIRMATION_STEP: 5,
                MISSING_PATHS_ID: "__MISSING_PATHS_ID__",
                PREVIEW_DESCRIPTION: _('This page lets you see how Hunk sees your data when searching. If the events look correct and have the right timestamps, click "Next" to proceed. If not, use the options below to define proper event breaks and timestamps. If you cannot find an appropriate source type for your data, create a new one by clicking "Save As".').t()
            });

        return DataExplorerController;

    });
