define([
            'jquery',
            'underscore',
            'models/services/search/Job',
            'mocks/adapters/MockAdapter',
            'mocks/mockify',
            'splunk.util'
        ],
        function(
            $,
            _,
            Job,
            MockAdapter,
            mockify,
            splunkUtil
        ) {

    var MockJob = Job.extend({

        initialize: function(attributes) {
            mockify(this, { dontSpy: 'sync' });
            Job.prototype.initialize.call(this, attributes);
            this._searchLogs = [];
            this._searchString = "*"; 
            this._isRunning = true;
            this._isFinalizing = false;
            this._isQueued = false;
            this._isParsing = false;
            this._latestTimeSafe = '';
            this._isOverAllTime = true;
            this._isPreparing = false;
            this._isUsingSampling = false;
            this._isRealtime = false;
            this._startJobDeferred = $.Deferred();
            this._isReportSearch = true;
            this._isTimelineAvailable = true;
            this._isSummaryAvailable = true;
        },

        register: function() { },
        startPolling: function() { },
        stopPolling: function() { },
        startJob: function() { return this._startJobDeferred; },
        isRunning: function() { return this._isRunning; },
        isFinalizing: function() { return this._isFinalizing; },
        isQueued: function() { return this._isQueued; },
        isParsing: function() { return this._isParsing; },
        isPreparing: function() { return this._isPreparing; },
        isRealtime: function() { return this._isRealtime; },
        isDone: function() { return splunkUtil.normalizeBoolean(this.entry.content.get('isDone')); },
        latestTimeSafe: function() { return this._latestTimeSafe; },
        isOverAllTime: function() { return this._isOverAllTime; },
        isUsingSampling: function() {return this._isUsingSampling; },
        isReportSearch: function() { return this._isReportSearch; },
        pause: function() { return $.Deferred(); },
        unpause: function() { return $.Deferred(); },
        finalize: function() { return $.Deferred(); },
        isTimelineAvailable: function() { return this._isTimelineAvailable; },
        isSummaryAvailable: function() { return this._isSummaryAvailable; },
        getAvailableSearchLogs: function() { return this._searchLogs; },
        getSearch: function() { return this._searchString; }
    },
    {
        // TODO: this is the same code as in MockSplunkDV2
        wrapInSplunkdShell: function(partialResponse) {
            var response = $.extend(true, {}, MockJob.SPLUNKD_SHELL);

            // if the partial response has an 'entry' property, do a full merge with the empty envelope
            if(partialResponse.hasOwnProperty('entry')) {
                // allow the 'entry' to be passed as an object instead of an array
                if(!_(partialResponse.entry).isArray()) {
                    partialResponse.entry = [partialResponse.entry];
                }
                $.extend(true, response, partialResponse);
            }
            // if the partial response has a 'content' property, treat it as an extension to the 'entry'
            else if(partialResponse.hasOwnProperty('content')) {
                $.extend(true, response.entry[0], partialResponse);
            }
            // otherwise, treat the partial response as an extension to the 'content'
            else {
                $.extend(true, response.entry[0].content, partialResponse);
            }
            return response;
        },

        SPLUNKD_SHELL: {
            links: {},
            generator: {},
            paging: {},
            entry: [{
                links: {},
                content: {
                    performance: {},
                    request: {}
                },
                acl: {}
            }]
        }
    });

    return MockJob;

});