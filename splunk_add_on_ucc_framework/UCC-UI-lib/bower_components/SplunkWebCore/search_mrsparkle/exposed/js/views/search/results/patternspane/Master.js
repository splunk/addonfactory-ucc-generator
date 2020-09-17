define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/search/results/patternspane/ParentJobDispatchState',
        'views/search/results/patternspane/patterns/Master',
        './Master.pcss'
    ],
    function($, _, module, Base, ParentJobDispatchState, Patterns, css){
        return Base.extend({
            moduleId: module.id,
            className: 'tab-pane tab-pane-patterns',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.patterns = new Patterns({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        times: this.collection.times
                    }
                });

                this.children.parentJobDispatchState = new ParentJobDispatchState({
                    model: {
                        searchJob: this.model.searchJob,
                        report: this.model.report
                    }
                });
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, 'jobProgress', this.visibility);
            },

            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                this.canPattern = false;
                this.visibility();
                return Base.prototype.activate.apply(this, arguments);
            },

            visibility: function() {
                if (!this.canPattern && this.model.searchJob.isPatternable()) {
                    this.canPattern = true;
                    this.children.patterns.activate({deep: true}).$el.show();
                    this.children.parentJobDispatchState.deactivate({deep: true}).$el.hide();
                } else if (!this.canPattern) {
                    this.children.parentJobDispatchState.activate({deep: true}).$el.show();
                    this.children.patterns.deactivate({deep: true}).$el.hide();
                }
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.children.patterns.render().appendTo(this.$el);
                    this.children.parentJobDispatchState.render().appendTo(this.$el);
                }
                return this;
            }
        });
    }
);
