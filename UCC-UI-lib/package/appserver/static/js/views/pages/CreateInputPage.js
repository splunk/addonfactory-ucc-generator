import {
    MODE_CLONE,
    MODE_CREATE,
    MODE_EDIT
} from 'app/constants/modes';
import CreateInputPageTemplate from 'app/views/pages/CreateInputPage.html';
import 'appCssDir/createInput.css';

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

        initialize: function (options) {
            BaseFormView.prototype.initialize.apply(this, arguments);
        },

        successCallback: function(input) {
            this.undelegateEvents();
            // Navigate to inputs table view
            this.navModel.navigator.navigateToRoot();
        },

        renderTemplate: function () {
            let entity = this.component.entity,
                jsonData = {};
            if (this.mode === MODE_CREATE) {
                jsonData = {
                    title: 'Create New Input',
                    btnValue: 'Save'
                }
            } else if (this.mode === MODE_EDIT) {
                jsonData = {
                    title: 'Update Input',
                    btnValue: 'Update'
                }
            } else if (this.mode === MODE_CLONE) {
                jsonData = {
                    title: 'Clone Input',
                    btnValue: 'Save'
                }
            }
            let template = _.template(CreateInputPageTemplate);
            this.$el.html(template(jsonData));
        },

        addGuid: function () {
            this.$el.addClass(this.curWinId);

            this.$(".cancel-btn").on("click", () => {
                this.navModel.navigator.navigateToRoot();
            });
        }
    });
});
