define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/Base',
        'splunk.logger',

        /* Views */
        'views/error/Master',
        'views/add_data/Header',
        'views/add_data/Initial',
        'views/add_data/ForwardersSelect',
        'views/add_data/DataSource',
        'routers/Datapreview',
        'views/add_data/InputSettings',
        'views/add_data/Review',
        'views/add_data/SuccessScreen',

        /* Collections */
        'collections/services/AppLocals',
        'collections/knowledgeobjects/Sourcetypes',
        'collections/services/data/Indexes',
        'collections/services/data/Inputs',
        'collections/services/data/ModularInputs',

        /* Models */
        'models/add_data/WizardModel',
        'models/services/saved/Sourcetype',
        'models/services/deploymentserver/DeploymentServerClassGDI',
        'models/services/deploymentserver/DeploymentApplication',
        'models/services/deploymentserver/datainputs/RemoteMonitor',
        'models/services/deploymentserver/datainputs/RemoteScript',
        'models/services/deploymentserver/datainputs/RemoteTCP',
        'models/services/deploymentserver/datainputs/RemoteUDP',
        'models/services/deploymentserver/datainputs/RemoteWinEventLogs',
        'models/services/deploymentserver/datainputs/RemoteWinPerfmon',
        'models/services/search/jobs/Result',
        'models/services/data/inputs/Upload',
        'models/services/data/inputs/Monitor',
        'models/services/data/inputs/Oneshot',
        'models/services/data/inputs/tcp/Raw',
        'models/services/data/inputs/UDP',
        'models/services/data/inputs/HTTP',
        'models/services/data/inputs/Script',
        'models/services/data/inputs/WinEventLogs',
        'models/services/data/inputs/WinPerfmon',
        'models/services/data/inputs/WinPerfmonWMI',
        'models/services/data/inputs/WinRegmon',
        'models/services/data/inputs/WinADmon',
        'models/services/data/inputs/WinHostmon',
        'models/services/data/inputs/WinNetmon',
        'models/services/data/inputs/WinPrintmon',
        'models/classicurl',
        'uri/route',

        /* Constants */
        'constants/CloudRules',
        'constants/GDI'
    ],
    function(
        $,
        _,
        Backbone,
        BaseRouter,
        sLogger,

        /* Views */
        ErrorView,
        HeaderView,
        InitialView,
        ForwarderSelectView,
        DataSourceView,
        DataPreviewRouter,
        InputSettingsView,
        ReviewView,
        SuccessScreenView,

        /* Collections */
        AppLocalsCollection,
        SourcetypesCollection,
        IndexesCollection,
        InputsCollection,
        ModularInputsCollection,

        /* Models */
        WizardModel,
        SourcetypeModel,
        DeploymentServerClass,
        DeploymentApplicationModel,
        RemoteMonitorModel,
        RemoteScriptModel,
        RemoteTCPModel,
        RemoteUDPModel,
        RemoteWinEventLogsModel,
        RemoteWinPerfmonModel,
        ResultModel,
        UploadModel,
        FileMonitorModel,
        OneshotModel,
        TCPModel,
        UDPModel,
        HTTPModel,
        ScriptModel,
        WinEventLogsModel,
        WinPerfmonModel,
        WinPerfmonWMIModel,
        WinRegmonModel,
        WinADmonModel,
        WinHostmonModel,
        WinNetmonModel,
        WinPrintmonModel,
        classicurlModel,
        route,
        CloudRules,
        GDI
    ){
        return BaseRouter.extend({
            routes: {
                ':locale/manager/:app/:page(/)': '_route',
                ':locale/manager/:app/:page/:wizardstep(/)': '_route',
                '*root/:locale/manager/:app/:page(/)': '_routeRooted',
                '*root/:locale/manager/:app/:page/:wizardstep(/)': '_routeRooted'
            },
            initialize: function() {
                var that = this;
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.fetchUser = true;
                this.fetchAppLocals = true;
                this.enableAppBar = false;
                this.enableFooter = false;
                this.pageRenderedDfd = new $.Deferred();

                this.collection.appLocals = new AppLocalsCollection();
                this.deferreds.sourcetypesCollection = new $.Deferred();
                this.collection.sourcetypesCollection = new SourcetypesCollection();
                this.collection.indexes = new IndexesCollection();

                this.deferreds.inputs = new $.Deferred();
                this.collection.inputs = new InputsCollection();

                this.collection.inputs.fetch().done(function(){
                    that.deferreds.inputs.resolve();
                });

                this.deferreds.modularInputs = new $.Deferred();
                this.collection.modularInputs = new ModularInputsCollection();

                this.collection.modularInputs.fetch().done(function(){
                    that.deferreds.modularInputs.resolve();
                });


                this.model = $.extend(this.model, {
                    application: this.model.application,
                    wizard: new WizardModel(),
                    input: new Backbone.Model(),
                    classicUrl: classicurlModel,
                    serverInfo: this.model.serverInfo,
                    indexResultModel: new ResultModel(),
                    inputModels: {},
                    deploymentClass: new DeploymentServerClass(),
                    previewPrimer: new Backbone.Model(),
                    sourcetype: new SourcetypeModel()
                });

                this.headerView = new HeaderView({
                    model: this.model,
                    collection: this.collection
                });

                /*
                Event handlers
                 */
                this.model.wizard.on('change:currentStep', function (model, nextStep) {
                    // redirects to a new url when current step changes
                    if (_.isUndefined(model.previousAttributes().inputMode)) {
                        // don't do this extra navigate call (and lose the url attrs) if
                        // we came here by a permalink (inputMode is not defined yet)
                        return;
                    }

                    var nextUrl = route.manager(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            this.model.application.get('page'));
                    nextUrl = nextUrl + '/' + nextStep;
                    this.navigate(nextUrl, {trigger: true, replace: false});

                }, this);

                this.model.wizard.on('change:inputType', function() {
                    // When inputType is changed, we switch the active model and fetch it.
                    // When fetch is done, the DataSource view switches to an appropriate input view bound to that new active model
                    if (!this.model.wizard.get('inputType')) {
                        return;
                    }
                    var isModularInput = this.model.wizard.get('isModularInput');
                    if (isModularInput) {
                        this.model.input = new Backbone.Model();
                        this.model.wizard.trigger('inputModelFetched');
                        if ($('#wizard-placeholder').is(':hidden')) {
                            this.headerView.$('#wizard-placeholder').show();
                            this.headerView.$('#wizardAlert').hide();
                        }
                    } else {
                        var inputModel = this.fetchInputModel();
                        if (inputModel) {
                            inputModel.done(function() {
                                this.model.wizard.trigger('inputModelFetched');
                                if (this.headerView.$('#wizardAlert').length) {
                                    this.headerView.$('#wizard-placeholder').hide();
                                    this.headerView.$('#wizardAlert').show();
                                }
                            }.bind(this));
                        }
                    }

                }, this);

                this.model.wizard.on('submit', function() {
                    // Saving active input model when Review step is complete
                    var that = this,
                        inputMode = this.model.wizard.get('inputMode'),
                        serverClassName = this.model.wizard.get('serverClassName');

                    if (inputMode === GDI.INPUT_MODE.UPLOAD) {
                        this.uploadSaveFile();
                        return;
                    }
                    if (inputMode === GDI.INPUT_MODE.FORWARD) {
                        // add app name
                        this.model.input.entry.content.set('app_name', '_server_app_' + serverClassName);
                        this.model.input.entry.content.unset('host');
                        this.model.input.unset('ui.host');
                    }

                    if (this.model.input.get('ui.index') === '') {
                        // Don't post index field if empty value representing default is selected
                        this.model.input.entry.content.unset('index');
                        this.model.input.unset('ui.index');
                    }

                    var postArgs = {};
                    if (!this.model.wizard.isWindowsInput()) {
                        postArgs['app'] = this.model.input.get('appContext');
                        postArgs['owner'] = this.model.application.get("owner");
                    }


                    this.model.input.transposeToRest();
                    this.model.input.save({}, {
                            data: postArgs,
                            validate: false,
                            success: function() {
                                if (inputMode === GDI.INPUT_MODE.FORWARD) {
                                    // add app<->serverclass mapping
                                    var deploymentApplicationModel = new DeploymentApplicationModel();
                                    deploymentApplicationModel.set({
                                        id: deploymentApplicationModel.url + '/_server_app_' + serverClassName
                                    });
                                    deploymentApplicationModel.entry.content.set({
                                        serverclass: serverClassName
                                    });
                                    deploymentApplicationModel.save({}, {
                                        success: function() {
                                            that.model.wizard.stepForward(true);
                                        }
                                    });
                                } else {
                                    that.model.wizard.stepForward(true);
                                }
                            }
                        }
                    );
                }, this);

                this.model.wizard.on('saveSourcetype', function() {
                    this.saveSourcetype();
                }, this);

                this.model.wizard.on('refreshIndex', function() {
                    this.refreshIndexes();
                }, this);

                this.deferreds.indexes = this.refreshIndexes();
            },

            showErrorPage: function(){
                var errorController = new ErrorView({
                    model: {
                        application: this.model.application,
                        error: new Backbone.Model({
                            status: _("404 Not Found").t(),
                            message: _("Page not found!").t()
                        })
                    }
                });
                this.deferreds.pageViewRendered.done(function() {
                    this.pageView.$('.main-section-body').append(errorController.render().el);
                    this.logger = sLogger.getLogger('AddData.js');
                    this.logger.error("You do not have permission to view this page.");
                }.bind(this));
            },

            /*
             THE ENTRY POINT
             */
            _route: function(locale, app, page, step){
                var args = arguments,
                    self = this,
                    hasTour = (step) ? step.indexOf('tour=') > -1 : null;

                if (hasTour) {
                    step = '';
                }

                var inputMode = this.model.wizard.get('inputMode');
                if (_.isUndefined(inputMode) && step &&
                    step !== 'selectsource' &&
                    step !== 'selectforwarders') {
                    // any request to pages other than root and permalinkable ones will redirect to root
                    // undefined inputMode is used here as an indicator that we're coming from outside the workflow
                    var pathname = window.location.pathname,
                        nextUrl =  pathname.substring(0,pathname.lastIndexOf("/"));
                    this.navigate(nextUrl, {trigger: true, replace: true});
                    return;
                }
                step = step || 'initial';
                step = step.toLowerCase();

                this.pageRenderedDfd.done(function(){
                    if (typeof self._routes[step] === 'function'){
                        self._routes[step].apply(self, args);
                    }
                });

                //only call page route once.
                if (!this.isPageCalled) {
                    this.isPageCalled = true;
                    this._routes.page.apply(this, arguments);
                }
            },
            _routeRooted: function(root, locale, app, page, step) {
                this.model.application.set({
                    root: root
                }, {silent: true});
                this._route(locale, app, page, step);
            },
            _routes: {
                page: function(locale, app, page) {
                    BaseRouter.prototype.page.apply(this, arguments);
                    var that = this;

                    this.deferreds.pageViewRendered.done(function() {
                        $('.preload').replaceWith(that.pageView.el);
                    });

                    this.collection.sourcetypesCollection.fetch({
                        data: {
                            search: 'pulldown_type=1',
                            count: 1000
                        }
                    }).done(function(){
                         this.deferreds.sourcetypesCollection.resolve();
                    }.bind(this));

                    $.when(this.pageReadydfd, this.deferreds.pageViewRendered, this.deferreds.indexes).done(function() {
                        // Rendering a static Header view and a simple placeholder for views that we switch
                        that.pageView.$('.main-section-body').append(that.headerView.render().el);
                        that.pageView.$('.main-section-body').append('<div class="layoutBodyColumns layoutRow addDataBody"></div>');

                        that.pageRenderedDfd.resolve();
                    });

                    return this.pageRenderedDfd;
                },
                initial: function(locale, app, page){
                    var view = new InitialView({
                        model: this.model,
                        collection: {
                            modularInputs: this.collection.modularInputs
                        }
                    });
                    $('.addDataBody').html(view.render().el);

                    //reset current state's flags
                    this.model.wizard.resetFlags();

                    this.model.input.unset('ui.name');
                    this.model.input.unset('file');
                    this.model.input.unset('ui.sourcetype');
                    this.setPageTitle(_('Add Data').t());
                },
                selectforwarders: function(locale, app, page){
                    if (this.model.user.canForwardData()){
                        var view = new ForwarderSelectView({
                            model: this.model,
                            collection: this.collection
                        });
                        $('.addDataBody').html(view.render().el);

                        var defaults = {
                            viewBy: 'hosts',
                            inputMode: 2,
                            isModularInput: false
                        };
                        classicurlModel.fetch().done(function() {
                            var urlAttrs = {
                                inputType: classicurlModel.get('input_type')
                            };
                            _.defaults(urlAttrs, defaults);

                            var tempAttrs = $.extend({}, this.model.wizard.attributes);
                            _.defaults(tempAttrs, urlAttrs);
                            tempAttrs.currentStep = 'selectforwarders';

                            this.model.wizard.set(tempAttrs);
                        }.bind(this));
                        if(this.headerView.$('#wizardAlert').length){
                            this.headerView.$('#wizard-placeholder').hide();
                            this.headerView.$('#wizardAlert').show();
                        }
                        this.setPageTitle(_('Add Data - Select Forwarders').t());
                    }
                    else {
                        this.showErrorPage();
                    }
                },
                selectsource: function(locale, app, page){
                    var view = new DataSourceView({
                        model: this.model,
                        collection: this.collection,
                        deferreds: this.deferreds
                    });

                    var defaults = {
                        inputMode: GDI.INPUT_MODE.MONITOR,
                        isModularInput: false
                    };

                    classicurlModel.fetch().done(function() {
                        // Data Sources (in precedence order)
                        // 1. Wizard Model
                        //   - If navigation started from within the GDI workflow,
                        //     the wizard model is already correctly set.
                        //     Otherwise it's attributes are undefined.
                        // 2. Url Query Params
                        //   - If navigation started from outside the workflow,
                        //     the query parameters may have the desired
                        //     input mode, etc.
                        // 3. `defaults` object
                        //   - A catch-all when no data is available.
                        //     This will happen if the user inserts the URL
                        //     for the selectsource route manually.
                        var newAttrs = _.clone(this.model.wizard.attributes);
                        _.defaults(newAttrs, {
                            inputType: classicurlModel.get('input_type'),
                            inputMode: classicurlModel.get('input_mode'),
                            isModularInput: classicurlModel.get('modinput')
                        }, defaults);

                        // Normalize data types
                        newAttrs.inputMode = parseInt(newAttrs.inputMode, 10);

                        newAttrs.currentStep = 'selectsource';

                        // Hide file monitor on cloud. Redirect to input mode 'file upload' unless it's a modular input.
                        if (this.model.serverInfo.isCloud()
                            && newAttrs.inputMode == GDI.INPUT_MODE.MONITOR
                            && !newAttrs.isModularInput
                            && _.contains(CloudRules.inputTypes.blacklist, newAttrs.inputType)
                           ) {
                            classicurlModel.set('input_mode', GDI.INPUT_MODE.UPLOAD.toString());
                        }

                        // Check input mode is valid & user is capable
                        if (!_(GDI.INPUT_MODES).contains(newAttrs.inputMode)
                            || newAttrs.inputMode == GDI.INPUT_MODE.UPLOAD && !this.model.user.canUploadData()
                            || newAttrs.inputMode == GDI.INPUT_MODE.MONITOR && !this.model.user.canMonitorData()
                            || newAttrs.inputMode == GDI.INPUT_MODE.FORWARD && !this.model.user.canForwardData()) {
                            this.showErrorPage();
                            return;
                        }

                        if (newAttrs.inputMode == GDI.INPUT_MODE.UPLOAD) {
                            newAttrs.inputType = 'file_upload';
                        }
                        else if (newAttrs.inputMode == GDI.INPUT_MODE.FORWARD && _.isEmpty(this.model.wizard.get('serverClassName'))) {
                            // came directly from permalink -> redirect to selectforwarders
                            var data = (newAttrs.inputType) ?
                                { data: { input_type: newAttrs.inputType } } :
                                {};

                            var nextUrl = route.addData(
                                this.model.application.get('root'),
                                this.model.application.get('locale'),
                                this.model.application.get('app'),
                                'selectforwarders',
                                data);
                            this.navigate(nextUrl, {trigger: true, replace: false});
                            return;
                        }

                        this.model.wizard.set(newAttrs);

                        classicurlModel.save({
                            input_mode: this.model.wizard.get('inputMode')
                        }, { replaceState: true });
                    }.bind(this));

                    $('.addDataBody').html(view.render().el);
                    this.setPageTitle(_('Add Data - Select Source').t());
                },
                datapreview: function(locale, app, page){
                    var name = this.model.input.get('ui.name') || (this.model.input.get('file') && this.model.input.get('file').name) || '';

                    var previewSid = this.model.wizard.get('previewsid') || this.model.previewPrimer.get('sid');
                    this.model.wizard.unset('previewsid');

                    this.model.previewPrimer.set({
                        sid: previewSid,
                        name: name,
                        sourcetype: this.model.input.get('ui.sourcetype'),
                        descriptionText: _('This page lets you see how Splunk sees your data before indexing. If the events look correct and have the right timestamps, click "Next" to proceed. If not, use the options below to define proper event breaks and timestamps. If you cannot find an appropriate source type for your data, create a new one by clicking "Save As".').t()
                    });

                    this.model.previewPrimer.on('change:sourcetype', function(model, value){
                        this.model.input.set('ui.sourcetype', value);
                    }.bind(this));

                    this.model.previewPrimer.on('change:sourcetypeApp', function(model, value){
                        this.model.input.set('appContext', value);
                    }.bind(this));

                    this.model.previewPrimer.on('change:unsavedSourcetype', function(model, value){
                        this.model.wizard.set('unsavedSourcetype', value);
                    }.bind(this));

                    if(this.boundConfirmListener !== true){
                        this.boundConfirmListener = true;
                        this.model.wizard.on('confirmSavedState', function(){
                             this.model.previewPrimer.trigger('confirmSavedState', function(){
                                 this.dataPreview.deactivate();
                                 this.model.wizard.stepForward();
                             }.bind(this));
                        }.bind(this));
                    }

                    this.dataPreview = new DataPreviewRouter({
                        el: $('.addDataBody'),
                        routes: function(){
                            //this is how we disable the datapreview router
                            return;
                        },
                        enableHeader: true,
                        enableAppBar: false,
                        enableFooter: false,
                        model: this.model,
                        collection: this.collection,
                        history: this.history,
                        deferreds: this.deferreds,
                        canChangeSource: false
                    });

                    this.dataPreview.page(
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        this.model.application.get('page')
                    );

                    this.setPageTitle(_('Add Data - Set Sourcetype').t());
                    this.model.wizard.set('currentStep', 'datapreview');
                },
                inputsettings: function(locale, app, page){
                    if(!this.pageView) {
                        this.page(locale, app, page);
                    }
                    var view = new InputSettingsView({
                        model: this.model,
                        collection: this.collection
                    });
                    $('.addDataBody').html(view.render().el);
                    this.setPageTitle(_('Add Data - Input Settings').t());

                    this.model.wizard.set('currentStep', 'inputsettings');
                },
                review: function(locale, app, page){
                    if(!this.pageView) {
                        this.page(locale, app, page);
                    }
                    var view = new ReviewView({
                        model: this.model,
                        collection: this.collection
                    });
                    $('.addDataBody').html(view.render().el);
                    this.setPageTitle(_('Add Data - Review').t());
                    this.model.wizard.set('currentStep', 'review');
                },
                success: function(locale, app, page){
                    if(!this.pageView) {
                        this.page(locale, app, page);
                    }
                    var view = new SuccessScreenView({
                        model: this.model
                    });
                    $('.addDataBody').html(view.render().el);
                    this.setPageTitle(_('Add Data - Success').t());
                }
            },
            fetchInputModel: function() {
                // Switching active input models in response to change:inputType
                var inputModel,
                    fetchDfd,
                    inputType = this.model.wizard.get('inputType'),
                    inputMode = this.model.wizard.get('inputMode');
                if (inputType === 'file_upload') {
                    inputModel = new UploadModel();
                } else if (inputType == 'file_monitor') {
                    inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteMonitorModel() : new FileMonitorModel();
                } else if (inputType === 'file_oneshot') {
                    inputModel = new OneshotModel();
                } else if (inputType === 'tcp') {
                    // Since TCP and UDP are combined in add data check for edit_tcp capability, otherwise check edit_udp.
                    if (this.model.user.canEditTCP() || this.model.wizard.isForwardMode()){
                        inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteTCPModel() : new TCPModel();
                    } else if (this.model.user.canEditUDP()) {
                        inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteUDPModel() : new UDPModel();
                    }
                } else if (inputType === 'udp') {
                    // Since TCP and UDP are combined in add data check for edit_udp capability, otherwise check edit_tcp.
                    if (this.model.user.canEditUDP() || this.model.wizard.isForwardMode()){
                        inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteUDPModel() : new UDPModel();
                    } else if (this.model.user.canEditTCP()) {
                        inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteTCPModel() : new TCPModel();
                    }
                } else if (inputType === 'http') {
                    inputModel = new HTTPModel();
                } else if (inputType === 'scripts') {
                    inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteScriptModel() : new ScriptModel();
                } else if (inputType === 'evt_logs_local') {
                    if (inputMode === GDI.INPUT_MODE.FORWARD) {
                        inputModel = new RemoteWinEventLogsModel();
                    } else {
                        inputModel = new WinEventLogsModel();
                        inputModel.set('id', 'localhost');
                    }
                } else if (inputType == 'evt_logs_remote') {
                    inputModel = new WinEventLogsModel();
                } else if (inputType == 'perfmon_local') {
                    inputModel = (inputMode === GDI.INPUT_MODE.FORWARD) ? new RemoteWinPerfmonModel() : new WinPerfmonModel();
                } else if (inputType == 'perfmon_remote') {
                    inputModel = new WinPerfmonWMIModel();
                } else if (inputType === 'regmon') {
                    inputModel = new WinRegmonModel();
                } else if (inputType === 'admon') {
                    inputModel = new WinADmonModel();
                } else if (inputType === 'hostmon') {
                    inputModel = new WinHostmonModel();
                } else if (inputType === 'netmon') {
                    inputModel = new WinNetmonModel();
                } else if (inputType === 'printmon') {
                    inputModel = new WinPrintmonModel();
                }

                // No fetch needed for file upload,
                // provide an immediately resolved deferred.
                if (inputModel) {
                    fetchDfd = inputType === 'file_upload' ?
                        $.Deferred().resolve() :
                        inputModel.fetch();

                    fetchDfd.done(function () {
                        this.model.inputModels[inputType] = inputModel;
                    }.bind(this));

                    // quietly passing some models for validation needs
                    inputModel.wizard = this.model.wizard;
                    inputModel.application = this.model.application;
                }
                return fetchDfd;
            },

            refreshIndexes: function() {
                return this.collection.indexes.fetch({
                    data: {
                        search: 'isInternal=0 disabled=0 isVirtual=0',
                        count: -1
                    }
                });
            },

            saveSourcetype: function() {
                var that = this;
                this.model.sourcetype.transposeToRest();
                this.model.sourcetype.entry.set({name: this.model.input.get('ui.sourcetype')});
                this.model.sourcetype.entry.content.set({pulldown_type: 1});
                this.model.sourcetype.save({}, {
                    success: function() {
                        that.model.wizard.stepForward(true);
                    }
                });
            },

            uploadSaveFile: function () {
                var self = this;
                // if (!window.Blob || !window.File || !window.FileReader) {
                //   TODO show browser campatibility error/warning
                // }

                this.model.wizard.trigger('uploadSaveFile');

                var file = this.model.input.get('file');
                if (!file) {
                    //TODO show file error
                    return;
                }

                var index = self.model.input.get('ui.index'),
                    hostSwitch = self.model.input.get('hostSwitch'),
                    host = self.model.input.get('ui.host'),
                    host_regex = self.model.input.get('ui.host_regex'),
                    host_segment = self.model.input.get('ui.host_segment'),
                    sourcetype = self.model.input.get('ui.sourcetype'),
                    props = ['source=' + encodeURIComponent(file.name), 'output_mode=json'];

                if (sourcetype){
                    props.push('sourcetype='+sourcetype);
                }

                if (index){
                    props.push('index='+index);
                }

                if (hostSwitch === 'regex' && !_.isUndefined(host_regex) ){
                    props.push('host_regex='+host_regex);
                } else if (hostSwitch === 'segment' && !_.isUndefined(host_segment)){
                    props.push('host_segment='+host_segment);
                } else if (host) {
                    props.push('host='+host);
                }

                var url = route.receiversStream(
                    self.model.application.get('root'),
                    self.model.application.get('locale')
                );

                url = url +'?'+ props.join('&');

                var data = new window.FormData();
                data.append('spl-file', file);

                $.ajax({
                    data: data,
                    url: url,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    success: function(){
                        self.model.wizard.trigger('uploadSaveFileDone');
                        self.model.wizard.stepForward(true);
                    },
                    error: this.onSendFail,
                    xhr: function(){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(e){
                            if(e.lengthComputable){
                                var progress = Math.round((e.loaded / e.total)*100);
                                self.model.wizard.trigger('uploadSaveFileProgress', progress);
                            }
                        });
                        return xhr;
                    }
                }).fail(function(responseError) {
                   self.model.wizard.trigger('uploadFailedStatus',responseError.responseText);
               });
            }
        });
    }
);
