define(
    [
        'underscore',
        'jquery',
        'module',
        'util/splunkd_utils',
        'models/Base',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'models/shared/DateInput',
        'views/shared/controls/BooleanRadioControl',
        'views/shared/controls/ColorPickerControl',
        'views/shared/controls/MultiInputControl',
        'views/shared/controls/PercentTextControl',
        'views/shared/controls/TimeZone'
    ],
    function(
        _,
        $,
        module,
        Splunkd_utils,
        BaseModel,
        BaseView,
        ControlGroup,
        DateInputModel,
        BooleanRadioControl,
        ColorPickerControl,
        MultiInputControl,
        PercentTextControl,
        TimeZoneControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'form-horizontal',
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
                    radioList: 'yes',
                    radioBoolean: 0
                });

                BaseView.prototype.initialize.apply(this,arguments);

                this.children.inputView = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'inputText'
                    },
                    label: _('Input').t()
                });

                this.children.textFieldView = new ControlGroup({
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'inputTextArea'
                    },
                    label: _('Text Area').t()
                });

                this.children.browseView = new ControlGroup({
                    controlType: 'TextBrowse',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'inputTextBrowse'
                    },
                    label: _('Text Browse').t()
                });

                this.children.percentView = new ControlGroup({
                    controls: [
                        new PercentTextControl({
                            modelAttribute: 'inputPercentText'
                        })
                    ],
                    label: _('Percent Text').t()
                });

                this.children.dateView = new ControlGroup({
                    controlType: 'Date',
                    controlOptions: {
                        model: new DateInputModel(),
                        modelAttribute: 'inputDatePicker'
                    },
                    label: _('Date Picker').t()
                });

                this.children.radioToggleView = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'inputRadioToggle',
                        items: [
                            { label: 'Yes', value: 'true' },
                            { label: 'No', value: 'false' },
                            { label: 'Maybe', value: 'maybe' }]
                    },
                    label: _('Radio Toggle').t()
                });

                this.children.radioListView = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'inputRadioList',
                        showAsButtonGroup: false,
                        items: [
                            { label: 'Yes', value: 'true' },
                            { label: 'No', value: 'false' },
                            { label: 'Maybe', value: 'maybe' }]
                    },
                    label: _('Radio List').t()
                });

                this.children.radioBooleanView = new ControlGroup({
                    controls: [
                        new BooleanRadioControl({
                            model: this.model,
                            modelAttribute: 'inputBooleanRadioBoolean',
                            trueLabel: _('Deal').t(),
                            falseLabel: _('No Deal').t()
                        })
                    ],
                    label: _('Boolean Radio Control').t()
                });

                this.children.selectView = new ControlGroup ({
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'inputSelector',
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

                this.children.iconSelectView = new ControlGroup ({
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'inputDetailedSelector',
                        toggleClassName: "btn",
                        iconClassName: "link-icon",
                        items: [
                            {value: Splunkd_utils.FAST, label: _('Fast Mode').t(), icon: 'lightning'},
                            {value: Splunkd_utils.SMART, label: _('Smart Mode').t(), icon: 'bulb'},
                            {value: Splunkd_utils.VERBOSE, label: _('Verbose Mode').t(), icon: 'speech-bubble'}
                            ]
                        },
                    label: _('Select with Icons').t()
                });


                this.children.descriptionSelectView = new ControlGroup ({
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        model: this.model,
                        modelAttribute: 'inputDescriptionSelector',
                        toggleClassName: "btn",
                        iconClassName: "link-icon",
                        items: [
                            {value: Splunkd_utils.FAST, label: _('Fast Mode').t(), description: _('Field discovery off for event searches. No event or field data for stats searches.').t()},
                            {value: Splunkd_utils.SMART, label: _('Smart Mode').t(), description: _('Field discovery on for event searches. No event or field data for stats searches.').t()},
                            {value: Splunkd_utils.VERBOSE, label: _('Verbose Mode').t(), description: _('All event & field data.').t()}
                            ]
                        },
                    label: _('Select with Descriptions').t()
                });

                this.children.timezoneView = new ControlGroup({
                    controls: [
                        new TimeZoneControl({
                            modelAttribute: 'inputTimeZone'
                        })
                    ],
                    label: _('Time Zone').t()
                });

                this.children.sliderView = new ControlGroup({
                    controlType: 'SyntheticSlider',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'inputSteppedSlider',
                        model: this.model,
                        steps: [0.3,0.5,0.6,0.7,0.75,0.833,0.9],
                        enableStepLabels: true,
                        minLabel: _('0.0').t(),
                        maxLabel: _('1.0').t()
                    },
                    label: _('Stepped Slider').t()
                });

                this.children.checkboxesView = new ControlGroup({
                    controlType: 'CheckboxGroup',
                    controlOptions: {
                        defaultValue: _('optional').t(),
                        model: this.model,
                        modelAttribute: 'inputCheckboxes',
                        items: [
                            { label: 'Old Man Wilson', value: 'a' },
                            { label: 'Country Phil', value: 'b'},
                            { label: 'Grandpa Karl', value: 'c'}
                        ]
                    },
                    label: _('Checkboxes').t()
                });

                this.children.multiInputView = new ControlGroup({
                    className: 'input-xxlarge',
                    controls: [
                        new MultiInputControl({
                            autoCompleteFields: [
                                'Never',
                                'Gonna',
                                'Give',
                                'You',
                                'Up'
                            ],
                            modelAttribute: 'inputMultiInputControl'
                        })
                    ],
                    label: _('Multi Input Control').t()
                });

                this.hexColorModel = new BaseModel({
                    value: '0x000000'
                });

                this.children.colorPickerView = new ControlGroup({
                    label: _('Color Picker Control').t(),
                    controls: [
                        new ColorPickerControl({
                            model: this.hexColorModel,
                            modelAttribute: 'value',
                            paletteColors: [
                                '#DB5800', '#AF1D12', '#49443B',
                                '#2F25BA', '#006299', '#00993E',
                                '#009983', '#929900', '#FFB600'
                            ]
                        })
                    ],
                    controlOptions: {
                        modelAttribute: 'inputColorPicker'
                    }
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
