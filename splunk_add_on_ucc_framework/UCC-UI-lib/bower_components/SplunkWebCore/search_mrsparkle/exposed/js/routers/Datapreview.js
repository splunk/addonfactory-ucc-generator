define(
[
    'jquery',
    'underscore',
    'backbone',
    'routers/BaseSearch',
    'views/datapreview/save/SaveDialog',
    'views/datapreview/Confirm',
    'views/datapreview/save/ConfirmUnsaved',
    'views/datapreview/Master',
    'models/datapreview/Preview',
    'models/knowledgeobjects/Sourcetype',
    'models/services/search/jobs/Result',
    'collections/knowledgeobjects/Sourcetypes',
    'collections/services/AppLocals',
    'util/splunkd_utils',
    'splunk.util'
],
function(
    $,
    _,
    Backbone,
    BaseSearch,
    SaveDialog,
    ConfirmView,
    ConfirmUnsavedView,
    MasterView,
    PreviewModel,
    SourcetypeModel,
    ResultModel,
    SourcetypesCollection,
    AppLocalCollection,
    splunkdUtils,
    splunkUtil
){
    return BaseSearch.extend({
        initialize: function(options) {
            options = this.options = options || {};
            BaseSearch.prototype.initialize.apply(this, arguments);
            if(options.model){
                this.model = $.extend(this.model, options.model);
            }

            if(typeof options.canChangeSource === 'undefined'){
                options.canChangeSource = true;
            }

            this.el = options.el || '.main-section-body';

            this.children = {};

            this.setPageTitle(_('Data Preview').t());
            this.enableAppBar = false;
            this.enableFooter = false;

            this.fetchUser = true;
            this.fetchAppLocals = true;
            //this.fetchAppLocal = false; // TODO: uncomment when this is added in Base router

            // filter to capture all source model related attrs from url
            this.source_prefix = 'source.';
            this.source_regexes = [/^source\./];

            // models
            this.model.preview = new PreviewModel();
            this.model.sourceModel = new Backbone.Model();
            this.model.sourcetypeModel = new SourcetypeModel();
            this.model.metaInfoResults = new ResultModel();
            this.model.timelineResults = new ResultModel();
            this.model.eventSummaryModel = new Backbone.Model();
            this.model.previewPrimer = this.model.previewPrimer || new Backbone.Model();
            // List of used models from superset of models instantiated by parent Base & BaseSearch routers:
            // this.model.appLocal
            // this.model.searchJob
            // this.model.report
            // this.model.classicUrl
            // this.model.result
            // this.model.summary
            // this.model.timeline
            // this.model.user
            // this.model.uiPrefs

            // collections
            //TODO use collections that may have been passed in (such as the case in adddata flow)
            this.collection.sourcetypesCollection = new SourcetypesCollection();
            // List of used collections from superset of collections instantiated by parent Base & BaseSearch routers:
            // this.collection.appLocals
            // this.collection.selectedFields
            // this.collection.workflowActions

            // deferreds
            this.deferreds.sourcetypeModel = $.Deferred();
            this.deferreds.sourcetypesCollection = $.Deferred();
            // List of used deferred from superset of deferred instantiated by parent Base & BaseSearch routers:
            // this.deferreds.appLocals
            // this.deferreds.uiPrefs
            // this.deferreds.user
            // this.deferreds.workflowActions
            // this.deferreds.pageViewRendered

            // views
            this.children.masterView = new MasterView({
                model: this.model,
                collection: this.collection,
                deferreds: this.deferreds,
                enableHeader: options.enableHeader,
                canChangeSource: options.canChangeSource
            });

            this.autoSourcetype = false;

            //this listener needs to be bound asap. we need it regardless of the page being "active". if in activate(), the event will be missed.
            this.model.preview.entry.on('change:name', function(model, value){
                if(!value){return;}
                this.model.previewPrimer.set('sid', value);
            }, this);
        },
        page: function(locale, app, page) {
            BaseSearch.prototype.page.apply(this, arguments);

            this.baseActivateDeferred = $.Deferred();
            this.baseDeactivateDeferred = $.Deferred();

            if (!this.shouldRender) {
                this.deactivate();
            } else {
                this.baseDeactivateDeferred.resolve();
            }

            var appOwner = {
                app: this.model.application.get("app"),
                owner: this.model.application.get("owner")
            };

            // models
            if (this.deferreds.uiPrefs.state() !== 'resolved') {
                this.model.uiPrefs.bootstrap(this.deferreds.uiPrefs, this.model.application.get("page"), this.model.application.get("app"), this.model.application.get("owner"));
            }

            // TODO: consider removing this collection fetch
            if (this.deferreds.workflowActions.state() !== 'resolved') {
                this.collection.workflowActions.fetch({
                    data: $.extend({}, appOwner, {
                        sort_key: "name",
                        search: 'disabled=false',
                        count: -1
                    }),
                    success: function(model, response) {
                        this.deferreds.workflowActions.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.workflowActions.resolve();
                    }.bind(this)
                });
            }

            if (this.deferreds.sourcetypesCollection.state() !== 'resolved') {
                // grab list of sourcetypes to go in dropdown
                this.collection.sourcetypesCollection.fetch({
                    data: {
                        search: 'pulldown_type=1',
                        count: 1000
                    }
                }).done(this.deferreds.sourcetypesCollection.resolve);
            }

            $.when(this.baseDeactivateDeferred).then(function() {
                // data bootstrap
                this.bootstrapDeferred = $.Deferred();
                $.when(this.deferreds.uiPrefs).then(function() {
                    // grab query strings from url
                    this.model.classicUrl.fetch({
                        success: function(model, response) {
                            //remove values that should not be permalinked
                            this.model.classicUrl.set({
                                'display.events.timelineEarliestTime': undefined,
                                'display.events.timelineLatestTime': undefined,
                                'display.prefs.events.offset': undefined,
                                'display.prefs.statistics.offset': undefined,
                                'display.statistics.sortColumn': undefined,
                                'display.statistics.sortDirection': undefined,
                                'display.events.table.sortColumn': undefined,
                                'display.events.table.sortDirection': undefined
                            });

                            //this is where we bootstrap (via previewPrimer model) preview when inside add-data flow
                            var sid = this.model.previewPrimer.get('sid');
                            var file = this.model.previewPrimer.get('name');
                            var sourcetype = this.model.previewPrimer.get('sourcetype');
                            if(sid){
                                this.model.classicUrl.set('sid', sid);
                            }else if(file){
                                this.model.classicUrl.set('source.input', file);
                            }

                            if(sourcetype){
                                this.model.classicUrl.set('sourcetype', sourcetype);
                            }

                            this.syncFromClassicURL();
                        }.bind(this)
                    });
                }.bind(this));

                $.when(
                    this.deferreds.user,
                    this.deferreds.workflowActions,
                    this.deferreds.pageViewRendered,
                    this.bootstrapDeferred
                ).then(function(){
                    this.baseActivateDeferred.resolve();
                }.bind(this));

                $.when(this.deferreds.pageViewRendered).then(function(){
                    if (this.shouldRender) {
                        // insert the top bars
                        //TODO temporary. should be better/cleaner way to do this
                        if(this.options.enableAppBar !== false){
                            $('.preload').replaceWith(this.pageView.el);
                        }
                    }
                }.bind(this));
            }.bind(this));

            $.when(this.baseActivateDeferred).then(function() {
                // clear for takeoff: activate master view

                if (this.model.wizard && this.model.wizard.get('currentStep') !== 'datapreview') {
                    // if we're in GDI and quickly passed the datapreview step, then don't attempt to render further
                    return;
                }

                this.children.masterView.activate({deep: true});
                this.activate.call(this);

                //if (this.shouldRender) { //TODO why is this suddenly required
                    this.children.masterView.render().replaceContentsOf($(this.el));
                    this.$el = this.children.masterView.$el;
                    this.trigger("rendered");
                    //replace with application level event view:append
                    $(document).trigger("rendered");
                //}
            }.bind(this));
        },
        confirmSavedState: function(callback){
            if(this.children.dialogConfrimUnsaved){
                this.children.dialogConfrimUnsaved.detach();
            }

            var noSourcetypeSelected = typeof this.model.previewPrimer.get('sourcetype') === 'undefined';
            if(!this.model.previewPrimer.get('unsavedSourcetype') && !noSourcetypeSelected){
                callback();
                return;
            }

            if(noSourcetypeSelected){
                this.showSaveDialog(function(){
                        callback();
                    }.bind(this));
            }else{

                this.children.dialogConfrimUnsaved = new ConfirmUnsavedView()
                    .on('confirmed', function(confirmed){
                        if(confirmed){
                            this.showSaveDialog(function(){
                                callback();
                            }.bind(this));
                        }else{
                            this.model.previewPrimer.set('unsavedSourcetype', false);
                            callback();
                        }
                    }.bind(this))
                    .render()
                    .$el.appendTo('body');
            }

        },
        showSaveDialog: function(callback){
            if(this.children.dialogSaveSourcetype){
                this.children.dialogSaveSourcetype.detach();
            }

            this.children.dialogSaveSourcetype = new SaveDialog({
                model: this.model,
                collection: this.collection
            })
                .on('savedSourcetype', function(sourcetypeId){
                    this.model.previewPrimer.set('unsavedSourcetype', false);
                    this.collection.sourcetypesCollection.fetch({
                            data: {
                                search: 'pulldown_type=1',
                                count: 1000
                            }
                        }).done(function(){
                            var dfd = this.model.sourcetypeModel.set('id', sourcetypeId).fetch();
                            if(typeof callback === 'function'){
                                this.model.previewPrimer.set('unsavedSourcetype', false);
                                this.model.previewPrimer.set('sourcetype', sourcetypeId);
                                $.when(dfd).then(function() {
                                    //waiting for the listeners to finish render
                                    //so that we can remove the orphaned sourcetype popdown on the next step
                                    callback(true);
                                }.bind(this));
                            }

                            if(this.autoSourcetype){
                                this.collection.sourcetypesCollection.add(this.autoSourcetype);
                            }

                        }.bind(this));

                }.bind(this))
                .render()
                .$el.appendTo('body');
        },
        confirmOverwrite: function(name, callback){
            this.children.dialogSaveSourcetype.hide();

            if(this.children.dialogConfirmOverwrite){
                this.children.dialogConfirmOverwrite.remove();
            }

            this.children.dialogConfirmOverwrite = new ConfirmView({
                keyboard: false,
                backdrop: 'static',
                message: splunkUtil.sprintf(_('Sourcetype named %s already exists. Do you want to overwrite the existing one?').t(), name),
                title: _("Overwrite existing sourcetype?").t()
            })
                .on('hidden', function(){
                    this.children.dialogSaveSourcetype.show();
                }.bind(this))
                .on('confirmed', function(confirmed){
                    if(confirmed){
                        callback(true);
                    }else{
                        callback(false);
                    }
                })
                .render()
                .$el
                .appendTo('body');
        },
        activate: function() {
            // Events for source model
            this.model.sourceModel.on('change', function(model, options) {
                this.populateClassicUrlFromSource();
                this.startNewPreview(null, {
                    ignoreCurrentSourcetype: true,
                    applyDetectedSourcetype: true
                });
            }, this);

            // Events for sourcetype model
            this.model.sourcetypeModel.on('sync', function(model, resp, options) {
                this.model.previewPrimer.set('unsavedSourcetype', false);
                this.populateReportFromSourcetype();
            }, this);

            this.model.sourcetypeModel.on('change', function() {
                this.model.previewPrimer.set('unsavedSourcetype', true);
            }, this);

            // When sourcetype settings change, trigger new preview cycle
            this.model.sourcetypeModel.entry.content.on('change', function(model, options) {
                // skip handler if explicitly requested in passed-in arg or model is still parsing
                if (options && options.skipPreview) { return; }
                if (this.model.sourcetypeModel.isParsing()) { return; }
                // dispatch preview cycle using current props
                this.startNewPreview();
            }, this);

            // When sourcetype is selected, trigger new preview cycle
            this.model.sourcetypeModel.entry.on('change:name', function(model, value, options) {

                //we dont propagate 'default' or __auto__learned__ outside of datapreview
                var checkName = (value||'').toLowerCase();
                if(checkName === 'default' || checkName === '__auto__learned__'){
                    if(this.model.previewPrimer.get('sourcetype')){
                        this.model.previewPrimer.unset('sourcetype');
                    }

                    if(this.model.previewPrimer.get('sourcetypeApp')){
                        this.model.previewPrimer.unset('sourcetypeApp');
                    }
                }else{
                    //update the previewPrimer model
                    this.model.previewPrimer.set({
                        sourcetype: value,
                        sourcetypeApp: this.model.sourcetypeModel.entry.acl.get('app')
                    });
                }

                // skip handler if explicitly requested in passed-in arg or model is still parsing
                if (options && options.skipPreview) { return; }
                if (this.model.sourcetypeModel.isParsing()) { return; }
                // clear & fetch sourcetype model without dispatching new preview
                this.sourcetypeBootstrap(null, value);
                if(value === '__auto__learned__'){ return; }
                // dispatch preview cycle using new sourcetype id - ignores current sourcetype
                this.startNewPreview(null, {
                    applyPassedInSourcetype: true,
                    sourcetypeId: value
                });
            }, this);

            // Events for summary model
            // TODO: Consider listening to result.fields if summary does not get updated with every preview job
            this.model.summary.fields.on('reset', function() {
                this.populateSelectedFieldsFromSummary();
            }, this);

            // Events for result model
            this.model.result.on('forcefetch', function() {
                this.fetchResult();
            }, this);

            // Events for report model
            this.model.report.entry.content.on('change:display.prefs.events.offset change:display.events.maxLines change:display.prefs.events.count change:display.events.timelineEarliestTime change:display.events.timelineLatestTime change:display.general.type change:display.events.table.sortColumn change:display.events.table.sortDirection', _.debounce(function(model, value, options) {
                this.fetchResult();
            }, 0), this);

            // Events for searchJob model
            this.model.searchJob.on("prepared", function() {
                this.pollSearchJob();
            }, this);

            // Events for selectedFields collection
            this.collection.selectedFields.on('add remove reset', this.populateReportFromSelectedFields, this);

            this.model.previewPrimer.on('showSaveDialog', function(e){
                this.showSaveDialog.apply(this, arguments);
            }.bind(this));

            this.model.previewPrimer.on('confirmSavedState', function(){
                this.confirmSavedState.apply(this, arguments);
            }.bind(this));

            this.model.previewPrimer.on('confirmOverwrite', function(){
                this.confirmOverwrite.apply(this, arguments);
            }.bind(this));

        },
        deactivate: function() {
            if (!this.shouldRender) {
                this.model.sourceModel.off(null, null, this);
                this.model.sourcetypeModel.off(null, null, this);
                this.model.sourcetypeModel.entry.content.off(null, null, this);
                this.model.summary.fields.off(null, null, this);
                this.model.result.off(null, null, this);
                this.model.report.entry.content.off(null, null, this);
                this.model.searchJob.off(null, null, this);
                this.collection.selectedFields.off(null, null, this);
                this.model.preview.off(null, null, this);

                this.model.previewPrimer.off('showSaveDialog');
                this.model.previewPrimer.off('confirmSavedState');
                this.model.previewPrimer.off('confirmOverwrite');
            }

            this.children.masterView.deactivate({deep: true});
            BaseSearch.prototype.deactivate.apply(this, arguments);
        },
        detach: function() {
            this.$el.detach();
        },
        render: function() {
            return this.children.masterView.render();
        },

        syncFromClassicURL: function() {
            var sourcetypeIdFromUrl = this.model.classicUrl.get('sourcetype'),
                //TODO we are not filtering classicUrl as expected - catching sourcetype in here
                sourceAttrsFromUrl = this.model.classicUrl.filterByWildcards(this.source_regexes, {strip: this.source_prefix}),
                jobIdFromUrl = this.model.classicUrl.get('sid'),
                attrsFromUIPrefs = this.model.uiPrefs.entry.content.filterByWildcards(this.job_filter),
                sourcetypeFetchDeferred = $.Deferred(),
                reportFetchDeferred = $.Deferred(),
                previewCreateDeferred = $.Deferred(),
                jobFetchDeferred = $.Deferred();

            // set source attrs from url
            if (sourceAttrsFromUrl) {
                this.model.sourceModel.set(sourceAttrsFromUrl);
            }

            // merge attrs from the ui prefs into the report
            if (attrsFromUIPrefs) {
                // TODO: consider adding attrsFromUrl to report
                this.model.report.entry.content.set(attrsFromUIPrefs);
            }

            this.sourcetypeBootstrap(sourcetypeFetchDeferred, sourcetypeIdFromUrl);
            this.reportBootstrap(reportFetchDeferred);
            this.jobBootstrap(jobFetchDeferred, jobIdFromUrl);

            // wait until url-specified sourcetype is fetched - if any
            $.when(sourcetypeFetchDeferred).done(function() {
                // preview using auto-detected sourcetype
                this.startNewPreview(previewCreateDeferred, {
                    applyDetectedSourcetype: sourcetypeIdFromUrl ? false : true,
                    sid: jobIdFromUrl
                });
            }.bind(this));

            // wait until preview created and report model fetched
            $.when(previewCreateDeferred, reportFetchDeferred, jobFetchDeferred).done(function() {
                this.pollSearchJob();
                this.populateReportFromSourcetype();

                //this.populateClassicUrlFromSearchJob(); // TODO: populate url with new sid?
                this.bootstrapDeferred.resolve();
            }.bind(this));
        },
        isFileJson: function(name){
            name = name || '';
            //return true if name ends in ".json" or is just "json"
            var ext = name.substring(name.lastIndexOf('.')+1);
            if(ext.toLowerCase() === 'json'){
                return true;
            }
            return false;
        },
        startNewPreview: function(deferredResponse, options) {
            options || (options = {});
            var previewXhr, sourcetypeId, props = {},
                previewInput = this.model.sourceModel.get('input') || this.model.previewPrimer.get('name'),
                sid = this.model.searchJob.get('id') || this.model.previewPrimer.get('sid'),
                defaults = {
                    ignoreCurrentSourcetype: false,
                    applyDetectedSourcetype: false,
                    applyPassedInSourcetype: false      // when set, overrides ignoreCurrentSourcetype setting
                };

            _.defaults(options, defaults);

            if (!previewInput && !sid) {
                // return & resolve immediately if no preview input found
                deferredResponse && deferredResponse.resolve();
                return;
            }

            // clear preview model with any remnant props
            this.model.preview.clear();

            // when just using passed-in sourcetype id
            if (options.applyPassedInSourcetype) {
                sourcetypeId = options.sourcetypeId;
            // when considering current sourcetype
            } else if (!options.ignoreCurrentSourcetype) {
                // apply current sourcetype explicit props in preview job
                props = this.model.sourcetypeModel.getExplicitProps();
                sourcetypeId = this.model.sourcetypeModel.entry.get('name');
            }

            if (sourcetypeId && sourcetypeId !== '__auto__learned__') {
                // apply sourcetype id in preview job
                props.sourcetype = options.sourcetypeId;
            }

            // set preview model explicit props (if any)
            this.model.preview.setProps(props);

            var sourcetypeOveride;
            if(this.isFileJson(previewInput)){
                sourcetypeOveride = '_json';
            }

            // dispatch indexing preview job
            try {
                previewXhr = this.model.preview.preview(previewInput, sid, sourcetypeOveride);
            } catch(e) {
                this.model.preview.trigger('error', this.model.preview, _(e.message).t());
                deferredResponse && deferredResponse.resolve();
                return;
            }

            $.when(previewXhr)
            .fail(function(){
                // create client error message if no server message
                if (! this.model.preview.error.get('messages')) {
                    this.model.preview.trigger('error', this.model.preview, _("Failed to load preview").t());
                }
                deferredResponse && deferredResponse.resolve();
            }.bind(this))
            .done(function() {
                // return immediately if no preview job created
                if (this.model.preview.isNew()) {
                    this.model.preview.trigger('error', this.model.preview, _("Failed to load preview").t());
                    deferredResponse && deferredResponse.resolve();
                    return;
                }

                // fetch new sourcetype if applying auto-detected sourcetype
                if (options.applyDetectedSourcetype) {
                    var sourcetypeIdNew = '';
                    // set to auto-detected sourcetype if different than current sourcetype,
                    // otherwise, if none detected, default to 'default' sourcetype
                    var preferredSourcetype = this.model.preview.getPreferredSourcetype();

                    if(!preferredSourcetype){
                        //in this case, we dont have a preferred sourcetype.
                        //__auto__learned__ is a special case handled in other functions
                        this.autoSourcetype = new SourcetypeModel({id:'__auto__learned__'});
                        this.autoSourcetype.entry.set('name', '__auto__learned__');

                        var specialStanza = false;
                        //props are the reccommended properties from the preview endpoint
                        var props = this.model.preview.entry.content.attributes.inherited;
                        _.each(props, function(val, key){
                            //'key' is the conf key eg 'SHOULD_LINEMERGE'
                            //'val' is an object eg {value: '1', stanza: 'autolearned_sourcetype'}
                            if(val.stanza !== 'default'){
                                //val.value is from an autolearned sourcetype stanza, so add it to the new sourcetype
                                specialStanza = true;
                                this.autoSourcetype.entry.content.set(key, val.value);
                            }
                        }.bind(this));

                        //if there are no specialStanza's we can use the default sourcetype
                        //else. we have to use the autoSourcetype model to set the working soyrcetype model
                        if(specialStanza === false){
                            sourcetypeIdNew = 'default';
                        }else{
                            //set unsaved flag, which will cause save dialog to ask user to save on "next"
                            this.model.previewPrimer.set('unsavedSourcetype', true);
                            this.collection.sourcetypesCollection.add(this.autoSourcetype);
                            this.model.sourcetypeModel.clear({skipPreview: true});
                            this.model.sourcetypeModel.entry.set('name', '__auto__learned__');
                            this.model.sourcetypeModel.set(this.autoSourcetype.attributes);
                            sourcetypeIdNew = '__auto__learned__';
                        }

                    }else{
                        //ensure we have the designated sourcetype in the collection (in case it does not have pulldowntype=1)
                        this.deferreds.sourcetypesCollection.done(function(){
                            var inCollection = this.collection.sourcetypesCollection.get(preferredSourcetype);
                            if(!inCollection){
                                var sourcetypeModel = new SourcetypeModel({id: preferredSourcetype});
                                sourcetypeModel.fetch().done(function(){
                                    this.collection.sourcetypesCollection.add(sourcetypeModel);
                                }.bind(this));
                            }
                        }.bind(this));
                    }

                    if (preferredSourcetype && preferredSourcetype !== sourcetypeId) {
                        sourcetypeIdNew = preferredSourcetype;
                    }

                    if(sourcetypeIdNew !== '__auto__learned__'){
                        // clear & fetch sourcetype model without dispatching new preview
                        this.sourcetypeBootstrap(null, sourcetypeIdNew);
                    }

                }

                // set search job based on preview job
                var jobIdFromPreview = this.model.preview.entry.get('name') || this.model.preview.id;
                this.model.searchJob.unregisterJobProgressLinksChild(null, this);
                this.model.searchJob.handleJobDestroy();
                this.model.searchJob.clear();
                this.model.searchJob.set("id", jobIdFromPreview);
                this.model.searchJob.startPolling();

                //fetch and compose meta data for events summary
                this.setupEventsSummaryModel.call(this);

                deferredResponse && deferredResponse.resolve();
            }.bind(this));
        },
        setupEventsSummaryModel: function(){
            var metaInfoResultsDfd = new $.Deferred();
            var timelineResultsDfd = new $.Deferred();

            var updateModel = _.debounce(function(){

                $.when(metaInfoResultsDfd, timelineResultsDfd).done(function(){
                    var timelineResults = this.model.timelineResults;
                    var infoResults = this.model.metaInfoResults;
                    var eventCount = infoResults.results.at(0) ? infoResults.results.at(0).get('total')[0] : _('N/A').t();
                    this.model.eventSummaryModel
                        .set({
                            buckets: timelineResults.get('buckets'),
                            lineCountCollection: infoResults.results,
                            eventCount: eventCount,
                            size: parseInt(this.model.searchJob.entry.content.get('dataPreviewBytesInSource') || 0, 10),
                            read: parseInt(this.model.searchJob.entry.content.get('dataPreviewBytesRead') || 0, 10),
                            isCompressed: !!(parseInt(this.model.searchJob.entry.content.get('dataPreviewRequiredDecompress'), 10)),
                            isComplete: !!(parseInt(this.model.searchJob.entry.content.get('dataPreviewReachedEof'), 10))
                        });
                }.bind(this));

            }.bind(this), 500);

            this.model.searchJob.on('jobProgress:results', function(id){
                this.model.metaInfoResults.set('id', id);
                this.model.metaInfoResults.fetch({
                    data: {
                        search: 'chart count by linecount | eventstats sum(count) as total | eval perc = count / total |sort linecount',
                        count: 10000
                    }
                })
                    .done(function(){
                        metaInfoResultsDfd.resolve();
                        updateModel.call(this);
                    }.bind(this));
            }.bind(this));

            this.model.searchJob.on('jobProgress:timeline', function(id){
                this.model.timelineResults.set('id', id);
                this.model.timelineResults.fetch({
                    data: {
                        count: 10000
                    }
                })
                    .done(function(){
                        timelineResultsDfd.resolve();
                        updateModel.call(this);
                    }.bind(this));
            }.bind(this));
        },
        sourcetypeBootstrap: function(deferredResponse, sourcetypeId) {
            if (sourcetypeId) {
                // clear current sourcetype model without dispatching another preview
                if (! this.model.sourcetypeModel.isNew()) {
                    this.model.sourcetypeModel.clear({skipPreview: true});
                }
                if(sourcetypeId === '__auto__learned__'){
                    var xx = this.collection.sourcetypesCollection.get('__auto__learned__');
                    this.model.sourcetypeModel.entry.set('name', '__auto__learned__', {skipPreview: true});
                    this.model.sourcetypeModel.set('id', sourcetypeId, {skipPreview: true});
                    this.model.sourcetypeModel.set(xx.attributes, {skipPreview: true});

                    deferredResponse && deferredResponse.resolve();
                    return;
                }

                // fetch specified sourcetype without dispatching another preview
                this.model.sourcetypeModel.set('id', sourcetypeId);
                this.model.sourcetypeModel.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    },
                    error: function(model, response) {
                        // TODO: remove if sourcetype permalink is not featured
                        // clear it from url if any
                        this.model.classicUrl.save({sourcetype: undefined}, {replaceState: true});
                    }.bind(this)
                }).always(function() {
                    deferredResponse && deferredResponse.resolve();
                });
            } else {
                deferredResponse && deferredResponse.resolve();
            }
        },
        jobBootstrap: function(deferredResponse, jobId) {
            if (jobId) {
                //only fetch the job if we have an id
                this.model.searchJob.set("id", jobId);
                this.model.searchJob.fetch({
                    error: function(model, response) {
                        // clear it from url if any
                        this.model.classicUrl.save({sid: undefined}, {replaceState: true});
                        this.model.searchJob.unset("id");
                        // save this error for when we make the job
                        this.jobBootstrapErrors = [
                             splunkdUtils.createMessageObject(
                                 splunkdUtils.WARNING,
                                 _("The job could not be loaded. A new job has started based on preview parameters.").t()
                             )
                        ];
                    }.bind(this)
                }).always(function() {
                    deferredResponse.resolve();
                });
            } else {
                deferredResponse.resolve();
            }
        },
        reportBootstrap: function(deferredResponse) {
            // fetch default report
            this.model.report.fetch({
                data: {
                    app: this.model.application.get("app"),
                    owner: this.model.application.get("owner")
                },
                success: function(model, response){
                    this.initializeReport();
                }.bind(this)
            }).always(function() {
                deferredResponse.resolve();
            });
        },
        populateClassicUrlFromSource: function() {
            var attrs = {
                'source.type': this.model.sourceModel.get('type'),
                'source.input': this.model.sourceModel.get('input')
            };
            this.model.classicUrl.save(attrs);
        },
        populateClassicUrlFromSourcetype: function() {
            var attrs = {
                'sourcetype': this.model.sourcetypeModel.entry.get('name')
            };
            this.model.classicUrl.save(attrs);
        },
        populateReportFromSourcetype: function() {
            // set tabular format for structured data
            this.model.report.entry.content.set({
                'display.events.type': this.model.sourcetypeModel.isStructuredDataFormat() ? 'table' : 'list'
            });
        },
        populateSelectedFieldsFromSummary: function() {
            var EventModel = ResultModel.Results.Result,
                fields = this.model.summary.fields,
                attrs = _.object(fields.pluck('name'), []),  // create hash of fields from array of field names
                result = new EventModel(attrs),              // dummy Event with all the interesting fields
                models = [];

            // collect non-system/time fields
            _.each(result.notSystemOrTime(), function(field) {
                models.push({name: field});
            }, this);

            this.collection.selectedFields.reset(models);
        },
        initializeReport: function() {
            // set default display type to be numbered list
            // set defaults for pagination and sorting, and disable drilldown
            this.model.report.entry.content.set({
                // numbered list of events
                'display.general.type': 'events',
                'display.events.type': 'list',
                'display.events.rowNumbers': true,
                // default pagination and sorting
                'display.prefs.events.offset': "0",
                'display.prefs.statistics.offset': "0",
                'display.events.table.sortDirection': 'asc',
                'display.statistics.sortDirection': 'asc',
                // turn off drilldown
                'display.events.list.drilldown': 'none',
                'display.events.raw.drilldown': 'none',
                'display.events.table.drilldown': '0',
                'display.statistics.drilldown': 'none',
                'display.visualizations.charting.drilldown': 'none'
            });
        },
        pollSearchJob: function() {
            if (!this.model.searchJob.isNew()) {
                if (!this.model.searchJob.isPreparing()) {
                    this.registerSearchJobFriends({
                        registerResultsJsonCols: false,
                        registerResultJsonRows: false,
                        registerTimeline: false
                    });
                }
            }
        },
        fetchResult: function(options) {
            options = options || {};
            $.extend(true, options, {
                data: {
                    field_list: ''   // fetch all fields for indexing preview
                }
            });
            return BaseSearch.prototype.fetchResult.call(this, options);
        }
    });
});
