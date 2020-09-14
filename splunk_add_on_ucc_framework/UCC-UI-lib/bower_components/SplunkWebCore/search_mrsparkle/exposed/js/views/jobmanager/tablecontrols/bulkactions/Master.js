define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/jobmanager/tablecontrols/bulkactions/ConfirmDeleteModal',
        'views/shared/DropDownMenu',
        'views/shared/JobNotFoundModal',
        'views/shared/TouchJobModal',
        'splunk.i18n',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        Base,
        ConfirmDelete,
        DropDownMenu,
        JobNotFound,
        TouchJob,
        i18n,
        splunkUtil
    )
    {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                this.children.bulkActionControls = new DropDownMenu({
                    className: 'pull-left bulk-action-controls',
                    label: _("Edit Selected").t(),
                    items: this.getBulkActionItems(),
                    dropdownClassName: 'dropdown-menu-narrow'
                });
                
                this.activate();
            },
            
            getBulkActionItems: function() {
                var items = [[
                        {
                            label: _("Resume").t(),
                            value: "resume",
                            enabled: this.hasEditPerms(this.collection.selectedJobs.getPausedJobs())
                        },
                        {
                            label: _("Pause").t(),
                            value: "pause",
                            enabled: this.hasEditPerms(this.collection.selectedJobs.getRunningJobs())
                        },
                        {
                            label: _("Stop").t(),
                            value: "stop",
                            enabled: this.hasEditPerms(this.collection.selectedJobs.getNotDoneJobs())
                        }
                    ],
                    [
                        {
                            label: _("Extend Expiration").t(),
                            value: "touch",
                            enabled: this.hasEditPerms(this.collection.selectedJobs.models)
                        },
                        {
                            label: _("Delete").t(),
                            value: "delete",
                            enabled: this.hasEditPerms(this.collection.selectedJobs.models)
                        }
                    ]];
                
                return items;
            },
            
            hasEditPerms: function(jobsArray) {
                return _.some(jobsArray, function(job) {
                    return job.entry.acl.canWrite();
                });
            },
            
            startListening: function() {
                this.listenTo(this.collection.selectedJobs, 'add remove reset change',  _.debounce(this.render));
                
                this.listenTo(this.children.bulkActionControls, "itemClicked", this.handleBulkMenuItemClicked);
            },
            
            handleBulkMenuItemClicked: function(action) {
                switch (action) {
                    case 'delete':
                        this.children.confirmDelete = new ConfirmDelete({
                            collection: {
                                selectedJobs: this.collection.selectedJobs
                            },
                            onHiddenRemove: true
                        });
                        
                        this.listenTo(this.children.confirmDelete, 'deleteAll', function() {
                            var $deleteDeferred = this.collection.selectedJobs.deleteAll(this.createBulkOptions(true));
                            $.when($deleteDeferred).then(function() {
                                this.children.confirmDelete.hide();
                            }.bind(this));
                        });
                        
                        this.children.confirmDelete.render().appendTo($("body"));
                        this.children.confirmDelete.show();
                        break;
                    case 'touch':
                        this.collection.selectedJobs.touchAll(this.createBulkOptions(
                            false, 
                            {
                                title: _('Extend Job Expiration').t(),
                                action: 'extended'
                            }
                        ));
                        break;
                    case 'pause':
                        this.collection.selectedJobs.pauseAll(this.createBulkOptions(
                            false,
                            { action: 'paused' }
                        ));
                        break;
                    case 'resume':
                        this.collection.selectedJobs.resumeAll(this.createBulkOptions(
                            false,
                            { action: 'resumed' }
                        ));
                        break;
                    case 'stop':
                        this.collection.selectedJobs.stopAll(this.createBulkOptions(
                            false,
                            { action: 'stopped' }
                        ));
                        break;
                }
            },
            
            createBulkOptions: function(ignoreErrors, options) {
                options = options || {};
                options.success = function(collection, response, options) {
                    if (!ignoreErrors && response.messages.length !== 0) {
                        var hasNotFoundError = _.some(response.messages, function(message) {
                            return message.status === 404;
                        });
                        
                        if (hasNotFoundError) {
                            this.children.jobNotFound = new JobNotFound({
                                model: {
                                    application: this.model.application
                                },
                                collection: {
                                    searchJobs: this.collection.selectedJobs
                                }, 
                                title: options.title,
                                action: options.action,
                                onHiddenRemove: true
                            });
                            
                            this.children.jobNotFound.render().appendTo($("body"));
                            this.children.jobNotFound.show();
                            return;
                        }
                    }
                    
                    this.collection.selectedJobs.trigger('refresh');
                    
                    if (options.action === 'extended') {
                        this.children.touch = new TouchJob({
                            model: {
                                application: this.model.application
                            }, 
                            onHiddenRemove: true
                        });
                        
                        this.children.touch.render().appendTo($("body"));
                        this.children.touch.show();
                    }
                    
                }.bind(this);
                return options;
            },
            
            toggleBulkEdit: function() {
                if (this.collection.selectedJobs.length === 0) {
                    this.children.bulkActionControls.disable();
                } else {
                    this.children.bulkActionControls.enable();
                    this.children.bulkActionControls.setItems(this.getBulkActionItems());
                }
            },
            
            render: function() {
                if (!this.$el.html()) {
                    this.children.bulkActionControls.render().appendTo(this.$el);
                    this.$el.append('<span class="selected-count"></span>');
                }
                this.$('.selected-count').html(this.compiledTemplate({
                    _: _,
                    i18n: i18n,
                    splunkUtil: splunkUtil,
                    selectedCount: this.collection.selectedJobs.length
                }));
                this.toggleBulkEdit();
                return this;
            },
            
            template: '\
                <% if (selectedCount) { %>\
                    <%- splunkUtil.sprintf(i18n.ungettext("%s Job selected", "%s Jobs selected", selectedCount), i18n.format_decimal(selectedCount)) %>\
                <% } %>\
            '
        });
    }
);