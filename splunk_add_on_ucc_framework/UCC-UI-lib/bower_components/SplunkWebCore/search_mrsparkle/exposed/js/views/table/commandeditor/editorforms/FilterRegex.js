define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/TextareaControl',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ListOverlayControl,
        TextareaControl,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-filter-regex',
            initializeEmptyRequiredColumn: true,
            
            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);
                
                this.children.field = new ControlGroup({
                    label: _('Field').t(),
                    controlType: 'ListOverlay',
                    controlTypes: { 'ListOverlay': ListOverlayControl },
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.first(),
                        modelAttribute: 'id',
                        toggleClassName: 'btn-overlay-toggle',
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectMessage: _('Select a field...').t()
                        }
                    }
                });
                
                this.children.regexBox = new TextareaControl({
                    model: this.model.command,
                    modelAttribute: 'regex',
                    size: 'small',
                    className: 'regex-box',
                    placeholder: _('enter regular expression...').t()
                });

                this.children.regexControl = new ControlGroup({
                    controlType: 'Textarea',
                    label: _('Regular expression').t(),
                    size: 'small',
                    controls: this.children.regexBox
                });
            },
            
            events: $.extend({}, BaseEditorView.prototype.events, {
                'keyup textarea': function(e) {
                    this.onInputChange(e);
                }
            }),
            
            onInputChange: function(e) {
                var inputValue = this.children.regexBox.$('textarea').val();
                this.children.regexBox.setValue(inputValue, false);
            },
            
            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _,
                        helpLink: this.getHelpLink('learnmore.about.regex')
                    }));
                    
                    this.appendButtons();
                    
                    this.children.field.render().appendTo(this.$('.controls-section'));
                    this.children.regexControl.render().appendTo(this.$('.controls-section'));
                }
                
                return this;
            },
            
            template: '\
                <div class="commandeditor-section-padded controls-section"></div>\
                    <div class="commandeditor-section-padded">\
                    <h5><%= _("Character types").t() %></h5>\
                    <dl>\
                        <dt>\\w</dt>\
                        <dd><%= _("Match a word character (a letter, number, or underscore character).").t() %></dd>\
                        <dt>\\W</dt>\
                        <dd><%= _("Match a non-word character.").t() %></dd>\
                        <dt>\\d</dt>\
                        <dd><%= _("Match a digit character.").t() %></dd>\
                        <dt>\\D</dt>\
                        <dd><%= _("Match a non-digit character.").t() %></dd>\
                        <dt>\\s</dt>\
                        <dd><%= _("Match a whitespace character.").t() %></dd>\
                        <dt>\\S</dt>\
                        <dd><%= _("Match a non-whitespace character.").t() %></dd>\
                        <dt>.</dt>\
                        <dd><%= _("Match any character. Use sparingly.").t() %></dd>\
                    </dl>\
                    <h5><%= _("Groups, quantifiers, and alternation").t() %></h5>\
                    <dl>\
                        <dt>*</dt>\
                        <dd><%= _("Match zero or more times.").t() %></dd>\
                        <dt>+</dt>\
                        <dd><%= _("Match one or more times.").t() %></dd>\
                        <dt>?</dt>\
                        <dd><%= _("Match zero or one time.").t() %></dd>\
                        <dt>( )</dt>\
                        <dd><%= _("Parentheses define match groups, atomic groups, and lookarounds.").t() %></dd>\
                        <dt>[ ]</dt>\
                        <dd><%= _("Square brackets define character classes.").t() %></dd>\
                        <dt>{ }</dt>\
                        <dd><%= _("Curly brackets define repetitions").t() %></dd>\
                        <dt>[[ ]]</dt>\
                        <dd><%= _("Double brackets define Splunk-Enterprise-specific modular regular expressions.").t() %></dd>\
                    </dl>\
                    <a class="external commandeditor-help-link" target="_blank" href=<%- helpLink %>><%- _("Learn more").t() %></a>\
                </div>\
            '
        });
    }
);