define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/managementconsole/deploy/ConfirmationDialog',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        ConfirmationDialog,
        splunkdUtils
    ) {

        return ConfirmationDialog.extend({
            moduleId: module.id,

            makeRequest: function() {
                var errorMsg = '',
                    errorObj = null;

                this.$('.submit-btn').prop('disabled', true);
                $.ajax({
                    type: 'POST',
                    url: splunkdUtils.fullpath('/services/dmc/changes'),
                    contentType: 'application/json',
                    data: JSON.stringify({mode: "all"})
                }).done(function(response) {
                    this.model.deployTask.entry.set('name', response.entry[0].taskId);
                    this.hide();
                }.bind(this)).fail(function(error) {
                    errorObj = JSON.parse(error.responseText);
                    errorMsg = errorObj.error.message || this.options.defaultErrorMessage;

                    this.$('.submit-btn').prop('disabled', false);
                    this.collection.flashMessages.reset([{
                        type: 'error',
                        html: errorMsg
                    }]);
                }.bind(this));
            },

            template: '\
                <div>\
					<p>\
						<%- _("Cancel all changes will undo all the pending changes. Please make sure the changes are not required any more as all the changes will be lost permanently.").t() %>\
					</p>\
                </div>\
			'
        });
    }
);