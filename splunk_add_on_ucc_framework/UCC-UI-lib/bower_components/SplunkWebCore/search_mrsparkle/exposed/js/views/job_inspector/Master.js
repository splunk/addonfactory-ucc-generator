define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/job_inspector/JobOverview',
        'views/job_inspector/JobExecutionCost',
        'views/job_inspector/job_properties/Master',
        'views/job_inspector/Footer',
        './Master.pcss'
    ],
    function(
        $,
        _,
        module,
        Base,
        FlashMessage,
        JobOverviewView,
        JobExecutionCost,
        SearchJobPropertiesView,
        FooterView,
        css
    ){
        /**
         * @constructor
         * @memberOf views
         * @name JobInspectorView
         * @description
         * @extends {Base}
         */
        return Base.extend(/** @lends views.Base.prototype */{
            moduleId: module.id,
            className: "job-inspector",
            /**
             * @param {Object} options {
             *      model: {
             *         searchJob: <model.search.job>
             *         savedSearch: <model.services.saved.Search>
             *         application: <model.shared.application>
             *         serverInfo: <model.services.server.serverInfo>    
             *      }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                if (this.model.searchJob.isNew()) {
                    this.children.flashMessage = new FlashMessage({ model: this.model.searchJob });
                    this.children.footerView = new FooterView({
                        model: {
                            application: this.model.application,
                            serverInfo: this.model.serverInfo
                        }
                    });
                } else {
                    this.children.jobOverviewView = new JobOverviewView({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application
                        }
                    });
                    this.children.jobExecutionCost = new JobExecutionCost({
                        model: {
                            searchJob: this.model.searchJob
                        }
                    });
                    this.children.searchJobPropertiesView = new SearchJobPropertiesView({
                        model: {
                            searchJob: this.model.searchJob,
                            savedSearch: this.model.savedSearch,
                            application: this.model.application
                        }
                    });
                    this.children.footerView = new FooterView({
                        model: {
                            application: this.model.application,
                            serverInfo: this.model.serverInfo
                        }
                    });
                }
            },
            
            render: function() {
                this.$el.html(this.compiledTemplate({}));
                if (this.model.searchJob.isNew()) {
                    this.children.flashMessage.render().appendTo(this.$el);
                    this.children.footerView.render().appendTo(this.$el);
                } else {
                    this.children.jobOverviewView.render().appendTo(this.$el);
                    this.children.jobExecutionCost.render().appendTo(this.$el);
                    this.children.searchJobPropertiesView.render().appendTo(this.$el);
                    this.children.footerView.render().appendTo(this.$el);
                }
                return this;
            },
            
            template: '\
                <div class="header">\
                    <h1><%- _("Search job inspector").t() %></h1>\
                </div>\
            '
        });
    }
);
