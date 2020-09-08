define(['underscore', 'backbone', 'mocks/adapters/MockAdapter'], function(_, Backbone, MockAdapter) {

    return function(object, options) {
        options = options || {};
        var dontSpyList = options.dontSpy || [];
        dontSpyList = _(dontSpyList).isArray() ? dontSpyList : [dontSpyList];

        _(_(object).functions()).each(function(fnName) {
            if(_(dontSpyList).indexOf(fnName) === -1) {
                object[fnName] = sinon.spy(object, fnName);
            }
        }, this);

        if(!options.dontMockSync && (object instanceof Backbone.Model || object instanceof Backbone.Collection)) {
            object.sync = new MockAdapter();
        }
    };

});