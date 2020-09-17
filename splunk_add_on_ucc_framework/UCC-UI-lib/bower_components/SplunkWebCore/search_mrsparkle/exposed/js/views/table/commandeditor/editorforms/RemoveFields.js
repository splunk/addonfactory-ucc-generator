define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/RequiredColumn',
        'views/Base',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Master',
        'views/table/modals/FieldRemovalDialog'
    ],
    function(
        $,
        _,
        module,
        RequiredColumnModel,
        BaseView,
        BaseEditorView,
        ListPicker,
        FieldRemovalDialog
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-removefields',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);
                this.setUpListPicker();
            },

            startListening: function() {
                BaseEditorView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.children.listPicker, 'selectionDidChange', this.handleSelectionDidChange);
            },

            setUpListPicker: function() {
                this.children.listPicker = new ListPicker({
                    items: this.getFieldPickerItems(),
                    selectedValues: this.model.command.requiredColumns.pluck('id'),
                    multiselect: true,
                    multiselectMessage: _('Select fields...').t(),
                    selectedIcon: 'x'
                });
            },

            handleSelectionDidChange: function() {
                var selectedFields = this.children.listPicker.getSelectedValues(),
                    callback = function() {
                        // Set the columns from the previous command columns, removing any selected columns from the listpicker
                        this.model.command.columns.set(this.model.commandPristine.filterRemovedColumns(selectedFields));

                        this.model.command.requiredColumns.set(_.map(selectedFields, function(value) {
                            return { id: value };
                        }));
                    }.bind(this),
                    challengeFields = this.model.table.commands.validateSubsequentCommands(
                        selectedFields,
                        this.model.table.getCurrentCommandIdx()
                    ),
                    challengeGuids;

                if (challengeFields) {
                    challengeGuids = _.pluck(challengeFields, 'id');
                    this.children.listPicker.setSelectedValues(_.difference(selectedFields, challengeGuids));

                    this.children.fieldRemovalDialog && this.children.fieldRemovalDialog.remove();
                    this.children.fieldRemovalDialog = new FieldRemovalDialog({
                        fields: _.invoke(challengeFields, 'get', 'name')
                    });
                    this.children.fieldRemovalDialog.render().appendTo($('body')).show();
                    this.listenTo(this.children.fieldRemovalDialog, 'accepted', function() {
                        this.children.listPicker.setSelectedValues(selectedFields);
                        callback();
                    });
                } else {
                    callback();
                }
            },

            handleApply: function(options) {
                var previousCommand = this.model.table.commands.getPreviousCommand(this.model.commandPristine);
                options = options || {};
                options.updateSPLOptions = {
                    previousCommand: previousCommand
                };
                BaseEditorView.prototype.handleApply.call(this, options);
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.appendButtons();
                this.children.listPicker.render().prependTo(this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR));
                return this;
            }
        });
    }
);