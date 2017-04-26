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
        initialize: function (options) {
            BaseFormView.prototype.initialize.apply(this, arguments);
        },

        modal: function () {
            this.$("[role=dialog]").modal(
                {backdrop: 'static', keyboard: false}
            );
        },

        successCallback: function(input) {
            // Add model to collection
            if (this.mode !== MODE_EDIT) {
                if (this.collection.paging.get('total') !== undefined) {
                    _.each(this.collection.models, (model) => {
                        model.paging.set(
                            'total',
                            this.collection.paging.get('total') + 1
                        );
                    });
                    /*
                        Trigger collection page change event to
                        refresh the count in table caption
                    */
                    this.collection.paging.set(
                        'total',
                        this.collection.paging.get('total') + 1
                    );
                } else {
                    console.log('Could not get total count for collection');
                }
                this.collection.add(input);
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
                },
                entity = this.component.entity;

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
