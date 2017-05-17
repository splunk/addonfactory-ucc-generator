import {
    MODE_CLONE,
    MODE_CREATE,
    MODE_EDIT
} from 'app/constants/modes';

define([
    'jquery',
    'lodash',
    'app/templates/common/AddDialog.html',
    'app/templates/common/EditDialog.html',
    'app/templates/common/CloneDialog.html',
    'app/views/component/BaseFormView'
], function (
    $,
    _,
    AddDialogTemplate,
    EditDialogTemplate,
    CloneDialogTemplate,
    BaseFormView
) {
    return BaseFormView.extend({
        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);
        },

        modal: function () {
            this.$("[role=dialog]").modal(
                {backdrop: 'static', keyboard: false}
            );
        },

        successCallback: function(input) {
            if (this.mode === MODE_EDIT) {
                this.dispatcher.trigger('edit-input', input);
            } else {
                this.dispatcher.trigger('add-input', input);
            }
            this.$("[role=dialog]").modal('hide');
            this.undelegateEvents();
        },

        renderTemplate: function () {
            var templateMap = {
                    [MODE_CREATE]: AddDialogTemplate,
                    [MODE_EDIT]: EditDialogTemplate,
                    [MODE_CLONE]: CloneDialogTemplate
                },
                template = _.template(templateMap[this.mode]),
                jsonData = {
                    title: this.component.title
                };

            this.$el.html(template(jsonData));

            this.$("[role=dialog]").on('hidden.bs.modal', () => {
                this.undelegateEvents();
            });
        },

        addGuid: function () {
            // Add guid to current dialog
            this.$(".modal-dialog").addClass(this.curWinId);
        }
    });
});
