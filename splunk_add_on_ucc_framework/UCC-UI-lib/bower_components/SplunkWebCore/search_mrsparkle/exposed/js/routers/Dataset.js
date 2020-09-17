define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'models/Base',
        'models/datasets/PolymorphicDataset',
        'models/datasets/TableAST',
        'models/classicurl',
        'models/shared/fetchdata/ResultsFetchData',
        'models/search/Job',
        'models/services/search/jobs/ResultJsonRows',
        'collections/services/authorization/Roles',
        'views/dataset/Master',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master'
    ],
    function(
        $,
        _,
        BaseRouter,
        BaseModel,
        PolymorphicDatasetModel,
        ASTModel,
        classicUrlModel,
        ResultsFetchDataModel,
        SearchJobModel,
        ResultJsonRowsModel,
        RolesCollection,
        DatasetView,
        PermissionsDialogView
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.fetchAppLocals = true;

                this.urlFilter = [
                    "^dataset\.display\..*"
                ];

                // Models:
                this.model.classicUrl = classicUrlModel;
                this.model.resultJsonRows = new ResultJsonRowsModel();
                this.model.searchJob = new SearchJobModel({}, {delay: SearchJobModel.DEFAULT_POLLING_INTERVAL, processKeepAlive: true, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});
                this.model.state = new BaseModel();
                this.model.ast = new ASTModel();
                // this.model.dataset is created in fetchDataset, not here!

                // Collections:
                this.collection.roles = new RolesCollection();

                // Deferreds:
                this.deferreds.preloadReplaced = $.Deferred();
                this.deferreds.rolesCollection = $.Deferred();

                this.setPageTitle(_('Dataset').t());
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                if (!this.shouldRender) {
                    // Deactivating cleans up the models and attempts to stop in flight requests
                    this.deactivate();
                }

                if (this.deferreds.rolesCollection.state() !== 'resolved') {
                    this.rolesCollectionBootstrap(this.deferreds.rolesCollection);
                }

                // This deferred is resolved after we've fetched everything we need to activate the views
                this.bootstrapDeferred = $.Deferred();
                // This deferred finishes when we successfully fetch the dataset
                this.datasetInstantiatedDeferred = $.Deferred();

                $.when(this.deferreds.userPref).then(function() {
                    this.model.classicUrl.fetch({
                        success: function(model, response) {
                            this.syncFromClassicURL();
                        }.bind(this)
                    });
                }.bind(this));

                // We can't initialize the view before all models are present (even if they haven't been fetched).
                // Because this.model.dataset is a PolymorphicDataset and thus we need to fetch URL attributes
                // before instantiating it, if we were to just wait for pageViewRendered, the dataset may not have
                // been instantiated yet. Therefore, we must wait for the dataset initialization as well.
                $.when(this.deferreds.pageViewRendered, this.datasetInstantiatedDeferred).then(function() {
                    if (this.shouldRender) {
                        this.initializeDatasetView();
                        $('.preload').replaceWith(this.pageView.el);
                        this.deferreds.preloadReplaced.resolve();
                    }
                }.bind(this));

                // Wait for all the relevant deferreds to finish, including our own bootstrapDeferred, before we activate
                $.when(
                    this.deferreds.appLocal,
                    this.deferreds.user,
                    this.deferreds.preloadReplaced,
                    this.deferreds.serverInfo,
                    this.deferreds.rolesCollection,
                    this.bootstrapDeferred
                ).then(function() {
                    this.datasetView.activate({ deep: true, skipRender: true });
                    this.activate();

                    if (this.shouldRender) {
                        this.datasetView.render().replaceContentsOf($('.main-section-body'));
                        $(document).trigger('rendered');

                        // When the user saves a dataset across the product, we can offer them the chance to edit
                        // permissions. If they click that link, they'll arrive at the viewing page (here) with a flag
                        // in the URL to display the permissions dialog. Handling that case here.
                        if (this.model.classicUrl.get('dialog') === 'permissions') {
                            // Now that we're gonna handle it, get rid of it in the URL, so if the user refreshes or
                            // something, they won't get the dialog again.
                            this.model.classicUrl.save({ dialog: undefined }, { replaceState: true });

                            this.permissionsDialog = new PermissionsDialogView({
                                model: {
                                    document: this.model.dataset,
                                    nameModel: this.model.dataset.entry,
                                    user: this.model.user,
                                    serverInfo: this.model.serverInfo,
                                    application: this.model.application
                                },
                                collection: this.collection.roles,
                                onHiddenRemove: true,
                                nameLabel: this.model.dataset.getDatasetDisplayType()
                            });

                            this.permissionsDialog.render().appendTo($('body'));
                            this.permissionsDialog.show();
                        }
                    }
                }.bind(this));
            },

            activate: function() {
                this.model.dataset.entry.content.on('newSample change:dataset.display.diversity change:dataset.display.limiting', function() {
                    // Only produce a new sample if we have a search job already
                    if (this.model.classicUrl.get('sid')) {
                        // Blow away the sid to force a new page route, and save the diversity to the URL
                        this.model.classicUrl.save(
                            {
                                sid: undefined,
                                'dataset.display.diversity': this.model.dataset.entry.content.get('dataset.display.diversity'),
                                'dataset.display.limiting': this.model.dataset.entry.content.get('dataset.display.limiting')
                            },
                            {
                                trigger: true
                            }
                        );
                    }
                }, this);

                // When we save the job, we need to wait until the searchJob is prepared before registering search job
                // friends. In case it took a little while to prepare, this callback will catch that event and fire.
                this.model.searchJob.on('prepared', function() {
                    this.registerSearchJobFriends();
                }, this);
            },

            deactivate: function() {
                // Deactivate the dataset view tree first to make sure there are no side effects to cleaning up the models
                this.datasetView.deactivate({ deep: true });

                if (this.permissionsDialog) {
                    this.permissionsDialog.remove();
                }

                if (!this.shouldRender) {
                    this.model.state.off(null, null, this);
                    this.model.dataset.off(null, null, this);
                    this.model.dataset.entry.content.off(null, null, this);
                }

                this.model.searchJob.off(null, null, this);
                this.model.searchJob.clear();

                this.model.state.clear();

                this.model.dataset.clear({ setDefaults: true });

                this.model.resultJsonRows.fetchAbort();
                this.model.resultJsonRows.clear();
            },

            // Initialize the main dataset view, which will trigger all the initialization for all children.
            // All models are present at this stage.
            initializeDatasetView: function() {
                if (!this.datasetView) {
                    this.datasetView = new DatasetView({
                        model: {
                            application: this.model.application,
                            config: this.model.config,
                            dataset: this.model.dataset,
                            resultJsonRows: this.model.resultJsonRows,
                            searchJob: this.model.searchJob,
                            serverInfo: this.model.serverInfo,
                            state: this.model.state,
                            user: this.model.user,
                            ast: this.model.ast
                        },
                        collection: {
                            apps: this.collection.appLocals,
                            roles: this.collection.roles
                        }
                    });
                }
            },

            // This happens after classicurl and user prefs models have been populated, so we can apply the
            // proper layering and fetch our own models.
            syncFromClassicURL: function() {
                var fetchDatasetDeferred = $.Deferred(),
                    fetchJobDeferred = $.Deferred(),
                    jobCreationDeferred = $.Deferred(),
                    astFetchDeferred = $.Deferred(),
                    searchJobIdFromURL = this.model.classicUrl.get('sid'),
                    attrsFromUrl = this.model.classicUrl.filterByWildcards(this.urlFilter, { allowEmpty: true });

                // Need to fetch the dataset first and foremost
                this.fetchDataset(fetchDatasetDeferred);
                // We can fetch the job at the same time (if it exists in the URL)
                this.fetchJob(fetchJobDeferred, searchJobIdFromURL);

                $.when(fetchDatasetDeferred, fetchJobDeferred).then(function() {
                    this.astBootstrap(astFetchDeferred);

                    $.when(astFetchDeferred).then(function(){
                        // Any attributes from the URL should be layered in
                        this.model.dataset.entry.content.set($.extend(true, {}, attrsFromUrl));

                        // Any attributes on the dataset that need to go in the URL will go here.
                        // URL overrides everything else, so that's why we're doing this after setting on entry.content.
                        this.populateClassicUrlFromDataset();

                        // We need to create a new search, so we'll call startNewSearch
                        if (this.model.searchJob.isNew()) {
                            this.startNewSearch(jobCreationDeferred);
                        // Else, job has already been created and fetched, so we're done here
                        } else {
                            jobCreationDeferred.resolve();
                        }

                        $.when(jobCreationDeferred).then(function() {
                            // If it's done preparing, we can registerSearchJobFriends immediately.
                            // Otherwise, the listener we set up in activate will handle the registration.
                            if (!this.model.searchJob.isPreparing()) {
                                this.registerSearchJobFriends();
                            }
                            
                            if (!this.model.searchJob.isNew()) {
                                // Now that we have a successful job, we can mediate its ID to the URL
                                this.populateClassicUrlFromSearchJob();
                                // Start polling, it's a long way to the bay!
                                this.model.searchJob.startPolling();
                            }
                            
                            // After the job is running properly, we're all done! Trigger to activate the page~
                            this.bootstrapDeferred.resolve();
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            },

            // This instantiates and fetches this.model.dataset by looking at the URL attrs passed as part of the route.
            fetchDataset: function(fetchDatasetDeferred) {

                // Because this happens after classicurl has been fetched, we can grab the attrs we need
                var datasetName = this.model.classicUrl.get('name'),
                    datasetEAIType = this.model.classicUrl.get('eaiType'),
                    datasetEAIApp = this.model.classicUrl.get('eaiApp'),
                    datasetEAIOwner = this.model.classicUrl.get('eaiOwner'),
                    datasetType = this.model.classicUrl.get('datasetType'),
                    datasetLinksAlternate = this.model.classicUrl.get('linksAlternate'),
                    splunkDPayload = {
                        entry: [{
                            acl: {
                                app: datasetEAIApp,
                                owner: datasetEAIOwner
                            },
                            content: {
                                'eai:type': datasetEAIType,
                                'dataset.type': datasetType
                            },
                            links: {
                                alternate: datasetLinksAlternate
                            },
                            name: datasetName
                        }]
                    },
                    fetchSuccess;

                // We'll be fetching this dataset every page route, but we don't want to reinitialize it every time,
                // so prevent that here.
                if (!this.model.dataset) {
                    // If we were to try to create a new PolymorphicDatasetModel without passing in these attributes,
                    // PolymorphicDatasetModel would blow up and yell at us! It wouldn't know how to create the right
                    // model. Therefore, we must call new on it here.
                    // TODO: this will blow up if eai:type is missing or wrong... what should we do in that case?
                    this.model.dataset = new PolymorphicDatasetModel(splunkDPayload, {
                        parse: true
                    });
                // If we already have the dataset, the attributes will have been cleared in deactivate, so we just
                // need to reapply the payload again.
                } else {
                    this.model.dataset.setFromSplunkD(splunkDPayload);
                }

                // Now that it's been instantiated, we can resolve the deferred so the views' initializes can happen.
                this.datasetInstantiatedDeferred.resolve();

                // Define the success handler for when the normal fetch comes back
                fetchSuccess = function() {
                    // We instantiated the model with all the attributes it needs to do this fetch, and the object
                    // definitely exists, so we can now call into the mixin to fetch the dataset from the
                    // consolidated endpoint.
                    $.when(this.model.dataset.fetchAsDataset({
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    })).then(function() {
                        fetchDatasetDeferred.resolve();
                    }.bind(this));
                }.bind(this);

                /*
                 This is a bit strange, but first we're going to fetch the dataset from its true endpoint (not going
                 through the mixin/fetchAsDataset). This is because if we fetchAsDataset with bad data, we'll make a
                 call to the datasets collection endpoint, and that endpoint will return 0 models (instead of 404ing!).
                 As of now, we're using Backbone 1.1.2, so the parse: false option isn't respected, and thus the model
                 (which doesn't exist) will attempt to be parsed, which will blow things up. So first we'll make sure
                 the entity exists from its true endpoint (which will 404 if it doesn't) before fetchingAsDataset.

                 Additionally, this has the side effect of fetching the exact ACL for this dataset, and thus we know
                 if the user can do things like delete. The combined listings endpoint doesn't give us that knowledge.

                 TODO: Data model objects cannot be singularly fetched, you need to fetch the entire data
                 TODO: model and then introspect it. This will mean if the user has a bad URL or something, we won't
                 TODO: be able to tell. Shelving for now. SPL-118294
                 */
                if (datasetLinksAlternate) {
                    this.model.dataset.fetch({
                        // The model exists - we can fetchAsDataset with confidence
                        success: fetchSuccess,

                        error: function() {
                            fetchDatasetDeferred.resolve();
                        }.bind(this)
                    });
                } else {
                    fetchSuccess();
                }
            },

            // Fetch the job from the sid in the URL
            fetchJob: function(fetchJobDeferred, searchJobIdFromUrl) {
                // If the URL contained an sid...
                if (searchJobIdFromUrl) {
                    this.model.searchJob.set('id', searchJobIdFromUrl);

                    // Try to fetch it with that id on the job
                    this.model.searchJob.fetch({
                        success: function(model, response) {
                            // Hooray!
                            fetchJobDeferred.resolve();
                        }.bind(this),

                        // The job no longer exists. Might be malformed, or expired, or just plain wrong.
                        error: function(model, response) {
                            // Get rid of it from the URL
                            this.model.classicUrl.save({ sid: undefined }, { replaceState: true });
                            // Unset it from the model, since it was bad
                            this.model.searchJob.unset('id');

                            fetchJobDeferred.resolve();
                        }.bind(this)
                    });
                // If it didn't, we just resolve
                } else {
                    fetchJobDeferred.resolve();
                }
            },

            // Start a new search for the job
            startNewSearch: function(jobCreationDeferred, options) {
                options = options || {};

                // We're going to run a | from search for each dataset, appending the appropriate diversity component
                var fromSearch = this.model.dataset.getFromSearch(),
                    isTransforming = this.model.ast.isTransforming(),
                    diversity = this.model.dataset.getDiversitySearchComponent({
                        isTransforming: isTransforming
                    }).join(' | '),
                    search = diversity.length ? fromSearch + ' | ' + diversity : fromSearch;

                this.model.searchJob.save({}, {
                    data: {
                        search: search,
                        earliest_time: options.earliest_time || '',
                        latest_time: options.latest_time || '',
                        auto_cancel: SearchJobModel.DEFAULT_AUTO_CANCEL,
                        status_buckets: 300,
                        ui_dispatch_app: this.model.application.get('app'),
                        preview: true,
                        adhoc_search_level: options.adhoc_search_level || 'smart',
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        sample_seed: options.sample_seed || undefined,
                        sample_ratio: options.sample_ratio || this.model.dataset.getDispatchRatio({isTransforming: isTransforming}),
                        indexedRealtime: this.model.dataset.entry.content.get('dispatch.indexedRealtime'),
                        auto_finalize_ec: this.model.dataset.getEventLimit({isTransforming: isTransforming})
                    },
                    
                    success: function(model, response) {
                        jobCreationDeferred.resolve();
                    }.bind(this),
                    
                    error: function(model, response) {
                        jobCreationDeferred.resolve();
                    }.bind(this)
                });
            },

            // Any callbacks that should fire when new search results come in should be registered here
            registerSearchJobFriends: function() {
                // The only thing we care about is the results_preview endpoint. We'll call fetchResultJsonRows as we
                // get progress to populate this.model.resultJsonRows.
                this.model.searchJob.registerJobProgressLinksChild(SearchJobModel.RESULTS_PREVIEW, this.model.resultJsonRows, this.fetchResultJSONRows, this);
            },

            // Populate this.model.resultJsonRows as the job progresses
            fetchResultJSONRows: function(options) {
                options = options || {};

                if (this.model.searchJob.entry.content.get('isPreviewEnabled') || this.model.searchJob.isDone()) {
                    var fetchDataModel = new ResultsFetchDataModel(),
                        columnsList = this.model.dataset.getFlattenedFieldsObj().fields.join(','),
                        data = $.extend(
                            fetchDataModel.toJSON(),
                            {
                                show_metadata: false,
                                include_null_fields: true,
                                field_list: columnsList,
                                time_format: '%s.%Q'
                            }
                        );

                    $.extend(true, data, options);

                    this.model.resultJsonRows.safeFetch({
                        data: data
                    });
                }
            },

            // This mediates the specified attrs of the dataset to the URL
            populateClassicUrlFromDataset: function() {
                var attrs = {
                    'dataset.display.diversity': this.model.dataset.entry.content.get('dataset.display.diversity'),
                    'dataset.display.limiting': this.model.dataset.entry.content.get('dataset.display.limiting')
                };

                this.model.classicUrl.save(attrs, {
                    replaceState: true
                });
            },

            // This mediates the sid of the searchJob to the URL
            populateClassicUrlFromSearchJob: function() {
                var attrs = {
                    sid: this.model.searchJob.entry.content.get('sid')
                };

                this.model.classicUrl.save(attrs, {
                    replaceState: true
                });
            },

            // Fetches the roles collection, which is necessary for editing permissions on the dataset
            rolesCollectionBootstrap: function(rolesCollectionDeferred) {
                this.collection.roles.fetch({
                    data: {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        count: -1
                    },

                    success: function(model, response) {
                        rolesCollectionDeferred.resolve();
                    }.bind(this),

                    error: function(model, response) {
                        rolesCollectionDeferred.resolve();
                    }.bind(this)
                });
            },

            // Fetch the AST for the current command
            astBootstrap: function(astFetchDeferred) {
                var search = this.model.dataset.getFromSearch();

                this.model.ast.set({
                    spl: search,
                    ast: undefined
                });

                this.model.ast.fetch({
                    data: {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    },
                    success: function(model, response) {
                        astFetchDeferred.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        astFetchDeferred.resolve();
                    }.bind(this)
                });
            }
        });
    }
);