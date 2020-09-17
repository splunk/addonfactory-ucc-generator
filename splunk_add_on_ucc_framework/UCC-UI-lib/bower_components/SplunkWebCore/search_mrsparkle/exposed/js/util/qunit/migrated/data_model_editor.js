/* globals assert */
define([
            'jquery',
            'collections/services/data/TransformsLookups',
            'models/services/datamodel/DataModel',
            'mocks/data/transformsLookups',
            'mocks/models/search/MockJob',
            'mocks/models/MockServerInfo',
            'models/shared/Application',
            'models/services/AppLocal',
            'models/services/authentication/User',
            'models/services/search/jobs/ResultJsonRows',
            'collections/services/configs/SearchBNFs',
            'mocks/data/appLocal',
            'views/data_model_editor/AddEditContainerView',
            'mocks/mockify',
            'util/qunit_utils',
            'util/field_extractor_utils'
        ],
        function(
            $,
            TransformsLookups,
            DataModel,
            transformsLookupsData,
            MockJob,
            MockServerInfo,
            Application,
            AppLocal,
            UserModel,
            ResultJsonRows,
            SearchBNFsCollection,
            appLocalData,
            AddEditContainerView,
            mockify,
            qunitUtils,
            fieldExtractorUtils
        ) {

    var setupHelper = function() {
        this.$container = $('<div class="container"></div>').appendTo('body');
        this.clock = sinon.useFakeTimers();
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.requests = [];
        var requestsIndex = 0;

        var that = this;
        this.xhr.onCreate = function (xhr) {
            that.requests.push(xhr);
        };

        this.model = new DataModel();
        this.previewResultsJob = new MockJob();
        this.previewResults = new ResultJsonRows();
        
        this.userModel = new UserModel();
        mockify(this.userModel);
        
        this.searchBNFsCollection = new SearchBNFsCollection();
        mockify(this.searchBNFsCollection);
        
        this.transformsLookups = new TransformsLookups();

        this.transformsLookups.fetch();
        this.requests[requestsIndex++].respond(200, {}, JSON.stringify(transformsLookupsData.TRANSFORMS_LOOKUPS));

        this.clock.tick(1);

        // Clear the requests
        this.requests = [];

        this.appLocal = new AppLocal();
        this.appLocal.parse({data:appLocalData.APP_LOCAL});

        this.generateClickEvent = qunitUtils.generateClickEvent;

        this.applicationModel = new Application({ app: 'test-app', owner: 'test-owner', locale: 'en_US' });

        this.createAddEditContainerView = function(objectModel, setting) {
            return new AddEditContainerView({
                model: {
                    application: this.applicationModel,
                    appLocal: this.appLocal,
                    dataModel: objectModel,
                    setting: setting,
                    serverInfo: new MockServerInfo(),
                    user: this.userModel
                },
                collection: {
                    transformsLookups: this.transformsLookups,
                    searchBNFs: this.searchBNFsCollection
                }
            });
        };

        this.simulatePreviewJobPrepared = function(addEditView, objectName) {
            var object = this.model.objectByName(objectName);
            var calc = object.calculations.at(0);
            var field;
            if(calc) {
                field = calc.outputFields.at(0);
            }
            var previewView = addEditView.children.previewView || addEditView.children.formView.children.previewView;
            if(previewView.setModels) {
                previewView.setModels(object, calc, field);
            }
            addEditView.model.searchJob.trigger('prepared');
            if(previewView.model.searchJob !== addEditView.model.searchJob) {
                previewView.model.searchJob.trigger('prepared');
            }
            if(previewView.model.intentionsParser) {
                previewView.model.intentionsParser.isReportsSearch = function() { return true; };
            }
            if(previewView.workflowActionsDeferred) {
                previewView.workflowActionsDeferred.resolve();
            }
            if(previewView.searchParseDeferred) {
                previewView.searchParseDeferred.resolve();
            }
        };

        this.getPreviewTabContents = function(addEditView) {
            var $tabContents = addEditView.$('.preview-container .tab-pane');
            if($tabContents.length > 0) {
                return $tabContents;
            }
            return addEditView.$('.preview-container');
        };

        this.getControlsRowFromTabContent = function(tabContent) {
            return $(tabContent).find('.results-control-bar-placeholder .controls-row');
        };

        this.getJobStatusRowFromTabContent = function(tabContent) {
            return $(tabContent).find('.job-status-row');
        };

        // NOTE: some of the following methods depend on the controls_utils module

        this.verifySampleSizeWiring = function(addEditView, $container) {
            assert.equal($container.find('.control[data-name="sampleSize"]').length, 1, 'one is a sample size control');
            assert.ok(true, 'simulating changing the sample size drop-down');
            this.writeSyntheticSelectValueByIndex($container.find('.control[data-name="sampleSize"]'), 2);
            var stateModel = addEditView.children.formView.model.state || addEditView.model.state;
            assert.deepEqual(
                stateModel.get('sampleSize'),
                { earliest: "-5m", latest: "now" },
                'sample size was updated correctly'
            );
        };

        this.verifyPageSizeWiring = function(addEditView, $container) {
            assert.equal($container.find('.control[data-name="count"]').length, 1, 'one is a page size control');
            assert.ok(true, 'simulating changing the page size drop-down');
            this.writeSyntheticSelectValue($container.find('.control[data-name="count"]'), '100');
            var previewView = addEditView.children.previewView || addEditView.children.formView.children.previewView;
            var resultsFetchData = previewView.model.resultsFetchData || previewView.model.eventsFetchData || previewView.model.results.fetchData;
            assert.equal(resultsFetchData.get('count'), 100, 'the page count was updated');
        };

        this.verifyClusterFilterWiring = function(addEditView, $container) {
            assert.equal($container.find('.control[data-name="filter"]').length, 1, 'one is a filter control');
            assert.equal($container.find('.control[data-name="clustering"]').length, 1, 'one is a clustering control');
            var stateModel = addEditView.children.formView.model.state;

            assert.ok(true, 'simulating changing the filter text box');
            this.writeTextInputValue($container.find('.control[data-name="filter"]'), 'my-test-filter');
            $container.find('.apply-filter-button').trigger('click');
            assert.equal(stateModel.get('filter'), 'my-test-filter', 'the model was updated');

            assert.ok(true, 'simulating changing the clustering drop-down');
            this.writeSyntheticSelectValue($container.find('.control[data-name="clustering"]'), fieldExtractorUtils.CLUSTERING_DIVERSE);
            assert.equal(stateModel.get('clustering'), fieldExtractorUtils.CLUSTERING_DIVERSE, 'the model was updated');
        };

        this.verifyEventsViewWiring = function(addEditView, $container) {
            assert.equal($container.find('.control[data-name="eventsView"]').length, 1, 'one is an eventsView control');
            var stateModel = addEditView.children.formView.model.state;
            assert.ok(true, 'simulating changing the eventsView radio');
            this.writeSyntheticRadioValue($container.find('.control[data-name="eventsView"]'), fieldExtractorUtils.VIEW_MATCHING_EVENTS);
            assert.equal(stateModel.get('eventsView'), fieldExtractorUtils.VIEW_MATCHING_EVENTS, 'the model was updated');
        };

        this.verifyPageSizeAndSampleSizeOnly = function(addEditView, tabContent) {
            var $controlsRow = this.getControlsRowFromTabContent(tabContent);
            assert.equal($controlsRow.find('.control').length, 1, 'there are two controls in the control row');
            this.verifySampleSizeWiring(addEditView, $controlsRow);

            var $jobStatusRow = this.getJobStatusRowFromTabContent(tabContent);
            assert.equal($jobStatusRow.find('.control').length, 1, 'there is one control in the job status bar');
            this.verifyPageSizeWiring(addEditView, $jobStatusRow);
        };

        this.verifyClusterFilterControls = function(addEditView, tabContent) {
            var $controlsRow = this.getControlsRowFromTabContent(tabContent);
            assert.equal($controlsRow.find('.control').length, 3, 'there are three controls in the control row');
            this.verifySampleSizeWiring(addEditView, $controlsRow);
            this.verifyClusterFilterWiring(addEditView, $controlsRow);

            var $jobStatusRow = this.getJobStatusRowFromTabContent(tabContent);
            assert.equal($jobStatusRow.find('.control').length, 1, 'there is one control in the job status bar');
        };

        this.verifyClusterFilterMatchControls = function(addEditView, tabContent) {
            var $controlsRow = this.getControlsRowFromTabContent(tabContent);
            assert.equal($controlsRow.find('.control').length, 4, 'there are four controls in the control row');
            this.verifySampleSizeWiring(addEditView, $controlsRow);
            this.verifyClusterFilterWiring(addEditView, $controlsRow);
            this.verifyEventsViewWiring(addEditView, $controlsRow);

            var $jobStatusRow = this.getJobStatusRowFromTabContent(tabContent);
            assert.equal($jobStatusRow.find('.control').length, 1, 'there is one control in the job status bar');
            this.verifyPageSizeWiring(addEditView, $jobStatusRow);
        };

    };

    var teardownHelper = function() {
        this.clock.restore();
        this.xhr.restore();
        this.$container.remove();
    };

    return { setupHelper: setupHelper, teardownHelper: teardownHelper };

});