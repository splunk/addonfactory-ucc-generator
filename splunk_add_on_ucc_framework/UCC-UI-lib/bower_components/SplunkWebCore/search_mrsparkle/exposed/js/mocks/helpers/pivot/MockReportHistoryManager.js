define([], function() {

    return function() {
        this.register = sinon.spy();
        this.unregister = sinon.spy();
        this.applyVisualizationUpdates = sinon.spy();
        this.clearHistory = sinon.spy();
        this.applyConfigUpdates = sinon.stub();
    };

});