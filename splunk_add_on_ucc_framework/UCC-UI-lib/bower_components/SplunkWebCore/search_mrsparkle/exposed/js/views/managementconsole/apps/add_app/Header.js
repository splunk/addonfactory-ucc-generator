/**
 * Created by rtran on 2/23/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/StepWizardControl',
    'contrib/text!views/managementconsole/apps/add_app/Header.html',
    'views/managementconsole/shared.pcss',
    './AddApp.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    StepWizardControl,
    Template,
    cssShared,
    css
) {
    return BaseView.extend({
        template: Template,
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.steps = new Backbone.Collection([
                {
                    label: _('Select App').t(),
                    value: 'selectapp',
                    nextLabel: _('Next').t(),
                    visible: true,
                    enabled: false
                },
                {
                    label: _('Set Properties').t(),
                    value: 'setproperties',
                    nextLabel: _('Review').t(),
                    visible: true,
                    enabled: true
                },
                {
                    label: _('Review').t(),
                    value: 'review',
                    nextLabel: _('Done').t(),
                    visible: true,
                    enabled: true
                },
                {
                    label: _('Done').t(),
                    value: 'done',
                    nextLabel: _('').t(),
                    visible: true,
                    enabled: true
                }
            ]);

            this.stepWizard = new StepWizardControl({
                model: this.model.wizard,
                modelAttribute: 'currentStep',
                collection: this.steps
            });

            this.listenTo(this.model.wizard, 'change:currentStep', function(model, currentStep) {
                var prevIndex = this.stepWizard.getPrevIndex();
                // only enable previous if the step is not the last step
                if (prevIndex >= 0 && currentStep !== 'done') {
                    this.steps.at(prevIndex).set('enabled', true);
                } else if (currentStep === 'done') {
                    this.steps.at(prevIndex).set('enabled', false);
                }
            }, this);
        },

        render: function() {
            this.$el.append(this.compiledTemplate());
            this.$('.wizard-placeholder').append(this.stepWizard.render().el);

            return this;
        }
    });
});