define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/Button',
        'views/shared/controls/ControlGroup',
        '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseModel,
        BaseView,
        ButtonView,
        ControlGroup,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.alertModel = new BaseModel();
                this.emailModel = new BaseModel();

                var hideableClassName = 'form-horizontal control-group control-group-toggle hide';

                this.alertCheck = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    controlOptions: {
                        modelAttribute: 'showAlertManager'
                    },
                    label: _('show alert manager').t()
                });

                this.selectView = new ControlGroup ({
                    controlType: 'SyntheticSelect',
                    className: hideableClassName,
                    controlOptions: {
                        model: this.alertModel,
                        modelAttribute: 'assignSeverity',
                        items: [
                                { label: _('info').t(), value: 'info' }
                            ],
                            toggleClassName: 'btn'
                        },
                    label: _('assign severity').t()
                });

                this.emailCheck = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    controlOptions: {
                        modelAttribute: 'sendEmail'
                    },
                    label: _('send email').t()
                });

                this.inputView = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'subject'
                    },
                    label: _('subject').t(),
                    className: hideableClassName
                });

                this.textFieldView = new ControlGroup({
                    controlType: 'Textarea',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'email',
                        placeholder: _('Optional').t()
                    },
                    help: '<span class="help-block">help text</span>',
                    label: _('email').t(),
                    className: hideableClassName
                });

                this.radioToggleView = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        modelAttribute: 'includeResults',
                        items: [
                            { label: _('None').t(), value: 'none' },
                            { label: _('Text').t(), value: 'text' },
                            { label: _('CSV').t(), value: 'csv' },
                            { label: _('PDF').t(), value: 'pdf' }
                        ]
                    },
                    label: _('include results').t(),
                    className: hideableClassName
                });
            },

            events: {
                'click .checkbox': function(e) {
                    this.toggleGroup(e);
                }
            },

            render: function() {
                this.$el.html(this.template);

                this.alertCheck.render().appendTo(this.$('#form_section_1'));
                this.selectView.render().appendTo(this.$('#form_section_1'));

                this.emailCheck.render().appendTo(this.$('#form_section_2'));
                this.inputView.render().appendTo(this.$('#form_section_2'));
                this.textFieldView.render().appendTo(this.$('#form_section_2'));
                this.radioToggleView.render().appendTo(this.$('#form_section_2'));

                return this;
            },

            toggleGroup: function(e) {
                this.$(e.target).closest('fieldset').toggleClass('outline').find('.control-group-toggle').toggleClass('hide');
            },

            template: '\
                <fieldset id="form_section_1"></fieldset>\
                <fieldset id="form_section_2"></fieldset>\
            '
        });
    }
);
