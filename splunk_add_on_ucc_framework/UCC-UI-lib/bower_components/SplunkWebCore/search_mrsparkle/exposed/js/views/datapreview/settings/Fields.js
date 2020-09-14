define(
    [
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'contrib/text!views/datapreview/settings/Fields.html',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl'
    ],
    function(
        _,
        Backbone,
        module,
        BaseView,
        fieldsTemplate,
        ControlGroup,
        SyntheticSelectControl
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'form form-horizontal delimited',
            template: fieldsTemplate,
            events: {
                'click .buttonTable td': 'onSelectMode'
            },
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.fieldDelimiter = new SyntheticSelectControl({
                    className: 'btn',
                    help: 'Character that delimits or separates fields',
                    defaultValue: ',',
                    items: [
                        {
                            value: ',',
                            label: _('(comma)').t() + ' ,'
                        },
                        {
                            value: '|',
                            label: _('(pipe)').t() + ' |'
                        },
                        {
                            value: 'tab',
                            label: _('(tab)').t()
                        },
                        {
                            value: 'space',
                            label: _('(space)').t()
                        }
                    ],
                    model: this.model.sourcetypeModel,
                    modelAttribute: 'ui.structured.event_field_delimiter'
                });

                this.children.quoteCharachter = new SyntheticSelectControl({
                    className: 'btn',
                    help: 'Character used for quotes',
                    defaultValue: '"',
                    items: [
                        {
                            value: '"',
                            label: _('(double quote)').t() + ' "'
                        },
                        {
                            value: '\'',
                            label: _('(single quote)').t() + ' \''
                        }
                    ],
                    model: this.model.sourcetypeModel,
                    modelAttribute: 'ui.structured.event_field_quote'
                });

                this.children.preambleRegex = new ControlGroup({
                    label: _('File preamble').t(),
                    controlType: 'Text',
                    help: _('A regular expression that instructs Splunk to ignore these preamble lines within the file.').t(),
                    controlOptions: {
                        modelAttribute: 'ui.structured.preamble_pattern',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.children.fieldNames = new ControlGroup({
                    label: _("Field names").t(),
                    controlType: 'SyntheticRadio',
                    className: 'control-group',
                    controlOptions: {
                        modelAttribute: 'ui.structured.header_mode',
                        model: this.model.sourcetypeModel,
                        items: [
                            { label: _("Auto").t(), value: 'auto', tooltip: '' },
                            { label: _("Line...").t(), value: 'line', tooltip: _('Field names located on specified line number').t() },
                            { label: _("Custom...").t(), value: 'custom', tooltip: _('Comma separated field names').t() },
                            { label: _("Regex...").t(), value: 'regex', tooltip: _('Specify pattern to match header line').t() }
                        ],
                        save: false
                    }
                });

                this.model.sourcetypeModel.on('change:ui.structured.header_mode', function(){
                    this.onSelectMode(this.model.sourcetypeModel.get('ui.structured.header_mode'));
                }.bind(this));

                this.children.headerLocationLine = new ControlGroup({
                    label: _('Field names on line number').t(),
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.structured.header_line_number',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.children.headerLocationRegex = new ControlGroup({
                    label: _('Pattern for prefixed header line').t(),
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.structured.header_line_prefix',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.children.headerLocationNames = new ControlGroup({
                    label: _('Comma separated field names').t(),
                    help: 'e.g. firstName, lastName, age, address',
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.structured.header_fields',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

            },
            onSelectMode: function(mode){
                this.children.headerLocationLine.$el.hide();
                this.children.headerLocationRegex.$el.hide();
                this.children.headerLocationNames.$el.hide();
                switch(mode){
                    case 'line':
                        this.children.headerLocationLine.$el.show();
                        this.model.sourcetypeModel.set({
                            'ui.structured.header_fields': undefined,
                            'ui.structured.header_line_prefix': undefined
                        });
                        break;
                    case 'regex':
                        this.children.headerLocationRegex.$el.show();
                        this.model.sourcetypeModel.set({
                            'ui.structured.header_fields': undefined,
                            'ui.structured.header_line_number': undefined
                        });
                        break;
                    case 'custom':
                        this.children.headerLocationNames.$el.show();
                        this.model.sourcetypeModel.set({
                            'ui.structured.header_line_prefix': undefined,
                            'ui.structured.header_line_number': undefined
                        });
                        break;
                    case 'auto':
                        this.model.sourcetypeModel.set({
                            'ui.structured.header_fields': undefined,
                            'ui.structured.header_line_prefix': undefined,
                            'ui.structured.header_line_number': undefined
                        });
                        break;
                    default:
                        this.model.sourcetypeModel.set({
                            'ui.structured.header_fields': undefined,
                            'ui.structured.header_line_prefix': undefined,
                            'ui.structured.header_line_number': undefined
                        });
                        break;
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({_:_}));

                this.$('.placeHolderHeaderMode').append(this.children.fieldNames.render().el);

                this.$('.placeHolderDelimiter .controls').append(this.children.fieldDelimiter.render().el);
                this.$('.placeHolderQuote .controls').append(this.children.quoteCharachter.render().el);
                this.$('.placeHolderPreamble').append(this.children.preambleRegex.render().el);

                this.$('.placeHolderLocationText').append(this.children.headerLocationLine.render().el);
                this.$('.placeHolderLocationText').append(this.children.headerLocationRegex.render().el);
                this.$('.placeHolderLocationText').append(this.children.headerLocationNames.render().el);

                this.onSelectMode(this.model.sourcetypeModel.get('ui.structured.header_mode'));

                return this;
            }
        });
    }
);
