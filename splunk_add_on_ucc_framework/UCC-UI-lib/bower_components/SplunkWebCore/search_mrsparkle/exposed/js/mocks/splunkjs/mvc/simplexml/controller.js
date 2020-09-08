define(['underscore', 'backbone'], function(_, Backbone) {
    var MockDashboardController = function() {
        this.model = new Backbone.Model({ edit: false });
        this.model.view = new Backbone.Model();
        this.model.app = new Backbone.Model();
        this.model.user = new Backbone.Model();
        this.collection = {};
        this.collection.times = new Backbone.Collection();
    };
    _.extend(MockDashboardController.prototype, Backbone.Events, {
        onViewModelLoad: function(cb, scope) {
            _.defer(function(){
                scope ? cb.apply(scope, this.model.view) : cb(this.model.view);
            });
        },
        getStateModel: function() {
            return this.model;
        },
        isEditMode: function() {
            return this.model.get('edit') === true;
        },
        onReady: function(callback) {
            callback();
        },
        isReady: function() {
            return true;
        },
        ready: function() {},
        reset: function() {
            this.model.clear();
            this.model.set({ edit: false });
            _([this.model.view, this.model.app, this.model.user]).invoke('clear');
        }
    });

    return new MockDashboardController();
});
