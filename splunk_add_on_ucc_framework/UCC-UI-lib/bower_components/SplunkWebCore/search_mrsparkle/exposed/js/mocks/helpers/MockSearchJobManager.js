define(['mocks/models/search/MockJob'], function(MockJob) {

    return function() {
        this.getJobModel = function() {
            return new MockJob();
        };
        this.startNewJob = sinon.spy();
        this.register = sinon.spy();
        this.fetch = sinon.spy();
    };

});