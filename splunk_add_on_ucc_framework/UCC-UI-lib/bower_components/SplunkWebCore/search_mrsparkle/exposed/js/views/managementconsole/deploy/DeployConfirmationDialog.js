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
                    url: splunkdUtils.fullpath('/services/dmc/deploy'),
                    data: "{}",
                    contentType: 'application/json'
                }).done(function(response) {
                    this.model.deployTask.entry.set('name', response.entry[0].name);
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

            getBodyContent: function() {
                var numChanges = this.collection.pendingMeta.paging.get('total'),
                    changeLabel = ' ' + (numChanges > 1 ? _('changes').t() : _('change').t()),
                    isRetry = false;

                if (this.model.deployTask.entry.content.get('state') && this.model.deployTask.entry.content.get('state') === 'failed') {
                    isRetry = true;
                }
                return this.compiledTemplate({
                    numChanges: numChanges,
                    changeLabel: changeLabel,
                    retry: isRetry
                });
            },

			template: '\
                <div>\
                    <% if (!retry) {%>\
					<p>\
						<%- _("After you hit Deploy pending changes,").t() + " " %>\
						<b><%- numChanges + changeLabel %></b>\
						<%- " " + _("will be deployed to the appropriate forwarders the next time they phone home.").t() %>\
					</p>\
					<%} else {%>\
				    <p>\
					 	<%- _("Clicking on Deploy pending changes will re-deploy previous changes along with any new changes since the last deployment failed. All changes will be deployed to the appropriate forwarders the next time they phone home.").t() %>\
					</p>\
					 <% } %>\
					<p>\
						<%- _("If you do not see all of the changes, make sure you have removed the table filters.").t() %>\
					</p>\
                </div>\
			'
		});
	}
);