define([
            'util/splunkd_utils'
        ],
        function(
            splunkdUtils
        ) {

    var ErrorPayload = function(type, metadata) {
        this.type = type;
        this.metadata = metadata || {};
    };

    ErrorPayload.TYPES = {
        STRING: 'string-error',
        RAW: 'raw-error',
        DATA_MODEL: 'data-model-error',
        OBJECT: 'object-error',
        REPORT: 'report-error',
        URL: 'url-error',
        COLLECT_JOB: 'collect-job-error',
        PIVOT_SEARCH: 'pivot-search-error',
        SEED_SID: 'seed-sid-error',
        DATASET: 'dataset-error'
    };

    ErrorPayload.fromRawResponse = function(response) {
        var messages = splunkdUtils.xhrErrorResponseParser(response);
        return new ErrorPayload(ErrorPayload.TYPES.RAW, { messages: messages });
    };

    ErrorPayload.fromString = function(messageText) {
        return new ErrorPayload(ErrorPayload.TYPES.STRING, { messageText: messageText });
    };

    return ErrorPayload;
});