define(['mocks/views/MockView', 'backbone'], function (MockView, Backbone) {
    var instanceCount = 0;
    return MockView.extend({
        initialize: function (opts) {
            instanceCount++;
            this.settings = new Backbone.Model();
            this.settings.set(opts);
            this._children = [];
            MockView.prototype.initialize.apply(this, arguments);
        },
        addChild: function (child) {
            this._children.push(child);
        },
        applySettings: function (settings) {
            this.settings.set(settings);
        },
        container: true
    }, {
        instanceCount: function () {
            return instanceCount;
        }
    });
});