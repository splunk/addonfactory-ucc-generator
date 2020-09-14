define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/listpicker/Overlay',
        'splunk.util'
    ],
    function(
        _,
        module,
        BaseView,
        ListPickerOverlay,
        splunkUtils
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.children.firstOverlay = new ListPickerOverlay({
                    multiselect: false,
                    required: false,
                    selectedValues: [ this.options.firstSelection ],
                    selectMessage: _('Join on field in table...').t(),
                    items: this.options.firstListItems,
                    slideOutOnChange: false,
                    additionalClassNames: 'field-listpicker'
                });
            },

            startListening: function(options) {
                this.listenTo(this.children.firstOverlay, 'selectionDidChange', this.handleFirstSelectionDidChange);
            },

            handleFirstSelectionDidChange: function() {
                var firstSelectionLabel = this.children.firstOverlay.getSelectedLabel();
                if (this.children.secondOverlay) {
                    this.children.secondOverlay.deactivate({deep: true}).remove();
                }

                this.children.secondOverlay = new ListPickerOverlay({
                    multiselect: false,
                    required: false,
                    selectMessage: splunkUtils.sprintf(_('Join where %s matches...').t(), firstSelectionLabel),
                    items: this.options.secondListItems,
                    selectedValues: [ this.options.secondSelection ],
                    additionalClassNames: 'join-listpicker'
                });

                this.children.secondOverlay.render().$el.appendTo(this.$el.closest('.commandeditor-form-join'));
                this.children.secondOverlay.slideIn();

                this.listenTo(this.children.secondOverlay, 'selectionDidChange', this.handleSecondSelectionDidChange);
            },

            handleSecondSelectionDidChange: function() {
                var firstSelection = this.children.firstOverlay.getSelectedItem(),
                    secondSelection = this.children.secondOverlay.getSelectedItem(),
                    selectedColumnInColumnsCollection = this.model.command.columns.get(firstSelection.value),
                    selectedColumnInRequiredColumnsCollection = this.model.command.requiredColumns.get(firstSelection.value);

                if (!selectedColumnInRequiredColumnsCollection) {
                    // Even though the user didn't "select" this column, we're considering it part of the selection.
                    this.model.command.requiredColumns.add({ id: selectedColumnInColumnsCollection.get('id') });
                    selectedColumnInRequiredColumnsCollection = this.model.command.requiredColumns.get(firstSelection.value);
                }

                if (this.options.firstSelection &&
                    (this.options.firstSelection !== selectedColumnInColumnsCollection.id)) {
                    // The user actually changed their selection from one column in their table to another. So, we must
                    // remove the previously selected column from the list of selected columns.
                    this.model.command.requiredColumns.remove({ id: selectedColumnInColumnsCollection.id });
                }

                selectedColumnInRequiredColumnsCollection.set('columnToJoinWith', secondSelection.value);
                this.children.firstOverlay.deactivate({deep: true}).remove();
            },

            onAddedToDocument: function() {
            
                this.children.firstOverlay.render().$el.appendTo(this.$el.closest('.commandeditor-form-join'));
                this.children.firstOverlay.slideIn();
                
                if (this.model.command.isNew() && this.options.firstSelection) {
                    this.handleFirstSelectionDidChange();
                }
            },

            render: function() {
                return this;
            }
        });
    }
);