// This view orchestrates the Source Settings step in new wizard
// @author: lbudchenko
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/managementconsole/data_inputs/shared/modalwizard/Master'
], function (
    _,
    $,
    Backbone,
    module,
    BaseView,
    // Wizard view
    ModalWizard
) {

    return BaseView.extend({
        moduleId: module.id,

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            this.strings = {
                STEP1: _('Source Settings').t(),
                STEP2: _('Input Settings').t(),
                STEP3: _('Context').t(),
                STEP4: _('Review').t(),
                CREATE_TITLE: _('Add input').t(),
                EDIT_TITLE: _('Edit input').t()
            };
            var title = null;
            var showStepWizard = true;
            this.model = this.model || {};

            // used for storing wizard related properties
            this.model.wizard = this.model.wizard || new Backbone.Model();

            if (!this.model.entity) {
                throw new Error('Please pass in the entity model which will be used for saving');
            }

            this._isNew = this.model.entity.isNew();
            this.radio = this.options.radio || _.extend({}, Backbone.Events);

            if (this._isNew) {
                title = this.strings.CREATE_TITLE;
            } else {
                title = this.strings.EDIT_TITLE;
            }

            this.views = this.initializeStepViews();

            this.children.modalwizard = new ModalWizard({
                title: title,
                showStepWizard: showStepWizard,
                model: {
                    entity: this.model.entity
                },
                views: this.views,
                radio: this.radio
            });
        },

        /**
         * This function must be overridden
         * It should instantiate each step in the wizard and
         * return an array of objects {view: '', label: ''}
         */
        initializeStepViews: function () {},

        hide: function () {
            this.children.modalwizard.hide();
            this.radio.trigger('wizard:hidden');
        },

        show: function () {
            this.children.modalwizard.show();
        },

        render: function () {
            // Fire up the wizard!!
            this.$el.html(this.children.modalwizard.render().el);
            return this;
        }
    });
});