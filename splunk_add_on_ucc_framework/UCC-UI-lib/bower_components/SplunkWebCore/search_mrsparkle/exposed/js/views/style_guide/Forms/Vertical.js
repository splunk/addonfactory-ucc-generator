define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        BaseModel,
        BaseView,
        ControlGroup
    ) {
        return BaseView.extend({
            moduleId: module.id,
            events: {
                'click .content a': function(e) {
                    e.preventDefault();
                }
            },
            initialize: function() {
                // Dummy model
                this.model = new BaseModel({
                    sliderVal: 0.5,
                    radioToggle: 'no',
                    radioBoolean: 0
                });

                BaseView.prototype.initialize.apply(this,arguments);

                this.children.inputView = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'verticalTextInput'
                    },
                    label: _('Input').t()
                });

                this.children.textFieldView = new ControlGroup({
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'verticalTextArea'
                    },
                    label: _('Text Area').t()
                });

                this.children.radioToggleView = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'verticalRadioToggle',
                        items: [
                            { label: 'Yes', value: 'true' },
                            { label: 'No', value: 'false' },
                            { label: 'Maybe', value: 'maybe' }]
                    },
                    label: _('Radio Toggle').t()
                });

                this.children.selectView = new ControlGroup ({
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'verticalSelect',
                        items: [
                                { label: _('is greater than').t(), value: 'greater than' },
                                { label: _('is less than').t(), value: 'less than' },
                                { label: _('is equal to').t(), value: 'equal to' },
                                { label: _('is not equal to').t(), value: 'not equal to' },
                                { label: _('drops by').t(), value: 'drops by' },
                                { label: _('rises by').t(), value: 'rises by' }
                            ],
                            toggleClassName: 'btn'
                        },
                    label: _('Select').t()
                });

            },
            render: function() {
                // Renders each child view
                this.eachChild(function(view) {
                     view.render().appendTo(this.$el);
                },this);
                return this;
            }
        });
    }
);
