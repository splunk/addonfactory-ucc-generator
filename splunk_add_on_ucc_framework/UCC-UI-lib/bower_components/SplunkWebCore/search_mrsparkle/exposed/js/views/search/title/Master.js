define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/search/actions/Master',
        'views/search/title/SearchName'
    ],
    function(_, module, Base, Actions, SearchName){
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         searchJob: <helpers.ModelProxy>,
             *         report: <models.services.SavedSearch>,
             *         appLocal: <models.services.AppLocal>,
             *         user: <models.services.admin.User>,
             *         tableAST: <models.datasets.TableAST>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                this.children.searchName = new SearchName({
                    model: {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        searchJob: this.model.searchJob
                    }
                });
            },
            activate: function(options){
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                
                this.ensureDeactivated({deep: true});
                                
                this.children.actions = new Actions({
                    model: {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        uiPrefs: this.model.uiPrefs,
                        tableAST: this.model.tableAST
                    },
                    collection: {
                        times: this.collection.times
                    }
                });
                
                this.children.actions.activate({deep: true}).render().prependTo(this.$el);
                this.children.searchName.activate({deep: true}).render();

                return Base.prototype.activate.call(this, clonedOptions);
            },
            deactivate: function(options){
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                
                this.children.actions.remove();
                return this;
            },
            render: function() {
                this.children.searchName.render().appendTo(this.$el);
                return this;
            }
        });
    }
);
