/**
 * Created by rtran on 8/31/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'views/managementconsole/shared/controls/StepWizard/StepWizardHeader',
    'views/managementconsole/shared/controls/StepWizard/StepWizardBody',
    './StepWizardMaster.pcss',
    'module'
], function($, _, Backbone, BaseView, StepWizardHeader, StepWizardBody, module) {


    var DmcWizardControl = BaseView.extend({
        moduleId: module.id,

        initialize: function() {
            this.currSteps = this.options.steps;

            this.model = this.model || {};
            this.collection = this.collection || {};

            this.collection.steps = new Backbone.Collection(this.currSteps); // original step control takes a backbone

            this.model.working = new Backbone.Model({
                value: this.collection.steps.first().get('value')
            });

            this.children.stepWizardHeader = new StepWizardHeader({
                model: this.model.working,
                modelAttribute: 'value',
                collection: this.collection.steps,
                currSteps: this.currSteps
            });

            this.children.stepWizardBody = new StepWizardBody({
                model: this.model.working,
                modelAttribute: 'value',
                collection: this.collection.steps,
                cbContext: this.options.context
            });
        },

        // previous button should be enabled if there is more than one step AND current step is after the first
        canShowPrev: function() {
            var total = this._getTotalSteps();
            var index = this._getCurrentIndex();
            return total > 1 && index > 0;
        },

        // next button should show if user is on any step except the last
        canShowNext: function() {
            return !this.canShowSave();
        },

        // save button should show if user is on the last step
        canShowSave: function() {
            var total = this._getTotalSteps();
            var index = this._getCurrentIndex();
            return index+1 === total;
        },

        // provided for consumer who wants to provide own mechanism for stepping forward
        stepForward: function() {
            this.children.stepWizardHeader.stepForward();
        },

        // provided for consumer who wants to provide own mechanism for stepping back
        stepBack: function() {
            this.children.stepWizardHeader.stepBack();
        },

          /** ******************** **/
         /** START OF PRIVATE API **/
        /** ******************** **/

        _getTotalSteps: function() {
            return this.currSteps.length;
        },

        _getCurrentIndex: function() {
            return this.children.stepWizardHeader.getCurrentIndex();
        },

          /** ****************** **/
         /** END OF PRIVATE API **/
        /** ****************** **/

        render: function() {
            this.$el.append(this.compiledTemplate({
                title: this.options.title
            }));
            this.$('.wizard-header').append(this.children.stepWizardHeader.render().el);
            this.$('.wizard-body').append(this.children.stepWizardBody.render().el);
            return this;
        },

        template: '<div class="wizard"> \
                       <div class="wizard-header-container">\
                           <div class="wizard-title"><%- title %></div> \
                           <div class="wizard-header"></div> \
                       </div> \
                       <div class="wizard-body"></div> \
                   </div>'
    });

    return DmcWizardControl;
});