define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'models/Base',
        'collections/Base',
        'views/shared/ViewStack',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/StepWizardControl'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        BaseModel,
        BaseCollection,
        ViewStack,
        ControlGroup,
        StepWizardControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.model = new BaseModel({selectedStep:1});
                this.model.on("change:selectedStep", this.onSelectedStepChanged, this);

                var WizardStep = BaseModel.extend({idAttribute:"value"});
                var wizardSteps = [
                    new WizardStep({value:0, label:_("Step 1").t(),
                                    enabled:true, nextLabel:_("Next").t()}),
                    new WizardStep({value:1, label:_("Step 2").t(),
                                    enabled:true, nextLabel:_("Next").t()}),
                    new WizardStep({value:2, label:_("???").t(),
                                    enabled:true, nextLabel:_("Finish").t()}),
                    new WizardStep({value:3, label:_("PROFIT").t(),
                                    enabled:true, showNextButton:false, showPreviousButton:false})
                ];
                this.children.wizardSteps = new StepWizardControl({
                    label:_("How to run a business").t(),
                    model:this.model,
                    modelAttribute:'selectedStep',
                    collection: new BaseCollection(wizardSteps)
                });
                this.viewSteps = [
                    this.children.selectView = new ControlGroup ({
                        controlType: 'SyntheticRadio',
                        className: 'form-horizontal control-group',
                        controlOptions: {
                            model: this.model,
                            modelAttribute: 'wizardSelect',
                            items: [
                                { label: _('Be Ethical').t(), value: 'greater than' },
                                { label: _('Be Unethical').t(), value: 'less than' }
                            ],
                            toggleClassName: 'btn'
                        },
                        label: _('Select').t()
                    }),
                    new ControlGroup({
                        controlType: 'Textarea',
                        controlOptions: {
                            modelAttribute: 'wizardMessage1'
                        },
                        label: _('Insert any view here').t()
                    }),
                    new ControlGroup({
                        controlType: 'Textarea',
                        controlOptions: {
                            modelAttribute: 'wizardMessage2'
                        },
                        label: _('More Stuff').t()
                    }),
                    new ControlGroup({
                        controlType: 'Label',
                        controlOptions: {
                            modelAttribute: 'wizardDone',
                            defaultValue: _('Congrats! You now have a successful business!').t()
                        }
                    })
                ];

                this.children.viewStack = new ViewStack({panes:this.viewSteps,
                                                        selectedIndex:this.model.get("selectedStep")});
            },

            render: function() {
                this.children.wizardSteps.render().appendTo(this.$el);
                this.children.viewStack.render().appendTo(this.$el);
                return this;
            },
            onSelectedStepChanged: function(model, newSelectedStep) {
                this.children.viewStack.setSelectedIndex(newSelectedStep);
            }
        });
    }
);
