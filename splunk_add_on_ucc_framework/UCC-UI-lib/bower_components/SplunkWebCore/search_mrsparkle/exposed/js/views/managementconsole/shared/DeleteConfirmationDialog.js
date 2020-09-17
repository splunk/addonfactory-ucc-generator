define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'views/shared/basemanager/DeleteDialog',
        'views/managementconsole/shared/TopologyProgressControl',
        './DeleteConfirmationDialog.pcss'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        BaseManagerDeleteDialog,
        TopologyProgressControl,
        css
    ) {
        return BaseManagerDeleteDialog.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseManagerDeleteDialog.prototype.initialize.call(this, options);
                this.doDefault = false;

                this.compiledTaskProgressTemplate = _.template(this.taskProgressTemplate);

                if(!_.isUndefined(this.options.task)) {
                    this.children.progressControl = new TopologyProgressControl({
                        buttonHidden: true,
                        model: {
                            topologyTask: this.options.task
                        }
                    });

                    this.listenTo(this.options.task.entry, 'change:name', _.debounce(this._renderProgressControl.bind(this)));
                    this.listenTo(this.options.task, 'taskFinished', this.onTaskFinished);
                }
            },

            makeTitle: function() {
                return splunkUtil.sprintf(_('%s %s').t(),
                    _.escape(this.options.dialogButtonLabel),
                    _.escape(this.options.entitySingular)
                );
            },

            makeDeleteBody: function() {
                return splunkUtil.sprintf(_('Are you sure you want to %s the %s <b>%s</b>? It will no longer be available after.').t(),
                    _.escape(this.options.dialogButtonLabel.toLowerCase()),
                    _.escape(this.options.entitySingular.toLowerCase()),
                    _.escape(this.targetEntity.entry.get('name'))
                );
            },

            primaryButtonClicked: function() {
                // DeleteDialog does not wait for the ajax request before it removes the instance from its collection,
                // This will be a issue if the server sends an error , the UI would have already deleted the instance even
                // if the server failed. Fix here is to set 'wait' to true.
                this._toggleButton('.btn-dialog-primary', false);
                this.targetEntity.destroy({wait: true})
                    .fail(this.onActionFail.bind(this))
                    .done(this.onActionSuccess.bind(this));
                this.trigger("click:primaryButton", this);
            },

            onActionSuccess: function() {
                _.isFunction(this.options.onActionSuccess) && this.options.onActionSuccess.apply(this, arguments);
                // Close dialog immediately if the delete action doesn't involve a task workflow
                if(_.isUndefined(this.options.task)) {
                    this.closeDialog();
                } else {
                    this._toggleButton('.btn-dialog-close', false);
                    this._toggleButton('.btn-dialog-cancel', false);
                }
            },

            onActionFail: function() {
                this._toggleButton('.btn-dialog-primary', true);
                this._toggleButton('.btn-dialog-close', true);
                this._toggleButton('.btn-dialog-cancel', true);
                return;
            },

            onTaskFinished: function() {
                var taskState = this.options.task.entry.content.get('state');
                if (taskState === 'completed') {
                    this.closeDialog();
                } else {
                    this.onActionFail();
                }
            },

            _toggleButton: function(btn, enabled) {
                if (enabled) {
                    this.$(btn).removeClass('disabled');
                    this.$(btn).prop('disabled', false);
                } else {
                    this.$(btn).addClass('disabled');
                    this.$(btn).prop('disabled', true);
                }
            },

            render: function() {
                BaseManagerDeleteDialog.prototype.render.call(this);

                if(!_.isUndefined(this.options.task)) {
                    this.$('.modal-body').append("<div class='progress-section'></div>");
                    this.$('.progress-section').html(this.compiledTaskProgressTemplate());
                    this._renderProgressControl();
                }
            },

            _renderProgressControl: function() {
                var taskId = this.options.task.entry.get('name');
                if (taskId) {
                    this.children.progressControl.setTaskId(taskId);
                    this.$('.progress-text').show();
                } else {
                    this.$('.progress-text').hide();
                }
                this.children.progressControl.render().$el.appendTo(this.$('.progress-placeholder'));
            },

            taskProgressTemplate: '\
                <div class="progress-placeholder"><div class="progress-text pull-right"><%- _("Removing...").t() %></div></div>\
            '
        });
    });