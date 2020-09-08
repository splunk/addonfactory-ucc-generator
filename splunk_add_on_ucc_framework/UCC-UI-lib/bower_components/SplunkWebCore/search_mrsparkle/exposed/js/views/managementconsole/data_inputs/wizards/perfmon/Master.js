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
    'views/managementconsole/data_inputs/shared/wizardsteps/Review'
], function(_,
            $,
            Backbone,
            module,
            BaseView,
            SetPerfMonProperties,
            SetSplunkProperties,
            SelectContext,
            ReviewStep
) {
    return BaseView.extend({
        className: 'perfmon-wizard fit-accumulator-width',

        initializeStepViews: function() {
            var isNew = this.model.entity.isNew();

            this.children.step1 = new SetPerfMonProperties({
                model: this.model.entity,
                radio: this.radio
            });

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
            this.views.push({view: this.children.step1, label: this.strings.STEP1});
            this.views.push({view: this.children.step2, label: this.strings.STEP2});
            if (isNew) {
                this.views.push({view: this.children.step3, label: this.strings.STEP3});
            }
            this.views.push({view: this.children.review, label: this.strings.STEP4, forceRender: true});

            return this.views;
        }
    });
});