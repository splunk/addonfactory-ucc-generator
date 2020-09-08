define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/replace/Value',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        Value,
        ListOverlayControl,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-replace',
            initializeEmptyRequiredColumn: true,
            
            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);
                
                this.children.fieldPicker = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    label: _('Field').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.at(0),
                        modelAttribute: 'id',
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectedValues: this.model.command.requiredColumns.pluck('id'),
                            selectMessage: _('Select a field...').t()
                        },
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });
                
                this.children.fieldPicker.$el.addClass('commandeditor-form-replace-field-selection');
            },
            
            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .add-value': function(e) {
                    e.preventDefault();
                    this.model.command.editorValues.add({
                        oldValue: '',
                        newValue: ''
                    });
                }
            }),
            
            startListening: function() {
                BaseEditorView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.model.command.editorValues, 'add remove reset change', this.updateButtonStates);
                this.listenTo(this.model.command.editorValues, 'add remove reset', this.renderValues);
            },
            
            renderValues: function() {
                var selectedText = this.model.command.get('selectedText');

                // Remove existing values
                _(this.children.values).each(function(value) {
                    value.deactivate({deep: true}).remove();
                }, this);

                // Get the new values
                this.children.values = this.model.command.editorValues.map(function(value) {
                    return new Value({
                        model: {
                            editorValue: value
                        },
                        collection: {
                            editorValues: this.model.command.editorValues
                        }
                    });
                }.bind(this));

                // Render them
                _(this.children.values).each(function(value, idx) {
                    value.render().appendTo(this.$('.commandeditor-section-values'));
                }, this);
            },
            
            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));
                
                this.children.fieldPicker.render().prependTo(this.$('.commandeditor-section-field'));

                this.appendButtons();

                this.renderValues();
                
                return this;
            },
            
            template: '\
                <div class="commandeditor-section-padded commandeditor-section-field"></div>\
                <div class="commandeditor-section-scrolling commandeditor-section-values"></div>\
                <div class="commandeditor-section-padded">\
                    <a href="#" class="add-value"><i class="icon-plus" /> <%= _("Add value...").t() %></a>\
                </div>\
                <div class="commandeditor-section-padded"><%= _("You can include wildcards to match one or multiple terms.").t() %></div>\
            '
        });
    }
);