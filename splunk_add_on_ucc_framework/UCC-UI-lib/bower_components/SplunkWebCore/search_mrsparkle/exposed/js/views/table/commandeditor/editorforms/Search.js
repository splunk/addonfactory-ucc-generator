define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/shared/controls/TextareaControl',
        'util/keyboard'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        TextareaControl,
        keyboardUtils
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-search',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.searchBox = new TextareaControl({
                    className: 'search-box',
                    model: this.model.command,
                    modelAttribute: 'expression',
                    size: 'small',
                    placeholder: _('enter search...').t()
                });
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                // Don't actually add a new line, this will trigger a submit of the form
                'keydown textarea': function(e) {
                    if (!e.shiftKey && e.which === keyboardUtils.KEYS["ENTER"]) {
                        e.preventDefault();
                    }
                },

                // Textarea control does not have 'updateOnKeyUp' flag option to pass into control constructor
                // so manually update working model attribute (and apply button state) if user inputs text
                'keyup textarea': function(e) {
                    this.onInputChange(e);
                }
            }),

            onInputChange: function(e) {
                var inputValue = this.children.searchBox.$('textarea').val();
                this.children.searchBox.setValue(inputValue, false);
            },

            handleApply: function(options) {
                var updateDeferred = this.model.command.updateSPL();

                $.when(updateDeferred).always(function() {
                    if (!this.model.command.validationError) {
                        this.model.command.updateRequiredColumns();
                        BaseEditorView.prototype.handleApply.call(this, options);
                    }
                }.bind(this));
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _,
                        helpLink: this.getHelpLink('learnmore.datasets.search')
                    }));

                    this.children.searchBox.activate({ deep: true }).render().$el.prependTo(this.$('.commandeditor-section-padded'));

                    this.appendButtons();
                    if (this.model.state.get('previousJSON')) {
                        this.appendAdvancedEditorReturnLink();
                    }
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded">\
                    <ul class="search-help">\
                        <li>\
                            <%- _("Filter one or more fields by entering").t() %>\
                            <span class="mono-space"><%- _("field=value").t() %>.</span>\
                        </li>\
                        <li>\
                            <%- _("Use wildcards to filter fields that contain, start with, or end with certain text by entering").t() %>\
                            <span class="mono-space"><%- _("field=*value*").t() %>.</span>\
                        </li>\
                        <li>\
                            <%- _("Filter numerical fields with >, >=, etc.").t() %>\
                        </li>\
                        <li>\
                            <%- _("Entered keywords will only match with the _raw field.").t() %>\
                        </li>\
                        <li>\
                            <%- _("Add the OR operator to match the left or right side of the expression").t() %>\
                        </li>\
                        <li>\
                            <%- _("Use parentheses ( ) to create logical groups for use with OR.").t() %>\
                        </li>\
                    </ul>\
                    <a class="external" target="_blank" href=<%- helpLink %>><%- _("Learn more").t() %></a>\
                </div>\
            '
        });
    }
);