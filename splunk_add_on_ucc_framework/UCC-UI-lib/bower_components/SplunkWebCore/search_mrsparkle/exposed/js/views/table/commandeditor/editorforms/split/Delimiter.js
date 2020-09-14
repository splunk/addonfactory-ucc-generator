define(
    [
        'underscore',
        'module',
        'models/datasets/commands/Split',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        module,
        SplitCommand,
        BaseView,
        ControlGroup
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'split-delimiter-view',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.delimiterPicker = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    label: _('Delimiter').t(),
                    size: 'small',
                    controlOptions: {
                        modelAttribute: 'delimiterFromPicker',
                        model: this.model.command,
                        toggleClassName: 'btn',
                        popdownOptions: {
                            detachDialog: true
                        },
                        items: [
                            {
                                label: _('Space').t(),
                                value: SplitCommand.DELIMITERS.SPACE
                            },
                            {
                                label: _('Comma').t(),
                                value: SplitCommand.DELIMITERS.COMMA
                            },
                            {
                                label: _('Tab').t(),
                                value: SplitCommand.DELIMITERS.TAB
                            },
                            {
                                label: _('Pipe').t(),
                                value: SplitCommand.DELIMITERS.PIPE
                            },
                            {
                                label: _('Custom').t(),
                                value: ''
                            }
                        ]
                    }
                });

                this.children.customDelimiter = new ControlGroup({
                    controlType: 'Text',
                    label: _('Custom delimiter').t(),
                    size: 'small',
                    controlOptions: {
                        modelAttribute: 'delimiter',
                        model: this.model.command,
                        updateOnKeyUp: true,
                        trimLeadingSpace: false,
                        trimTrailingSpace: false
                    }
                });
            },

            startListening: function() {
                this.listenTo(this.model.command, 'change:delimiterFromPicker', this.handleSelectionChange);
            },

            handleSelectionChange: function() {
                var pickerDelimiter = this.model.command.get('delimiterFromPicker');

                this.model.command.set('delimiter', pickerDelimiter);

                this.visibility();
            },

            visibility: function() {
                var isCustom = this.model.command.get('delimiterFromPicker') === '';

                if (isCustom) {
                    this.children.customDelimiter.$el.css('display', '');
                } else {
                    this.children.customDelimiter.$el.hide();
                }
            },

            render: function() {
                this.children.delimiterPicker.render().appendTo(this.$el);

                this.children.customDelimiter.render().appendTo(this.$el);

                this.visibility();

                return this;
            }
        });
    }
);