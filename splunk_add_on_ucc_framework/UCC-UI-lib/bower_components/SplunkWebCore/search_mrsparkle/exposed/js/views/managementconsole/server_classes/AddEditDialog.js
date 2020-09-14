define(
	[
		'jquery',
		'underscore',
		'backbone',
        'collections/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/basemanager/EditDialog',
		'views/shared/FlashMessagesLegacy',
		'views/shared/controls/ControlGroup'
	],
	function(
		$,
		_,
		Backbone,
        FlashMessagesCollection,
        Modal,
		BaseAddEditDialog,
		FlashMessagesView,
		ControlGroup
	) {
		return BaseAddEditDialog.extend({
            className: Modal.CLASS_NAME + ' edit-dialog-modal',

			setFormControls: function() {
                this.children.flashMessagesCollection = new FlashMessagesCollection();
                
                this.children.flashMessagesView = new FlashMessagesView({
                    collection: this.children.flashMessagesCollection
                });

                // Create the form controls
                this.children.displayName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.entity.entry
                    },
                    controlClass: 'controls-block',
                    label: _('Name').t()
                });
                this.children.description = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'description',
                        model: this.model.entity.entry.content
                    },
                    controlClass: 'controls-block',
                    label: _('Description').t()
                });
			},

			setTitle: function() {
				this.title = _('New Server Class').t();
			},
			
			onClickSave: function(e) {
                var saveDfd = this.model.entity.save();
                if (saveDfd) {
                    saveDfd.done(function() {
                        window.location.href = this.model.entity.getEditUrl({
                            return_to: window.location.href
                        });
                    }.bind(this))
                        .fail(function(error) {
                            this.children.flashMessagesCollection.reset([{
                                type: 'error',
                                html: error.responseJSON.error.message || _('Failed to create server class.').t()
                            }]);
                            this.$el.find('.modal-body').animate({ scrollTop: 0 }, 'fast');
                        }.bind(this));
                }
			},

			renderFormControls: function($modalBody) {
                $modalBody.html(_(this.formControlsTemplate).template({}));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.children.displayName.render().appendTo(this.$(".name-placeholder"));
                this.children.description.render().appendTo(this.$(".name-placeholder"));
            }
		});
	}
);