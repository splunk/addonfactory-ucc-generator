define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'views/managementconsole/shared/controls/StepWizard/StepWizardBodyBase',
    'module'
], function($, _, Backbone, BaseView, StepWizardBodyBase, module) {
    var StepWizardBody = BaseView.extend({
        moduleId: module.id,

        initialize: function() {
            this.renderedViews = {};

            this.listenTo(this.model, 'change:value', this.render);
        },

        // retrieves the current step value
        getCurrentValue: function() {
            return this.model.get('value');
        },

        // retrieves the current step object
        getCurrentStep: function() {
            return this.collection.findWhere({value: this.getCurrentValue()});
        },

        render: function() {
            var currentStep = this.getCurrentStep(),
                value = currentStep.get('value'),
                view = currentStep.get('view'),
                $wrapper;

            if (!(view instanceof StepWizardBodyBase)) {
                view.renderDfd = $.when();
            }

            view.renderDfd.done(function() {
                this.$('.wizard-row').hide();
                if (currentStep.get('forceRender') || !this.renderedViews[value]) {
                    $wrapper = this.$('.wizard-row' + '.' + 'step-' + value)[0] || $('<div class="' + 'wizard-row' + ' ' + 'step-' + value + '"></div>');
                    $wrapper.html(this.renderedViews[value] = view.render().el);
                    this.$el.append($wrapper);
                }
                this.$('.step-' + value).show();
            }.bind(this));
            return this;
        }
    });

    return StepWizardBody;
});