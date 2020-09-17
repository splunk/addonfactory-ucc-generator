/**
 * Created by rtran on 5/26/16.
 */
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/managementconsole/data_inputs/wizards/Base',
    './step1',
    './step2',
    'views/managementconsole/data_inputs/shared/wizardsteps/SelectContext',
    'views/managementconsole/data_inputs/shared/wizardsteps/Review',
    'views/managementconsole/data_inputs/shared/modalwizard/Master'
], function(_,
            $,
            Backbone,
            module,
            BaseView,
            SetWinEventLogProperties,
            SetSplunkProperties,
            SelectContext,
            ReviewStep,
            ModalWizard
) {
    return BaseView.extend({
        className: 'wineventlog-wizard fit-accumulator-width',

        initializeStepViews: function() {
            var isNew = this.model.entity.isNew();

            if (isNew) {
                this.children.step1 = new SetWinEventLogProperties({
                    model: this.model.entity,
                    radio: this.radio
                });

            }

            this.children.step2 = new SetSplunkProperties({
                model: this.model.entity,
                radio: this.radio
            });


            if (isNew) {
                this.children.step3 = new SelectContext({
                    model: this.model,
                    collection: this.collection,
                    radio: this.radio,
                    deferreds: this.options.deferreds
                });
            }

            this.children.review = new ReviewStep({
                model: this.model.entity,
                radio: this.radio
            });

            this.views = [];
            if (isNew) {
                this.views.push({view: this.children.step1, label: this.strings.STEP1});
            }
            this.views.push({view: this.children.step2, label: this.strings.STEP2});
            if (isNew) {
                this.views.push({view: this.children.step3, label: this.strings.STEP3});
            }
            this.views.push({view: this.children.review, label: this.strings.STEP4, forceRender: true});

            return this.views;
        }
    });
});