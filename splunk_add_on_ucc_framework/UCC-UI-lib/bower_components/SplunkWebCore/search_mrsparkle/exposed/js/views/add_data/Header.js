/**
 * Header view.
 * Displays the current workflow step.
 * Step back/forward buttons. Exit button.
 *
 * Listens/modifies this.model.wizard: currentStep
 *
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/Base',
        'views/shared/controls/StepWizardControl',
        'uri/route',
        'contrib/text!views/add_data/Header.html'
    ],
    function (
        $,
        _,
        module,
        Backbone,
        BaseView,
        StepWizardControl,
        route,
        template
    ) {
        /**
         */
        return BaseView.extend({
            template: template,
            className: 'selectSourceHeader',
            moduleId: module.id,

            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);

                this.steps = new Backbone.Collection([
                    {
                        label: _('Initial').t(),
                        value: 'initial',
                        nextLabel: _('Next').t(),
                        visible: false
                    },
                    {
                        label: _('Select Forwarders').t(),
                        value: 'selectforwarders',
                        nextLabel: _('Next').t()
                    },
                    {
                        label: _('Select Source').t(),
                        value: 'selectsource',
                        nextLabel: _('Next').t()
                    },
                    {
                        label: _('Set Source Type').t(),
                        value: 'datapreview',
                        nextLabel: _('Next').t(),
                        enabled: false
                    },
                    {
                        label: _('Input Settings').t(),
                        value: 'inputsettings',
                        nextLabel: _('Review').t(),
                        enabled: false
                    },
                    {
                        label: _('Review').t(),
                        value: 'review',
                        nextLabel: _('Submit').t()
                    },
                    {
                        label: _('Done').t(),
                        value: 'success',
                        nextLabel: _('').t()
                    }
                ]);

                this.stepWizard = new StepWizardControl({
                    model: this.model.wizard,
                    modelAttribute: 'currentStep',
                    collection: this.steps,
                    validateNext: this.validateNext.bind(this)
                });


                /* Events */
                this.model.wizard.on('change:currentStep change:inputType change:previewEnabled', function() {
                    this.updateStepsDiagram();
                }, this);

                this.model.wizard.on('change:currentStep', function(model, currentStep) {
                    // Hide header on the initial step and restore it otherwise
                    if (currentStep === 'initial') {
                        this.$el.hide();
                    } else {
                        this.$el.show();
                    }
                }, this);

                this.model.wizard.on('disableWizardSteps', function() {
                    this.stepWizard.disable();
                }, this);

                this.model.wizard.on('enableWizardSteps', function() {
                    this.stepWizard.enable();
                }, this);

            },

            validateNext: function() {
                // if we return true, the wizard moves forward. Otherwise - nothing
                var that = this,
                    currentStep = this.model.wizard.get('currentStep'),
                    inputType = this.model.wizard.get('inputType'),
                    isModularInput = this.model.wizard.get('isModularInput');

                if (this.model.wizard.isStepValid) {
                    // fasttrack!
                    this.model.wizard.isStepValid = false;
                    return true;
                }

                if(currentStep === 'datapreview'){
                    //cant continue if sourcetype has not been saved
                    if(this.model.wizard.get('unsavedSourcetype') === true || !this.model.input.get('ui.sourcetype')){
                        this.model.wizard.trigger('confirmSavedState');
                        return false;
                    }

                    if (!$('.datapreview-header').length) {
                        // don't skip the preview step until the DOM is loaded
                        return false;
                    }
                }

                if (this.model.wizard.isUploadMode()) {
                    if (currentStep === 'selectsource' || currentStep === 'inputsettings') {
                        if (_.isFunction(this.model.input.validate)) {
                            this.model.input.validate();
                            return this.model.input.isValid();
                        }
                        return false;
                    } else if (currentStep === 'review') {
                        this.model.wizard.trigger('submit');
                        return false;
                    }
                    // don't validate steps in upload mode
                    return true;
                }

                if (currentStep === 'selectsource') {
                    if (isModularInput){
                        //try to save the modular input
                        this.model.wizard.trigger('saveModularInput');
                        return false;
                    }

                    if (_.isFunction(this.model.input.validate)) {
                        this.model.input.validate();
                        return this.model.input.isValid();
                    }
                    return false;


                } else  if (currentStep === 'inputsettings') {
                    if (_.isFunction(this.model.input.validate)) {
                        this.model.input.validate();
                        if (!this.model.input.isValid()) {
                            return false;
                        } else {
                            if (this.model.input.get('sourcetypeSwitch') === 'manual' &&
                                (!_.isUndefined(this.model.sourcetype.get('ui.category')) ||
                                 !_.isUndefined(this.model.sourcetype.get('ui.description')))) {
                                    this.model.wizard.trigger('saveSourcetype');
                                    return false;
                            }
                            return true;
                        }
                    }
                    return false;

                } else if (currentStep === 'selectforwarders') {
                    if (_.isFunction(this.model.deploymentClass.validate)) {
                        this.model.deploymentClass.validate();
                        var isValid = this.model.deploymentClass.isValid();
                        if (isValid) {
                            this.model.wizard.trigger('forwardersValidated'); // the eventhandler will issue a next step command
                        }
                    }
                    return false;


                } else if (currentStep === 'review') { // review
                    this.model.wizard.trigger('submit');
                    return false;
                }
            },

            exit: function() {
                document.location.href = "/";
            },

            updateStepsDiagram: function() {
                var inputType = this.model.wizard.get('inputType');

                var nextEnabled = !_.isUndefined(inputType);
                this.steps.findWhere({value:'datapreview'}).set({enabled: nextEnabled});
                this.steps.findWhere({value:'inputsettings'}).set({enabled: nextEnabled});

                if (this.model.wizard.get('isModularInput')) {
                    this.steps.findWhere({value:'datapreview'}).set({visible: false});
                    this.steps.findWhere({value:'inputsettings'}).set({visible: false});
                    this.steps.findWhere({value:'review'}).set({visible: false});
                    this.steps.findWhere({value:'review'}).set({enabled: true});
                    return;
                } else {
                    this.steps.findWhere({value:'datapreview'}).set({visible: true});
                    this.steps.findWhere({value:'inputsettings'}).set({visible: true});
                    this.steps.findWhere({value:'review'}).set({visible: true});
                }

                if (this.model.wizard.isForwardMode()) {
                    this.steps.findWhere({value:'selectforwarders'}).set({visible: true});
                    if (this.model.user.isFree()) {
                        this.steps.findWhere({value:'selectsource'}).set({enabled: false});
                    }
                } else {
                    this.steps.findWhere({value:'selectforwarders'}).set({visible: false});
                }

                if (!this.model.wizard.isPreviewEnabled()) {
                    this.steps.findWhere({value:'datapreview'}).set({visible: false});
                } else {
                    this.steps.findWhere({value:'datapreview'}).set({visible: true});
                }

                if (this.model.wizard.get('currentStep') === 'success') {
                    this.stepWizard.disable();
                }

            },

            render: function () {
                var template = this.compiledTemplate({
                    addDataLink: route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        'adddata'
                    )
                });

                this.$el.html(template);
                this.$('#wizard-placeholder').append(this.stepWizard.render().el);
                if (this.collection.indexes.length == 0){
                    this.$('#wizard-placeholder').after('<div id="wizardAlert"><i class="icon-alert"></i>' + _('You do not have the capability to add data. Please contact your administrator').t() +'</div>');
                    this.$('#wizardAlert').hide();
                }
                return this;
            }
        });
    }
);
