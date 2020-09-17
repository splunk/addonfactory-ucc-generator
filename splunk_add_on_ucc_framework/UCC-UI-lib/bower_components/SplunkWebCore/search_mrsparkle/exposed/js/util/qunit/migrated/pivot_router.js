/* globals assert */
define([
            'jquery',
            'underscore',
            'backbone',
            'models/pivot/PivotSearch',
            'models/pivot/PivotJob',
            'models/pivot/PivotReport',
            'models/services/datamodel/DataModel',
            'routers/PivotRouter',
            'mocks/mockify',
            'mocks/adapters/MockAdapter',
            'mocks/collections/MockSplunkDs',
            'mocks/models/MockSplunkD',
            'mocks/models/search/MockJob',
            'util/qunit_utils',
            'splunk.util'
        ],
        function(
            $,
            _,
            Backbone,
            PivotSearch,
            PivotJob,
            PivotReport,
            DataModel,
            PivotRouter,
            mockify,
            MockAdapter,
            MockSplunkDs,
            MockSplunkD,
            MockJob,
            qunitUtils,
            splunkUtils
        ) {

    // data fixtures

    var DATA_MODEL_ID = '/servicesNS/other-owner/other-app/datamodel/model/TestDataModel',
        NORMALIZED_DATA_MODEL_ID = '/servicesNS/test-owner/test-app/datamodel/model/TestDataModel',
        DATA_MODEL_NAME = 'TestDataModel',
        OBJECT_NAME = 'TestObject',
        TSIDX_NAMESPACE = 'tsidx-namespace',
        OBJECT_SEARCH = 'test object search',
        COLLECT_SID = 'test-collect-sid',
        SEED_SID = 'test.seed.sid.123',
        DATASET_NAME = 'my dataset',
        DATASET_TYPE = 'inputlookup',
        COMBINED_DATASET_ID = DATASET_TYPE + ':"' + DATASET_NAME + '"',

        NEW_REPORT_PAYLOAD = MockSplunkD.wrapInSplunkdShell({
            id: '/servicesNS/test-owner/test-app/saved/searches/_new',
            content: {
                'display.visualizations.type': 'balloon',
                'display.statistics.overlay': 'foo'
            },
            links: { alternate: '/servicesNS/test-owner/test-app/saved/searches/_new' }
        }),

        DEFAULT_PIVOT_JSON = "{\"dataModel\":\"TestDataModel\",\"baseClass\":\"TestObject\",\"filters\":[],\"cells\":[{\"owner\":\"TestObject\",\"fieldName\":\"TestObject\",\"displayName\":\"Count of TestObject\",\"type\":\"objectCount\"}],\"rows\":[],\"columns\":[]}",
        DEFAULT_PIVOT_SEARCH = '| pivot TestDataModel TestObject count(TestObject) AS "TestObject"',
        DEFAULT_DRILLDOWN_SEARCH = 'test-drilldown-search',
        DEFAULT_TOKENIZED_TSTATS_SEARCH = '| tstats from ' + PivotRouter.TSIDX_NAMESPACE_TOKEN + ' tstats-search-string-default',
        DEFAULT_SEARCH = 'search-string-default',
        DEFAULT_OPEN_IN_SEARCH = 'open-in-search-string-default',
        DEFAULT_PIVOT_SEARCH_PAYLOAD = MockSplunkD.wrapInSplunkdShell({
            pivot_search: DEFAULT_PIVOT_SEARCH,
            pivot_json: DEFAULT_PIVOT_JSON,
            tstats_search: DEFAULT_TOKENIZED_TSTATS_SEARCH,
            search: DEFAULT_SEARCH,
            open_in_search: DEFAULT_OPEN_IN_SEARCH,
            drilldown_search: DEFAULT_DRILLDOWN_SEARCH
        }),
        DEFAULT_DATASET_PIVOT_JSON = JSON.stringify({
            dataModel: encodeURIComponent(COMBINED_DATASET_ID),
            baseClass: OBJECT_NAME,
            filters:[],
            cells:[
                { owner: OBJECT_NAME, fieldName: OBJECT_NAME, displayName: "Count of " + OBJECT_NAME, type: "objectCount" }
            ],
            rows:[],
            columns:[]
        }),
        DEFAULT_DATASET_PIVOT_SEARCH = '| pivot ' + COMBINED_DATASET_ID + ' ' + OBJECT_NAME + ' count(' + OBJECT_NAME + ') AS "' + OBJECT_NAME + '"',
        DEFAULT_DATASET_PIVOT_SEARCH_PAYLOAD = MockSplunkD.wrapInSplunkdShell({
            pivot_search: DEFAULT_DATASET_PIVOT_SEARCH,
            pivot_json: DEFAULT_DATASET_PIVOT_JSON,
            tstats_search: DEFAULT_TOKENIZED_TSTATS_SEARCH,
            search: DEFAULT_SEARCH,
            open_in_search: DEFAULT_OPEN_IN_SEARCH,
            drilldown_search: DEFAULT_DRILLDOWN_SEARCH
        }),
        DEFAULT_AD_HOC_TSTATS_SEARCH_STRING = function(sid) {
            return '| tstats from sid=' + sid + ' tstats-search-string-default';
        },

        DEFAULT_MANAGED_TSTATS_SEARCH_STRING = '| tstats from ' + TSIDX_NAMESPACE + ' tstats-search-string-default',

        CUSTOM_PIVOT_JSON = "{\"dataModel\":\"TestDataModel\",\"baseClass\":\"TestObject\",\"filters\":[],\"cells\":[{\"owner\":\"TestObject\",\"fieldName\":\"uri_path\",\"displayName\":\"uri_path\",\"type\":\"string\"}],\"rows\":[{\"owner\":\"TestObject\",\"fieldName\":\"clientip\",\"displayName\":\"clientip\",\"type\":\"ipv4\"}],\"columns\":[{\"owner\":\"TestObject\",\"fieldName\":\"useragent\",\"displayName\":\"useragent\",\"type\":\"string\"}]}",
        CUSTOM_PIVOT_SEARCH = '| pivot TestDataModel TestObject count(uri_path) as uri_path SPLITROW clientip AS clientip SPLITCOL useragent',
        CUSTOM_TOKENIZED_TSTATS_SEARCH = '| tstats from ' + PivotRouter.TSIDX_NAMESPACE_TOKEN + ' tstats-search-string-custom',
        CUSTOM_SEARCH = 'search-string-custom',
        CUSTOM_OPEN_IN_SEARCH = 'open-in-search-string-custom',
        CUSTOM_PIVOT_SEARCH_PAYLOAD = MockSplunkD.wrapInSplunkdShell({
            pivot_search: CUSTOM_PIVOT_SEARCH,
            pivot_json: CUSTOM_PIVOT_JSON,
            tstats_search: CUSTOM_TOKENIZED_TSTATS_SEARCH,
            search: CUSTOM_SEARCH,
            open_in_search: CUSTOM_OPEN_IN_SEARCH
        }),
        CUSTOM_AD_HOC_TSTATS_SEARCH_STRING = function(sid) {
            return '| tstats from sid=' + sid + ' tstats-search-string-custom';
        },
        CUSTOM_MANAGED_TSTATS_SEARCH_STRING = '| tstats from ' + TSIDX_NAMESPACE + ' tstats-search-string-custom',

        DEFAULT_PLUS_ROW_SPLIT_JSON = "{\"dataModel\":\"TestDataModel\",\"baseClass\":\"TestObject\",\"filters\":[],\"cells\":[{\"owner\":\"TestObject\",\"fieldName\":\"TestObject\",\"displayName\":\"Count of TestObject\",\"type\":\"objectCount\"}],\"rows\":[{\"owner\":\"TestObject\",\"type\":\"string\",\"fieldName\":\"referrer\",\"displayName\":\"referrer\"}],\"columns\":[]}",
        DEFAULT_PLUS_ROW_SPLIT_SEARCH = '| pivot TestDataModel TestObject count(TestObject) AS "TestObject" ROWSPLIT referrer AS "referrer',

        DEFAULT_SAVED_SEARCH_ID = '/servicesNS/test-owner/test-app/saved/searches/TestSavedSearch',
        DEFAULT_SAVED_SEARCH_PAYLOAD = MockSplunkD.wrapInSplunkdShell({
            id: DEFAULT_SAVED_SEARCH_ID,
            content: {
                'display.page.pivot.dataModel': DATA_MODEL_ID,
                search: DEFAULT_PIVOT_SEARCH,
                'dispatch.earliest_time': '-15m',
                'dispatch.latest_time': '-5m'
            },
            links: { alternate: DEFAULT_SAVED_SEARCH_ID }
        }),
        NEW_SAVED_SEARCH_ID = '/servicesNS/test-owner/test-app/saved/searches/TestSavedSearchNew',
        DATA_MODEL_OBJECT_SUMMARY = {
            "Event-Based": 1,
            "Transaction-Based": 0,
            "Search-Based": 0
        },
        DATA_MODEL_FIELDS = [
            {
                "fieldName": "_time",
                "owner": "BaseEvent",
                "type": "timestamp",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "_time",
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": "test-field-one",
                "owner": OBJECT_NAME,
                "type": "string",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "test-field-one",
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": "test-field-two",
                "owner": OBJECT_NAME,
                "type": "string",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "test-field-two",
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": OBJECT_NAME,
                "owner": OBJECT_NAME,
                "type": "objectCount",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": OBJECT_NAME,
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": "referrer",
                "owner": OBJECT_NAME,
                "type": "string",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "referrer",
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": "uri_path",
                "owner": OBJECT_NAME,
                "type": "string",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "uri_path",
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": "clientip",
                "owner": OBJECT_NAME,
                "type": "ipv4",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "clientip",
                "comment": "",
                "fieldSearch": ""
            },
            {
                "fieldName": "useragent",
                "owner": OBJECT_NAME,
                "type": "string",
                "required": false,
                "multivalue": false,
                "hidden": false,
                "editable": false,
                "displayName": "useragent",
                "comment": "",
                "fieldSearch": ""
            }
        ],
        DATA_MODEL_OBJECTS = [
            {
                "objectName": OBJECT_NAME,
                "displayName": OBJECT_NAME,
                "parentName": "BaseEvent",
                "objectSearch": OBJECT_SEARCH,
                "tsidxNamepsace": "",
                "fields": DATA_MODEL_FIELDS
            }
        ],
        DATA_MODEL_DESCRIPTION = {
            "modelName": DATA_MODEL_ID,
            "displayName": DATA_MODEL_NAME,
            "description": "",
            "objectSummary": DATA_MODEL_OBJECT_SUMMARY,
            "objects": DATA_MODEL_OBJECTS
        };

    var BaseModule = _.extend({}, qunitUtils.FakeXhrModule, {

        setup: function() {
            qunitUtils.FakeXhrModule.setup.call(this);
            PivotRouter.prototype.setPageTitle = function() {};

            // export the data fixtures as needed
            this.DATA_MODEL_ID = DATA_MODEL_ID;
            this.DATA_MODEL_NAME = DATA_MODEL_NAME;
            this.OBJECT_NAME = OBJECT_NAME;
            this.NORMALIZED_DATA_MODEL_ID = NORMALIZED_DATA_MODEL_ID;
            this.COLLECT_SID = COLLECT_SID;
            this.DATASET_NAME = DATASET_NAME;
            this.DATASET_TYPE = DATASET_TYPE;
            this.COMBINED_DATASET_ID = COMBINED_DATASET_ID;
            this.CUSTOM_PIVOT_SEARCH = CUSTOM_PIVOT_SEARCH;
            this.NEW_REPORT_PAYLOAD = NEW_REPORT_PAYLOAD;
            this.OBJECT_SEARCH = OBJECT_SEARCH;
            this.TSIDX_NAMESPACE = TSIDX_NAMESPACE;
            this.DEFAULT_PIVOT_JSON = DEFAULT_PIVOT_JSON;
            this.DEFAULT_PLUS_ROW_SPLIT_JSON = DEFAULT_PLUS_ROW_SPLIT_JSON;
            this.DEFAULT_PLUS_ROW_SPLIT_SEARCH = DEFAULT_PLUS_ROW_SPLIT_SEARCH;
            this.DEFAULT_PIVOT_SEARCH = DEFAULT_PIVOT_SEARCH;
            this.DEFAULT_DRILLDOWN_SEARCH = DEFAULT_DRILLDOWN_SEARCH;
            this.DEFAULT_SAVED_SEARCH_ID = DEFAULT_SAVED_SEARCH_ID;
            this.DEFAULT_SAVED_SEARCH_PAYLOAD = DEFAULT_SAVED_SEARCH_PAYLOAD;
            this.DEFAULT_PIVOT_SEARCH_PAYLOAD = DEFAULT_PIVOT_SEARCH_PAYLOAD;
            this.DEFAULT_DATASET_PIVOT_JSON = DEFAULT_DATASET_PIVOT_JSON;
            this.DEFAULT_DATASET_PIVOT_SEARCH = DEFAULT_DATASET_PIVOT_SEARCH;
            this.DEFAULT_DATASET_PIVOT_SEARCH_PAYLOAD = DEFAULT_DATASET_PIVOT_SEARCH_PAYLOAD;
            this.DEFAULT_SEARCH = DEFAULT_SEARCH;
            this.NEW_SAVED_SEARCH_ID = NEW_SAVED_SEARCH_ID;
            this.DATA_MODEL_DESCRIPTION = 'data-model-description';
            this.SEED_SID = 'test-seed-sid';
            this.SEED_FIELDS = 'test-field-one,test-field-two';

            this.clock = sinon.useFakeTimers();

            // some instance members to be overridden in individual tests
            this.objectHasAcceleration = false;
            this.objectHasIndexTime = true;
            this.dataModelIsTemporary = false;
            if (!this.hasOwnProperty('mockDataModelBehavior')) {
                this.mockDataModelBehavior = true;
            }
            if (!this.hasOwnProperty('mockReportBehavior')) {
                this.mockReportBehavior = true;
            }

            this.router = new PivotRouter();
            this.classicurl = this.router.classicurl;
            this.timeRange = this.router.timeRange;
            this.application = this.router.model.application;
            this.collectJob = this.router.collectJob;
            this.pivotJob = this.router.pivotJob;
            this.application.set({ app: 'test-app', owner: 'test-owner' });
            this.router.page('test-locale', 'test-app', 'test-page');
            this.dataModel = this.router.dataModel;
            this.report = this.router.report;
            if(this.mockReportBehavior) {
                // mock out the getPivotJSON method for simplicity, its more complicated functionality is tested elsewhere
                this.report.getPivotJSON = function() {
                    return ({
                        dataModel: this.entry.content.get('search') ?
                            PivotReport.parseModelAndObjectFromSearch(this.entry.content.get('search'))[1] : '',
                        baseClass: this.getPivotObjectName(),
                        filters: this.getElementCollectionByType('filter').map(function(e) { return e.omit('fullyQualifiedName'); }),
                        cells: this.getElementCollectionByType('cell').map(function(e) { return e.omit('fullyQualifiedName'); }),
                        rows: this.getElementCollectionByType('row').map(function(e) { return e.omit('fullyQualifiedName'); }),
                        columns: this.getElementCollectionByType('column').map(function(e) { return e.omit('fullyQualifiedName'); })
                    });
                };
            }

            this.populateClassicurl = function(uriAttrs) {
                assert.ok(true, 'populating query string params with ' + JSON.stringify(uriAttrs));
                this.classicurl.sync.respondToRead(uriAttrs);
                //this.respondToMatchingRequest(/datamodel\/model\?/, MockSplunkDs.wrapInSplunkdShell([
                //    { foo: 'bar' },
                //    { biz: 'baz' }
                //]));
                this.respondToMatchingRequest(/data\/ui\/times\?/, []);
                this.respondToMatchingRequest(/server\/info/, {});
                this.router.deferreds.serverInfo.resolve();
                this.respondToMatchingRequest(/data\/ui\/nav/, MockSplunkD.wrapInSplunkdShell({}));
                this.respondToMatchingRequest(/data\/ui\/manager/, {});
                this.respondToMatchingRequest(/data\/ui\/ui-tour/, {});
                this.respondToMatchingRequest(/authentication\/users\/.+/, {});
                this.respondToMatchingRequest(/apps\/local\/.+/, {});
                this.router.deferreds.appLocal.resolve();
                this.router.deferreds.appLocals.resolve();
                this.router.deferreds.user.resolve();
            };

            this.extractMainSectionViewVariables = function() {
                if(!this.router._bodyView) {
                    throw new Error('extractMainSectionViewVariables called before main view is ready');
                }
                this.timeRange = this.router.timeRange;
                this.report = this.router.report;
                this.pivotJob = this.router.pivotJob;
                this.dataModel = this.router.dataModel;
                this.object = this.router.dataModelObject;
                this.pivotSearch = this.router.pivotSearch;
                this.reportHistoryManager = this.router.reportHistoryManager;
                this.collectJob = this.router.collectJob;

                this.pivotView = this.router._bodyView;
                sinon.spy(this.pivotView, 'clearData');
                sinon.spy(this.pivotView, 'renderData');
                sinon.spy(this.pivotView, 'renderContainer');
            };

            this.verifyDefaultPivotConfig = function(options) {
                options = options || {};
                assert.equal(this.report.getPivotObjectName(), OBJECT_NAME, 'the object name is correct');
                assert.equal(this.report.getNumCells(), 1, 'a cell element is in the report');
                var cell = this.report.entry.content.cells.at(0);
                assert.deepEqual(cell.pick('displayName', 'fieldName', 'owner', 'type'), {
                    displayName: "Count of " + OBJECT_NAME,
                    fieldName: OBJECT_NAME,
                    owner: OBJECT_NAME,
                    type: 'objectCount'
                }, 'the cell has the correct attributes');

                assert.equal(this.report.getNumRows(), 0, 'no row elements are in the report');
                assert.equal(this.report.getNumColumns(), 0, 'no column elements are in the report');
                if(options.checkFilters) {
                    assert.equal(this.report.getNumFilters(), 0, 'no filter elements are in the report');
                }
            };

            this.verifyDefaultPivotConfigHandling = function(options) {
                var pivotSearchRequest = this.findMostRecentRequest(/datamodel\/pivot/, true);
                this.respondToTimeRange(!!options.timeRangeError, options.timeRangeAttrs);
                if(options.usePivotJson) {
                    this.verifyDefaultPivotConfig({ checkFilters: true });
                }
                var fetchSeed = options.usePivotJson ? { pivotJson: DEFAULT_PIVOT_JSON } : { pivotSearch: DEFAULT_PIVOT_SEARCH };
                this.verifyPivotSearchFetch(pivotSearchRequest, fetchSeed);
                this.respondTo(pivotSearchRequest, DEFAULT_PIVOT_SEARCH_PAYLOAD);
                if(!options.usePivotJson) {
                    this.verifyDefaultPivotConfig({ checkFilters: false });
                }
            };

            this.verifyCustomPivotConfig = function(options) {
                options = options || {};
                assert.equal(this.report.getPivotObjectName(), OBJECT_NAME, 'the object name is correct');
                assert.equal(this.report.getNumCells(), 1, 'a cell element is in the report');
                var cell = this.report.entry.content.cells.at(0);
                assert.deepEqual(cell.pick('displayName', 'fieldName', 'owner', 'type'), {
                    displayName: 'uri_path',
                    fieldName: 'uri_path',
                    owner: OBJECT_NAME,
                    type: 'string'
                }, 'the cell has the correct attributes');

                assert.equal(this.report.getNumRows(), 1, 'a cell element is in the report');
                var row = this.report.entry.content.rows.at(0);
                assert.deepEqual(row.pick('displayName', 'fieldName', 'owner', 'type'), {
                    displayName: 'clientip',
                    fieldName: 'clientip',
                    owner: OBJECT_NAME,
                    type: 'ipv4'
                }, 'the row has the correct attributes');

                assert.equal(this.report.getNumColumns(), 1, 'a cell element is in the report');
                var column = this.report.entry.content.columns.at(0);
                assert.deepEqual(column.pick('displayName', 'fieldName', 'owner', 'type'), {
                    displayName: 'useragent',
                    fieldName: 'useragent',
                    owner: OBJECT_NAME,
                    type: 'string'
                }, 'the column has the correct attributes');

                if(options.checkFilters) {
                    assert.equal(this.report.getNumFilters(), 0, 'no filter elements are in the report');
                }
            };

            this.verifyCustomPivotConfigHandling = function(options) {
                var pivotSearchRequest = this.findMostRecentRequest(/datamodel\/pivot/, true);
                this.respondToTimeRange(!!options.timeRangeError);
                if(options.usePivotJson) {
                    this.verifyCustomPivotConfig({ checkFilters: true });
                }
                var fetchSeed = options.usePivotJson ? { pivotJson: CUSTOM_PIVOT_JSON } : { pivotSearch: CUSTOM_PIVOT_SEARCH};
                this.verifyPivotSearchFetch(pivotSearchRequest, fetchSeed);
                this.respondTo(pivotSearchRequest, CUSTOM_PIVOT_SEARCH_PAYLOAD);
                if(!options.usePivotJson) {
                    this.verifyCustomPivotConfig({ checkFilters: false });
                }
            };

            this.verifyAndRespondToCollect = function(expectedDispatchAttrs, customResponseAttrs, options) {
                options = options || {};
                expectedDispatchAttrs = $.extend({
                    search: OBJECT_SEARCH + ' | tscollect | stats count',
                    status_buckets: 0,
                    auto_cancel: 100,
                    output_mode: 'json',
                    rf: '*',
                    provenance: 'UI:Pivot'
                }, expectedDispatchAttrs);
                expectedDispatchAttrs.search = 'search ' + expectedDispatchAttrs.search;
                var lastCollectJobCreate = this.findMostRecentRequest(/test-owner\/test-app\/search\/jobs$/, true);
                this.verifyRequestArgs(lastCollectJobCreate, expectedDispatchAttrs,
                        'the collect job was dispatched with the correct params');

                customResponseAttrs = customResponseAttrs || {};
                if(options.simulatePreparing) {
                    customResponseAttrs = _.extend({ dispatchState: 'PARSING' }, customResponseAttrs);
                }
                assert.ok(true, 'responding to the collect dispatch');
                var isTimeCursored = customResponseAttrs.isTimeCursored !== false;
                this.respondToCollectJobDispatch(
                    { isTimeCursored: isTimeCursored }, _.extend({ isTimeCursored: isTimeCursored }, customResponseAttrs));
                if(!options.ignoreUrl) {
                    assert.equal(
                        this.classicurl.get('accSid'),
                        options.expectedAccSid || COLLECT_SID,
                        'the collect sid was set in the URL'
                    );
                }
            };

            this.verifyNoCollectJob = function(options) {
                options = options || {};
                if(options.allowFetch) {
                    assert.ok(
                        !this.findMostRecentRequest(/search\/jobs$/),
                        'a collect job was not created'
                    );
                }
                else {
                    assert.ok(
                        !this.findMostRecentRequest(/search\/jobs/),
                        'a collect job was not created or fetched'
                    );
                }
            };

            this.verifyCollectJobNotPaused = function(sid) {
                var pauseRequest = _(this.requests).find(function(request) {
                    return (
                        request.url.indexOf('search/jobs/' + (sid || this.COLLECT_SID) + '/control') > -1
                        && request.requestBody.indexOf('action=pause') > -1 && request.readyState < 4
                    );
                }, this);
                assert.ok(!pauseRequest, 'pause was not called on the collect job');
            };

            this.verifyCollectJobPaused = function(sid) {
                var pauseRequest = _(this.requests).find(function(request) {
                    return (
                        request.url.indexOf('search/jobs/' + (sid || this.COLLECT_SID) + '/control') > -1
                        && request.requestBody.indexOf('action=pause') > -1 && request.readyState < 4
                    );
                }, this);
                assert.ok(pauseRequest, 'pause was called on the collect job');
                this.respondTo(pauseRequest, {});
            };

            this.verifyCollectJobNotUnpaused = function(sid) {
                var unpauseRequest = _(this.requests).find(function(request) {
                    return (
                        request.url.indexOf('search/jobs/' + (sid || this.COLLECT_SID) + '/control') > -1
                        && request.requestBody.indexOf('action=unpause') > -1 && request.readyState < 4
                    );
                }, this);
                assert.ok(!unpauseRequest, 'unpause was not called on the collect job');
            };

            this.verifyCollectJobUnpaused = function(sid) {
                var unpauseRequest = _(this.requests).find(function(request) {
                    return (
                        request.url.indexOf('search/jobs/' + (sid || this.COLLECT_SID) + '/control') > -1
                        && request.requestBody.indexOf('action=unpause') > -1 && request.readyState < 4
                    );
                }, this);
                assert.ok(unpauseRequest, 'unpause was called on the collect job');
                this.respondTo(unpauseRequest, {});
            };

            this.verifyCollectJobNotPolling = function() {
                sinon.stub(this.collectJob, 'safeFetch');
                assert.ok(true, 'waiting for the collect job poller');
                this.clock.tick(1000);
                assert.equal(this.collectJob.safeFetch.callCount, 0, 'the collect job is not polling');
                this.collectJob.safeFetch.restore();
            };

            this.verifyCollectJobPolling = function() {
                sinon.stub(this.collectJob, 'safeFetch');
                assert.ok(true, 'waiting for the collect job poller');
                this.clock.tick(1000);
                assert.ok(this.collectJob.safeFetch.callCount > 0, 'the collect job is polling');
                this.collectJob.safeFetch.restore();
            };

            this.verifyPivotSearchFetch = function(request, options) {
                assert.ok(request.url.indexOf(NORMALIZED_DATA_MODEL_ID.replace('datamodeleai', 'datamodelreport') > -1),
                    'request URL is correct');

                var expectedParams = { output_mode: 'json', namespace: PivotRouter.TSIDX_NAMESPACE_TOKEN };
                if(options.pivotJson) {
                    expectedParams.pivot_json = options.pivotJson;
                }
                else {
                    expectedParams.pivot_search = options.pivotSearch;
                }
                this.verifyRequestArgs(request, expectedParams, 'request params are correct');
            };

            this.verifyPivotJobNotDispatched = function() {
                assert.equal(this.pivotJob.sync.createSpy.callCount, 0, 'pivot job has not been dispatched');
            };

            this.verifyUrlParams = function() {
                var attrsToCheck = _(arguments).toArray(),
                    reportContent = this.report.entry.content,
                    urlAttrs = this.classicurl.toJSON();

                if(_(attrsToCheck).contains('reload')) {
                    assert.ok(urlAttrs.reload, 'the reload flag was set');
                    attrsToCheck = _(attrsToCheck).without('reload');
                }
                if(_(attrsToCheck).contains('model')) {
                    assert.equal(urlAttrs.model, DATA_MODEL_ID, 'the "model" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('model');
                }
                if(_(attrsToCheck).contains('object')) {
                    assert.equal(urlAttrs.object, OBJECT_NAME, 'the "object" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('object');
                }
                if(_(attrsToCheck).contains('dataset')) {
                    assert.equal(urlAttrs.dataset, DATASET_NAME, 'the "dataset" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('dataset');
                }
                if(_(attrsToCheck).contains('type')) {
                    assert.equal(urlAttrs.type, DATASET_TYPE, 'the "type" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('type');
                }
                if(_(attrsToCheck).contains('q')) {
                    assert.equal(urlAttrs.q, reportContent.get('search'), 'the "q" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('q');
                }
                if(_(attrsToCheck).contains('s')) {
                    assert.equal(urlAttrs.s, this.report.id, 'the "s" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('s');
                }
                if(_(attrsToCheck).contains('accSid')) {
                    assert.equal(urlAttrs.accSid, COLLECT_SID, 'the "accSid" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('accSid');
                }
                if(_(attrsToCheck).contains('seedSid')) {
                    assert.equal(urlAttrs.seedSid, this.SEED_SID, 'the "seedSid" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('seedSid');
                }
                if(_(attrsToCheck).contains('fields')) {
                    assert.equal(urlAttrs.fields, this.SEED_FIELDS, 'the "fields" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('fields');
                }
                if(_(attrsToCheck).contains('earliest')) {
                    assert.equal(urlAttrs.earliest, reportContent.get('dispatch.earliest_time'),
                        'the "earliest" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('earliest');
                }
                if(_(attrsToCheck).contains('latest')) {
                    assert.equal(urlAttrs.latest, reportContent.get('dispatch.latest_time'),
                        'the "latest" URL param is correct');
                    attrsToCheck = _(attrsToCheck).without('latest');
                }
                _(attrsToCheck).each(function(attr) {
                    assert.equal(urlAttrs[attr], reportContent.get(attr), 'the "' + attr + '" URL param is correct');
                });
                var nonDisplayKeys = _(urlAttrs).chain().keys().filter(function(key) { return !/^display/.test(key); }).value();
                assert.equal(
                    nonDisplayKeys.length,
                    arguments.length,
                    'there were no additional non-display related URL params'
                );
            };

            this.verifyNewReport = function(expectedDifferences) {
                var defaultContent =  NEW_REPORT_PAYLOAD.entry[0].content,
                    fixtureContent = $.extend(true, {}, defaultContent, expectedDifferences);

                assert.deepEqual(
                    _(this.report.entry.content.toJSON()).pick(_(fixtureContent).keys()),
                    fixtureContent,
                    'the live report is correct'
                );
            };

            this.verifyFinalReportState = function(timeRange, options) {
                options = options || { type: 'default' };
                var isDefault = options.type === 'default';
                if(isDefault) {
                    this.verifyDefaultPivotConfig({ checkFilters: false });
                }
                else {
                    this.verifyCustomPivotConfig({ checkFilters: false });
                }

                var earliest = timeRange ? timeRange[0] : 0,
                    latest = timeRange ? timeRange[1] : '';

                if(this.objectHasIndexTime) {
                    assert.equal(this.report.getNumFilters(), 1, 'a filter element is in the report');
                    var filter = this.report.entry.content.filters.at(0).pick(
                            'type', 'fieldName', 'owner', 'displayName', 'earliestTime', 'latestTime'
                        ),
                        expectedAttrs = {
                            type: 'timestamp',
                            fieldName: '_time',
                            owner: 'BaseEvent',
                            displayName: '_time',
                            earliestTime: earliest,
                            latestTime: latest
                        };

                    assert.deepEqual(filter, expectedAttrs, 'the filter attributes are correct');
                }
                else {
                    assert.equal(this.report.getNumFilters(), 0, 'there are no filter elements is in the report');
                }
                assert.equal(this.report.entry.content.get('search'), this.pivotSearch.get('pivotSearch'),
                    'the report search string is correct');

                var expectedPivotJobParams = {
                    search: isDefault ? DEFAULT_SEARCH : CUSTOM_SEARCH,
                    earliest_time: earliest,
                    app: this.application.get('app'),
                    owner: this.application.get('owner'),
                    provenance: 'UI:Pivot'
                };
                if(latest) {
                    expectedPivotJobParams.latest_time = latest;
                }

                if(options.realtime) {
                    $.extend(expectedPivotJobParams, {
                        tstatsSearch: isDefault ? DEFAULT_AD_HOC_TSTATS_SEARCH_STRING(options.sid) :
                            CUSTOM_AD_HOC_TSTATS_SEARCH_STRING(options.sid)
                    });
                }
                if(options.sid) {
                    $.extend(expectedPivotJobParams, {
                        sid: options.sid,
                        tstatsSearch: isDefault ? DEFAULT_AD_HOC_TSTATS_SEARCH_STRING(options.sid) :
                            CUSTOM_AD_HOC_TSTATS_SEARCH_STRING(options.sid)
                    });
                }
                else if(PivotRouter.ADHOC_ACCELERATION_MODE !== PivotRouter.NO_ADHOC_ACCELERATION && !options.noAcc) {
                    $.extend(expectedPivotJobParams, {
                        tsidxNamespace: options.tsidxNamespace,
                        tstatsSearch: isDefault ? DEFAULT_MANAGED_TSTATS_SEARCH_STRING : CUSTOM_MANAGED_TSTATS_SEARCH_STRING
                    });
                }
                assert.deepEqual(this.pivotJob.save.lastCall.args[1].data, expectedPivotJobParams,
                    'the pivot job was dispatched with the correct params');
            };

            this.respondToTimeRange = function(error, customAttrs) {
                var timeRangeRequest = this.findMostRecentRequest(/timeparser/, true);
                if (timeRangeRequest) {
                    if (error) {
                        this.respondTo(timeRangeRequest, MockSplunkD.wrapInSplunkdShell({}), 500);
                    }
                    else {
                        this.respondTo(timeRangeRequest, MockSplunkD.wrapInSplunkdShell({}));
                    }
                }
                this.timeRange.set(customAttrs || {});
            };

            this.respondToCollectFetch = function(payload, status) {
                var sid = payload.sid;
                payload = MockJob.wrapInSplunkdShell(payload);
                payload.entry[0].links.control = 'search/jobs/' + sid + '/control';
                this.respondToMatchingRequest(
                    new RegExp('search/jobs/' + sid),
                    payload,
                    status
                );
            };

            this.respondToNewReport = function() {
                this.respondToMatchingRequest(/saved\/searches\/_new/, NEW_REPORT_PAYLOAD);
            };

            this.respondToReport = function(payload) {
                this.respondToMatchingRequest(/saved\/searches\/.+/, payload);
            };

            this.respondToDataModel = function(payload) {
                if (!payload && this.mockDataModelBehavior) {
                    payload = this.generateMockDataModelPayload();
                }
                this.respondToMatchingRequest(/datamodel\/model\/.+/, payload || {});
            };

            this.respondToDataModelFromSid = function(payload) {
                if (!payload && this.mockDataModelBehavior) {
                    payload = this.generateMockDataModelPayload();
                }
                this.respondToMatchingRequest(/datamodel\/generate\?/, payload);
            };

            this.respondToPivotQuery = function(payload) {
                this.respondToMatchingRequest(/datamodel\/pivot/, payload);
            };

            this.respondToCollectJobDispatch = function(createPayload, readPayload) {
                this.respondToMatchingRequest(
                    /search\/jobs$/,
                    _.extend({ sid: this.COLLECT_SID }, createPayload)
                );
                this.respondToCollectFetch(_.extend({ sid: this.COLLECT_SID }, readPayload));
            };

            this.quickSetupNewReport = function(uriParams) {
                assert.ok(true, 'setting up a new report');
                this.populateClassicurl($.extend({ model: DATA_MODEL_ID, object: OBJECT_NAME }, uriParams || {}));
                this.respondToNewReport();
                this.respondToDataModel();
                this.respondToTimeRange();
                this.respondToPivotQuery(DEFAULT_PIVOT_SEARCH_PAYLOAD);
                uriParams = uriParams || {};
                this.respondToCollectJobDispatch(
                    { isTimeCursored: true },
                    {
                        request: {
                            earliest_time: uriParams.earliest || 0,
                            latest_time: uriParams.latest || undefined
                        }
                    }
                );
                this.extractMainSectionViewVariables();
            };

            this.quickSetupExistingReport = function(uriParams) {
                assert.ok(true, 'setting up an existing report');
                this.populateClassicurl($.extend({ s: DEFAULT_SAVED_SEARCH_ID }, uriParams || {}));
                this.respondToReport($.extend(true, {}, DEFAULT_SAVED_SEARCH_PAYLOAD));
                this.respondToDataModel();
                this.respondToTimeRange();
                this.respondToPivotQuery(DEFAULT_PIVOT_SEARCH_PAYLOAD);
                uriParams = uriParams || {};
                this.respondToCollectJobDispatch(
                    { isTimeCursored: true },
                    {
                        request: {
                            earliest_time: uriParams.earliest || DEFAULT_SAVED_SEARCH_PAYLOAD.entry[0].content['dispatch.earliest_time'],
                            latest_time: uriParams.latest || DEFAULT_SAVED_SEARCH_PAYLOAD.entry[0].content['dispatch.latest_time']
                        }
                    }
                );
                this.extractMainSectionViewVariables();
            };

            this.finishBootstrappingTemporaryMode = function() {
                this.respondToCollectJobDispatch({ isTimeCursored: true }, { isDone: true });
            };

            this.prepopulateTemporaryDataModel = function(payload, seedSid) {
                if (!payload && this.mockDataModelBehavior) {
                    payload = this.generateMockDataModelPayload();
                }
                this.dataModel.setFromSplunkD(payload);
                if (this.dataModelIsTemporary) {
                    this.dataModel.set('sid', seedSid || DATA_MODEL_NAME);
                }
                this.router.aggregator._previousDepList.push(
                    { _resourceType: DataModel, flags: ['from sid'], resource: this.dataModel, deferred: $.Deferred().resolve() }
                );
            };

            this.prepopulateReportDefaults = function() {
                var report = new PivotReport();
                report.setFromSplunkD(NEW_REPORT_PAYLOAD);
                report.entry.content.set({ 'display.general.type': 'statistics' });
                this.router.aggregator._previousDepList.push(
                    { _resourceType: PivotReport, flags: ['raw'], resource: report, deferred: $.Deferred().resolve() }
                );
            };

            this.generateMockDataModelPayload = function() {
                this.dataModelDescription = $.extend(true, {}, DATA_MODEL_DESCRIPTION);
                if (this.dataModelIsTemporary) {
                    this.dataModelDescription.sid = DATA_MODEL_NAME;
                }
                if (!this.objectHasIndexTime) {
                    this.dataModelDescription.objects[0].fields = _(this.dataModelDescription.objects[0].fields).reject(function(field) {
                        return field.type === 'timestamp' && field.fieldName === '_time';
                    });
                }
                if (this.objectHasAcceleration) {
                    this.dataModelDescription.objects[0].tsidxNamespace = TSIDX_NAMESPACE;
                }
                if (this.dataModelIsTemporary) {
                    return MockSplunkD.wrapInSplunkdShell({
                        "links": {
                            "alternate": '/servicesNS/admin/search/datamodel/generate/' + DATA_MODEL_NAME
                        },
                        "content": {
                            "description": JSON.stringify(this.dataModelDescription)
                        }
                    });
                }
                return MockSplunkD.wrapInSplunkdShell({
                    "links": {
                        "alternate": DATA_MODEL_ID
                    },
                    "content": {
                        "description": JSON.stringify(this.dataModelDescription)
                    }
                });
            };

            assert.ok(true, 'module setup successful');
        },

        teardown: function() {
            qunitUtils.FakeXhrModule.teardown.call(this);
            this.clock.restore();
            this.classicurl.restore();
            PivotSearch.clearCache();
            assert.ok(true, 'module teardown successful');
        }

    });

    return { BaseModule: BaseModule };

});