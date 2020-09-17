define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/PolymorphicCommand',
        'models/datasets/commands/Base',
        'views/Base',
        'views/shared/FlashMessages',
        'views/table/commandeditor/editorforms/initialdata/Master',
        'views/table/commandeditor/editorforms/Truncate',
        'views/table/commandeditor/editorforms/join/Master',
        'views/table/commandeditor/editorforms/Rename',
        'views/table/commandeditor/editorforms/replace/Master',
        'views/table/commandeditor/editorforms/sort/Master',
        'views/table/commandeditor/editorforms/Dedup',
        'views/table/commandeditor/editorforms/extracttime/Master',
        'views/table/commandeditor/editorforms/RemoveFields',
        'views/table/commandeditor/editorforms/Rex',
        'views/table/commandeditor/editorforms/filtervalues/Master',
        'views/table/commandeditor/editorforms/RemoveNonNumericalValues',
        'views/table/commandeditor/editorforms/FillValues',
        'views/table/commandeditor/editorforms/Eval',
        'views/table/commandeditor/editorforms/EvalExistingField',
        'views/table/commandeditor/editorforms/rangemap/Master',
        'views/table/commandeditor/editorforms/Search',
        'views/table/commandeditor/editorforms/concatenate/Master',
        'views/table/commandeditor/editorforms/Duplicate',
        'views/table/commandeditor/editorforms/stats/Master',
        'views/table/commandeditor/editorforms/ChangeCase',
        'views/table/commandeditor/editorforms/FilterRegex',
        'views/table/commandeditor/editorforms/AdvancedRex',
        'views/table/commandeditor/editorforms/coalesce/Master',
        'views/table/commandeditor/editorforms/Where',
        'views/table/commandeditor/editorforms/split/Master',
        'views/table/commandeditor/editorforms/calculatefield/Master',
        'views/table/commandeditor/editorforms/Round',
        'views/table/commandeditor/editorforms/Bucket',
        './Master.pcss',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        PolymorphicCommandModel,
        BaseCommandModel,
        BaseView,
        FlashMessages,
        InitialDataFormView,
        TruncateFormView,
        JoinFormView,
        RenameFormView,
        ReplaceFormView,
        SortFormView,
        DedupFormView,
        ExtractTimeFormView,
        RemoveFieldsView,
        RexFormView,
        FilterValuesFormView,
        RemoveNonNumericalValuesFormView,
        FillValuesFormView,
        EvalFormView,
        EvalExistingFieldFormView,
        RangemapFormView,
        SearchFormView,
        ConcatenateFormView,
        DuplicateFormView,
        StatsFormView,
        ChangeCaseFormView,
        FilterRegexFormView,
        AdvancedRexFormView,
        CoalesceFormView,
        WhereFormView,
        SplitFormView,
        CalculateFieldFormView,
        RoundFormView,
        BucketFormView,
        css,
        splunkUtil
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click a.commandeditor-collapse': function(e) {
                    e.preventDefault();
                    this._setAndSaveCollapsedState();
                }
            },

            startListening: function() {
                this.listenTo(this.model.state, 'commandApplied', function() {
                    this._setAndSaveCollapsedState();
                });
            },

            activate: function() {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                if (this.$el.html()) {
                    this.renderEditor();
                }

                return BaseView.prototype.activate.apply(this, arguments);
            },

            createNewEditorForm: function() {
                var formView, options;

                switch (this.model.command.get('type')) {
                    case BaseCommandModel.INITIAL_DATA:
                        formView = InitialDataFormView;
                        break;
                    case BaseCommandModel.SORT:
                        formView = SortFormView;
                        break;
                    case BaseCommandModel.TRUNCATE:
                        formView = TruncateFormView;
                        break;
                    case BaseCommandModel.JOIN:
                        formView = JoinFormView;
                        break;
                    case BaseCommandModel.RENAME:
                        formView = RenameFormView;
                        break;
                    case BaseCommandModel.REPLACE:
                        formView = ReplaceFormView;
                        break;
                    case BaseCommandModel.DEDUP:
                        formView = DedupFormView;
                        break;
                    case BaseCommandModel.EXTRACT_DATE_TIME:
                        formView = ExtractTimeFormView;
                        break;
                    case BaseCommandModel.REMOVE:
                        formView = RemoveFieldsView;
                        break;
                    case BaseCommandModel.REX:
                        formView = RexFormView;
                        break;
                    case BaseCommandModel.FILTER_VALUES:
                        formView = FilterValuesFormView;
                        break;
                    case BaseCommandModel.REMOVE_NON_NUMERICAL_VALUES:
                        formView = RemoveNonNumericalValuesFormView;
                        break;
                    case BaseCommandModel.FILL_VALUES:
                        formView = FillValuesFormView;
                        break;
                    case BaseCommandModel.EVAL:
                        formView = EvalFormView;
                        break;
                    case BaseCommandModel.EVAL_EXISTING_FIELD:
                        formView = EvalExistingFieldFormView;
                        break;
                    case BaseCommandModel.RANGEMAP:
                        formView = RangemapFormView;
                        break;
                    case BaseCommandModel.SEARCH:
                        formView = SearchFormView;
                        break;
                    case BaseCommandModel.CONCATENATE:
                        formView = ConcatenateFormView;
                        break;
                    case BaseCommandModel.DUPLICATE:
                        formView = DuplicateFormView;
                        break;
                    case BaseCommandModel.STATS:
                        formView = StatsFormView;
                        break;
                    case BaseCommandModel.CHANGE_CASE:
                        formView = ChangeCaseFormView;
                        break;
                    case BaseCommandModel.FILTER_REGEX:
                        formView = FilterRegexFormView;
                        break;
                    case BaseCommandModel.ADVANCED_REX:
                        formView = AdvancedRexFormView;
                        break;
                    case BaseCommandModel.COALESCE:
                        formView = CoalesceFormView;
                        break;
                    case BaseCommandModel.WHERE:
                        formView = WhereFormView;
                        break;
                    case BaseCommandModel.SPLIT:
                        formView = SplitFormView;
                        break;
                    case BaseCommandModel.CALCULATE_FIELD:
                        formView = CalculateFieldFormView;
                        break;
                    case BaseCommandModel.BUCKET:
                        formView = BucketFormView;
                        break;
                    case BaseCommandModel.ROUND:
                        formView = RoundFormView;
                        break;
                }

                // Using _'s extend is a conscious decision here. We don't want new pointers to all the
                // models and collections.
                return new formView(_.extend({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        config: this.model.config,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        table: this.model.table,
                        tableAST: this.model.tableAST,
                        user: this.model.user,
                        currentPointJob: this.model.currentPointJob
                    },
                    collection: {
                        appLocals: this.collection.appLocals
                    }
                }, options));
            },

            renderEditor: function() {
                if (this.children.editorForm) {
                    this.children.editorForm.deactivate({deep: true}).remove();
                    delete this.children.editorForm;
                }
                this.children.editorForm = this.createNewEditorForm();

                if (this.children.flashMessages) {
                    this.children.flashMessages.deactivate({deep: true}).remove();
                    delete this.children.flashMessages;
                }

                this.children.flashMessages = new FlashMessages({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine
                    }
                });

                this.$('.header-text').text(this.model.command.getDisplayName());

                this.children.flashMessages.activate({deep: true}).render().appendTo(this.$('.commandeditor-header'));
                this.children.editorForm.activate({deep: true}).render().insertAfter(this.$('.commandeditor-header'));

                this.$el.removeClass('commandeditor-prompt-for-input');

                if (this._shouldShowEditor()) {
                    this._setExpandedState();
                } else {
                    this._setCollapsedState();
                }
            },

            _shouldShowEditor: function() {
                var showEditor = splunkUtil.normalizeBoolean(this.model.table.entry.content.get('dataset.display.showEditor')),
                    isComplete = this.model.command.isComplete(),
                    isModalized = this.model.command.isModalized;
                // Never show editor on render if command has a modal, unless user explicitly uncollapses the editor.
                return (showEditor || (!isComplete && !isModalized));
            },

            _setCollapsedState: function() {
                if (!this.$el.hasClass('collapsed')) {
                    this.$el.addClass('collapsed');

                    this.children.editorForm.undelegateEvents();
                }
                // sanity check to make sure we haven't already bound this click listener since _setCollapsedState can be called
                // independent of _setExpandedState
                this.$el.off('click.commandeditor-expand');
                this.$el.on('click.commandeditor-expand', function(e) {
                    e.preventDefault();

                    this._setAndSaveExpandedState();
                }.bind(this));
            },

            _setExpandedState: function() {
                if (this.$el.hasClass('collapsed')) {
                    this.$el.removeClass('collapsed');

                    this.children.editorForm.delegateEvents();
                }

                // Never bounce editor if rendering after coming out of a modal
                if (!this.model.command.isComplete() && !this.model.command.isModalized) {
                    this.$el.removeClass('commandeditor-prompt-for-input').width(); // force draw
                    this.$el.addClass('commandeditor-prompt-for-input');

                    this.children.editorForm.focusFirstInput();
                }

                this.$el.off('click.commandeditor-expand');

            },

            _setAndSaveExpandedState: function() {
                this.model.table.entry.content.set('dataset.display.showEditor', '1');
                this._setExpandedState();
            },

            _setAndSaveCollapsedState: function() {
                this.model.table.entry.content.set('dataset.display.showEditor', '0');
                this._setCollapsedState();
            },

            render: function() {
                this.$el.html(this.compiledTemplate());

                this.renderEditor();

                return this;
            },

            template: '\
                <div class="commandeditor-header">\
                    <h3 class="header-text"></h3>\
                    <a href="#" class="commandeditor-collapse">\
                        <i class="icon-chevron-left"></i>\
                        <i class="icon-chevron-left"></i>\
                    </a>\
                    <a href="#" class="commandeditor-expand">\
                        <i class="icon-pencil"></i>\
                    </a>\
                </div>\
            '
        });
    }
);