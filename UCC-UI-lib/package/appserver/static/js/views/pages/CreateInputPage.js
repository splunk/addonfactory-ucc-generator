import {MODE_EDIT} from 'app/constants/modes';
import CreateInputPageTemplate from 'app/views/pages/CreateInputPage.html';
import 'appCssDir/createInput.css';
import PageFormHeader from 'app/views/component/PageFormHeader';

define([
    'jquery',
    'lodash',
    'app/views/component/BaseFormView'
], function (
    $,
    _,
    BaseFormView
) {
    return BaseFormView.extend({
        className: 'create-input-section',

        events: () => {
            return _.extend({}, BaseFormView.prototype.events, {
                'click button.cancel-btn': function () {
                    this.navModel.navigator.navigateToRoot();
                }
            });
        },

        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);
        },

        successCallback: function(input) {
            if (this.mode === MODE_EDIT) {
                this.dispatcher.trigger('edit-input', input);
            } else {
                this.dispatcher.trigger('add-input', input);
            }
            // Remove saving dialog
            this.savingDialog.remove();

            this.undelegateEvents();
            // Navigate to inputs table view
            this.navModel.navigator.navigateToRoot();
        },

        renderTemplate: function () {
            let btnValue = 'Save';
            if (this.mode === MODE_EDIT) {
                btnValue = 'Update';
            }
            this.$el.html(
                _.template(CreateInputPageTemplate)({btnValue})
            );
            // render the form header including breadcrumbs
            const pageFormHeader = new PageFormHeader({
                    navModel: this.navModel,
                    component: this.component,
                    mode: this.mode
                });
            this.$el.prepend(
                pageFormHeader.render().$el
            );
        },

        addGuid: function () {
            this.$el.addClass(this.curWinId);
        }
    });
});
