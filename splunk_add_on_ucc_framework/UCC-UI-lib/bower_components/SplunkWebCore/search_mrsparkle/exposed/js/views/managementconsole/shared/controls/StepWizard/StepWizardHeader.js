/**
 * Created by rtran on 8/31/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'views/shared/controls/StepWizardControl',
    'views/managementconsole/shared/components/ButtonLoading/ButtonLoading',
    'module'
], function($, _, Backbone, BaseView, StepWizardControl, ButtonLoading, module) {

    var DmcWizardControl = StepWizardControl.extend({
        moduleId: module.id,

        initialize: function() {
            StepWizardControl.prototype.initialize.call(this);

            this.loadingButton = new ButtonLoading({
                btnTemplate: '<a href="#" class="btn btn-primary next-button">\
                                    <span class="button-text"></span>\
                                    <i class="icon-chevron-right"></i>\
                                </a>',
                position: 'right'
            });

            this.currSteps = this.options.currSteps;
            this.stepsStack = [];

        },

        insertStepsAt: function(steps, atIndex) {
            var currIndex = this.getCurrentIndex();
            if (!Number.isInteger(atIndex)) {
                throw Error('The insert index must be an integer.');
            }
            if (atIndex < currIndex) {
                throw Error('You cannot insert steps at an index before the current index(' + currIndex + ').');
            }

            var firstSlice = this.currSteps.slice(0, atIndex),
                secondSlice = this.currSteps.slice(atIndex);

            this.currSteps = firstSlice.concat(steps).concat(secondSlice);
            this.collection.reset(this.currSteps);

            return true;
        },

        getCurrentIndex: function() {
            var currValue = this.getCurrentValue();
            return this.currSteps.findIndex(function(step) {
                return step.value === currValue;
            });
        },

        // retrieves the current step value
        getCurrentValue: function() {
            return this.model.get('value');
        },

        // retrieves the current step object
        getCurrentStep: function() {
            return this.collection.findWhere({value: this.getCurrentValue()});
        },

        getCurrentView: function() {
            return this.getCurrentStep().get('view');
        },

        _syncSteps: function() {
            var top = this._popSteps();

            if (this.currSteps !== top) {
                this.currSteps = top;
                this.collection.reset(top);
            }
        },

        _pushSteps: function() {
            this.stepsStack.push(this.currSteps);
        },

        _popSteps: function() {
            return this.stepsStack.pop();
        },

        stepForward: function() {
            var currentView = this.getCurrentView();

            currentView.onNext = currentView.onNext || (function() {
                return $.when();
            });

            this._pushSteps();
            this.loadingButton.startSpinning();
            $.when(currentView.onNext.call(currentView, this)).done(function() {
                StepWizardControl.prototype.stepForward.call(this);
            }.bind(this)).fail(function() {
                this._popSteps();
            }.bind(this)).always(function() {
                this.loadingButton.stopSpinning();
            }.bind(this));
        },

        stepBack: function() {
            StepWizardControl.prototype.stepBack.call(this);
            this._syncSteps();
        },

        render: function() {
            StepWizardControl.prototype.render.apply(this, arguments);
            this.$('.next-button').remove();
            this.loadingButton.render().$el.insertAfter(this.$('.previous-button'));
            this.updateNavButtons();

            return this;
        }
    });

    return DmcWizardControl;
});