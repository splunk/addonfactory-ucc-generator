define(
	[
        'jquery',
		'underscore',
		'module',
		'views/Base',
		'views/shared/Modal',
        'views/shared/reportcontrols/dialogs/schedule_dialog/Master'
	], 
	function($, _, module, BaseView, ModalView, ScheduleDialog) {
		return BaseView.extend({
			moduleId: module.id,
			events: {
				 'click a.scheduleReport': function(e) {
            	    this.trigger('hide');
                	var scheduleDialog = new ScheduleDialog({
                    	model: {
                        	report: this.model.report,
                        	application: this.model.application,
                        	user: this.model.user,
                        	appLocal: this.model.appLocal,
		                    controller: this.model.controller
                    	},
                    	onHiddenRemove: true
                	});

	                scheduleDialog.render().appendTo($("body"));
    	            scheduleDialog.show();

        	        e.preventDefault();
            	}
			},
			render: function() {
				this.$el.html(ModalView.TEMPLATE);
	            this.$(ModalView.HEADER_TITLE_SELECTOR).html(_("Report Must Be Scheduled").t());
	            this.$(ModalView.BODY_SELECTOR).append('<p>' + _('You cannot enable embedding for this report until it is scheduled. Embedded reports always display the results of their last scheduled run.').t() + '</p>');
	            this.$(ModalView.FOOTER_SELECTOR).append(ModalView.BUTTON_CANCEL);
	            this.$(ModalView.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary pull-right scheduleReport">' + _('Schedule Report').t() + '</a>');
	            return this;
			}
		});
	}
);
