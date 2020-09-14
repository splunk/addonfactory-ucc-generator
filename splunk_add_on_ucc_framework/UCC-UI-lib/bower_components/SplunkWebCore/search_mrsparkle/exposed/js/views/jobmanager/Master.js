define(
    [
        'underscore',
        'jquery',
        'module',
        'collections/search/Jobs',
        'models/Base',
        'views/Base',
        'views/jobmanager/table/Master',
        'views/jobmanager/tablecontrols/Master',
        'splunk.util',
        'uri/route',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        JobsCollection,
        BaseModel,
        Base,
        Table,
        TableControls,
        splunkUtil,
        route,
        css
    )
    {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.collection.selectedJobs = new JobsCollection();
                this.model.checkAllCheckbox = new BaseModel();
                
                this.children.tableControls = new TableControls({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        state: this.model.state
                    },
                    collection: {
                        jobs: this.collection.jobs,
                        users: this.collection.users,
                        apps: this.collection.apps,
                        selectedJobs: this.collection.selectedJobs
                    }
                });

                this.children.table = new Table({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        state: this.model.state,
                        checkAllCheckbox: this.model.checkAllCheckbox
                    },
                    collection: {
                        jobs: this.collection.jobs,
                        apps: this.collection.apps
                    }
                });

                this.activate();
            },

            startListening: function() {
                this.listenTo(this.model.state, 'bulk-action-reset', function() {
                    this.collection.jobs.trigger('refresh');
                });
                
                this.listenTo(this.collection.selectedJobs, 'refresh', function() {
                    this.collection.jobs.trigger('refresh');
                });

                this.listenTo(this.collection.jobs, 'change:selected', _.debounce(function() {
                    this.collection.selectedJobs.set(this.collection.jobs.filter(function(job) {
                        return job.get('selected');
                    }));
                    
                    var writableJobs = this.collection.jobs.filter(function(job) {
                        return job.entry.acl.canWrite('selected');
                    });

                    if (this.collection.selectedJobs.length === writableJobs.length) {
                        this.model.checkAllCheckbox.set('selectAll', 1);
                    } else {
                        this.model.checkAllCheckbox.set('selectAll', 0);
                    }
                }));

                this.listenTo(this.collection.jobs, 'reset', function() {
                    this.collection.selectedJobs.reset();
                    this.model.checkAllCheckbox.set('selectAll', 0);
                });
            },

            render: function() {
                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.jobs.about'
                );
                
                this.$el.html(this.compiledTemplate({docUrl: docUrl}));
                this.children.tableControls.render().appendTo(this.$el);
                this.children.table.render().appendTo(this.$el);
                return this;
            },

            template: '\
                <div class="section-header section-padded">\
                    <h1 class="section-title"><%- _("Jobs").t() %></h1>\
                    <div>\
                        <%- _("Manage your jobs.").t() %>\
                        <a href="<%- docUrl %>" target="_blank" class="help-link"><%- _("Learn More").t() %> <i class="icon-external"></i></a>\
                    </div>\
                </div>\
                <div class="divider"></div>\
            '
        });
    }
);