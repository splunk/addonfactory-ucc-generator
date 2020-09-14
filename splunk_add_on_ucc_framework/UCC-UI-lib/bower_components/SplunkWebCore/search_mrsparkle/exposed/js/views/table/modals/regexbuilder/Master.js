define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/RegexBuilder',
        'models/search/Job',
        'collections/datasets/Columns',
        'views/Base',
        'views/table/modals/regexbuilder/StartAfterSection',
        'views/table/modals/regexbuilder/ExtractSection',
        'views/table/modals/regexbuilder/StopBeforeSection',
        'views/table/modals/regexbuilder/RegexTable',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        $,
        _,
        module,
        RegexBuilderModel,
        JobModel,
        ColumnsCollection,
        BaseView,
        StartAfterSection,
        ExtractSection,
        StopBeforeSection,
        RegexTable,
        ControlGroup,
        FlashMessages,
        splunkdUtils,
        css
    ) {
        return BaseView.extend({
            module: module.id,
            className: 'extract',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var regexBuilderParams = {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        sid: this.model.currentPointJob.id,
                        fieldName: this.options.fieldName,
                        isEditing: this.options.isEditing
                    },
                    selectionObject = this.model.command.editorValues.first();

                if (!this.options.isEditing) {
                    // Pass in text selection information when creating new regex
                    regexBuilderParams = _.extend(regexBuilderParams, {
                        startPosition: selectionObject.get('startPosition'),
                        endPosition: selectionObject.get('endPosition'),
                        fullText: selectionObject.get('fullText'),
                        selectedText: selectionObject.get('selectedText')
                    });
                }

                this.model.regexBuilder = new RegexBuilderModel(regexBuilderParams);

                this.setInitialState();

                this.children.flashMessages = new FlashMessages({
                    model: {
                        currentPointJob: this.model.currentPointJob,
                        command: this.model.command
                    }
                });
                this.regexErrorMessageId = _.uniqueId('regex-error-');

                this.children.newFieldName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'newFieldName',
                        model: this.model.command,
                        updateOnKeyUp: true
                    },
                    label: _('New Field Name').t()
                });
            },

            events: {
                'click .cancel': function(e) {
                    e.preventDefault();
                    this.model.command.trigger('commandAborted');
                    this.deactivate({ deep: true }).remove();
                },
                'click .apply:not(.disabled)': function(e) {
                    e.preventDefault();

                    if (this.model.command.isValid(true)) {
                        this.deactivate({ deep: true }).remove();

                        // We no longer need text selection data as we are persisting regex rules on the command model
                        this.model.command.editorValues.reset();
                        this.model.command.trigger('handleApply');
                    }
                }
            },

            startListening: function(options) {
                this.listenTo(this.model.command, 'change:newFieldName', this.toggleApplyButton);
                this.listenTo(this.model.command, 'change:regExpStarting change:regExpExtraction change:regExpStopping',
                    function() { this._waitForCurrentPointJobPrepared(this.updateRegexMatches); }
                );
            },

            // We need access to the table's state so we set the command model's initial state here in the editor
            setInitialState: function() {
                var requiredColumn;
                // New Regex being Added
                if (!this.options.isEditing && !this.model.command.requiredColumns.length) {
                    requiredColumn = this.model.table.commands.last().columns.findWhere({ name: this.options.fieldName });
                    if (requiredColumn && requiredColumn.id) {
                        this.model.command.requiredColumns.add({
                            id: requiredColumn.id
                        });
                    }
                }
            },

            createRulesSections: function(rulesDict) {
                this.children.startAfterSection = new StartAfterSection({
                    model: {
                        command: this.model.command
                    },
                    startRules: this.model.regexBuilder.getRulesObjects(rulesDict, this.model.regexBuilder.START)
                });
                this.children.startAfterSection.activate({ deep: true }).render().$el.appendTo(this.$('.extract-sidebar'));

                this.children.extractSection = new ExtractSection({
                    model: {
                        command: this.model.command
                    },
                    extractRules: this.model.regexBuilder.getRulesObjects(rulesDict, this.model.regexBuilder.EXTRACT)
                });
                this.children.extractSection.activate({ deep: true }).render().$el.appendTo(this.$('.extract-sidebar'));

                this.children.stopBeforeSection = new StopBeforeSection({
                    model: {
                        command: this.model.command
                    },
                    stopRules: this.model.regexBuilder.getRulesObjects(rulesDict, this.model.regexBuilder.STOP)
                });
                this.children.stopBeforeSection.activate({ deep: true} ).render().$el.appendTo(this.$('.extract-sidebar'));
            },

            createRegexTable: function() {
                this.children.regexTable = new RegexTable({
                    model: {
                        command: this.model.command,
                        resultJsonRows: this.model.resultJsonRows,
                        regexBuilder: this.model.regexBuilder,
                        currentPointJob: this.model.currentPointJob
                    },
                    fieldName: this.options.fieldName,
                    jobDispatchEl: this.$('.extract-table-wrapper')
                });

                this.children.regexTable.activate({ deep: true }).render().$el.appendTo(this.$('.extract-table-wrapper'));
            },

            _waitForCurrentPointJobPrepared: function(functionToCall) {
                // Current point job doesn't always have an id, which the RegexBuilder Model depends on
                // to make a valid call to the regex builder endpoint. We must therefore wait for the id
                // to be populated before calling fetch on the RegexBuilder Model, if there isn't an id.
                if (this.model.currentPointJob.prepared) {
                    functionToCall.apply(this);
                } else {
                    this.listenToOnce(this.model.currentPointJob, 'prepared', function() {
                        this.model.regexBuilder.set({ sid: this.model.currentPointJob.id });
                        functionToCall.apply(this);
                    });
                }
            },

            updateRegexMatches: function() {
                if (this.children.regexTable) {
                    var fetchDfd = this.model.regexBuilder.fetchMatchedEvents(this.model.command);
                    this.hideTable();
                    this.hideNewFieldName();
                    this.showTableLoading();
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage(this.regexErrorMessageId);

                    fetchDfd.done(_.bind(function(matches) {
                        if (_.isString(matches)) {
                            // Server returned an error message
                            this.children.flashMessages.flashMsgHelper.addGeneralMessage(this.regexErrorMessageId, {
                                type: splunkdUtils.ERROR,
                                html: _('No matched events.').t()
                            });
                            this.hideTableLoading();
                            this.hideSidebarLoading();
                            this.disableApply();
                        } else {
                            this.hideTableLoading();
                            this.showTable();
                            this.children.regexTable.highlightRegexMatches(matches);
                            this.showNewFieldName();
                            this.toggleApplyButton();
                        }

                    }, this));
                    fetchDfd.fail(_.bind(function() {
                        // There was a problem fetching the highlighted preview events,
                        // so prevent the user from applying changes
                        this.hideTableLoading();
                        this.hideSidebarLoading();
                        this.disableApply();
                    }, this));
                }
            },

            toggleApplyButton: function() {
                var hasApplicableChanges = this.model.command.isDirty(this.model.commandPristine) ||
                    !this.model.command.isComplete();
                if (this.model.command.get('newFieldName') && hasApplicableChanges) {
                    this.enableApply();
                } else {
                    this.disableApply();
                }
            },

            hideSidebarLoading: function() {
                this.$('.sidebar-loading-message').css('display', 'none');
            },

            showSidebarLoading: function() {
                this.$('.sidebar-loading-message').css('display', '');
            },

            hideTableLoading: function() {
                this.$('.table-loading-message').css('display', 'none');
            },

            showTableLoading: function() {
                this.$('.table-loading-message').css('display', '');
            },

            showTable: function() {
                this.children.regexTable.$el.css('display', '');
            },

            hideTable: function() {
                this.children.regexTable.$el.css('display', 'none');
            },

            enableApply: function() {
                this.$('.btn-pill.apply').removeClass('disabled');
            },

            showNewFieldName: function() {
                this.children.newFieldName.$el.show();
            },

            disableApply: function() {
                this.$('.btn-pill.apply').addClass('disabled');
            },

            hideNewFieldName: function() {
                this.children.newFieldName.$el.hide();
            },

            renderRules: function() {
                var rulesDfd;
                // There are previous regex rules. Generate new rule suggestions based on previous rules.
                if (this.model.command.hasRegexRules()) {
                    rulesDfd = this.model.regexBuilder.fetchExistingRegexRules(this.model.command);

                    // There are no previous regex rules. Generate new rules based on text selection.
                } else {
                    rulesDfd = this.model.regexBuilder.fetchNewRegexRules();
                }

                this.hideNewFieldName();

                rulesDfd.done(_.bind(function(rulesDict) {
                    // No need to check for error message as rules dict will always be returned, even if empty
                    this.hideSidebarLoading();
                    this.createRulesSections(rulesDict);
                    this.createRegexTable();
                    this.updateRegexMatches();
                    this.showNewFieldName();
                    this.toggleApplyButton();
                }, this));

                rulesDfd.fail(_.bind(function() {
                    // There was a problem fetching the suggested regex rules
                    // so prevent the user from applying changes
                    this.hideTableLoading();
                    this.hideSidebarLoading();
                    this.disableApply();
                }, this));

                this.children.flashMessages.activate({deep: true}).render().appendTo(this.$('.flash-messages-container'));

                this.children.newFieldName.activate({ deep : true }).render().$el.insertBefore(this.$('.cancel'));
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));

                    this.showSidebarLoading();

                    this._waitForCurrentPointJobPrepared(this.renderRules);
                }

                return this;
            },

            template: '\
                <div class="modal-backdrop extract-modal-backdrop"></div>\
                <div class="extract-sidebar">\
                    <div class="sidebar-loading-message" style="display: none"><%- _("Loading...").t() %></div>\
                </div>\
                <div class="extract-table-wrapper">\
                    <div class="flash-messages-container"></div>\
                    <div class="table-loading-message" style="display: none"><%- _("Loading...").t() %></div>\
                </div>\
                <div class="extract-form form-horizontal">\
                    <a class="btn-pill cancel"><%= _("Cancel").t() %></a>\
                    <a class="btn-pill apply"><%= _("Apply").t() %></a>\
                </div>\
            '
        });
    }
);