define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'collections/shared/FlashMessages',
		'views/shared/Modal',
		'views/shared/FlashMessagesLegacy'
	],
	function(
		$,
		_,
		Backbone,
		module,
		FlashMessagesCollection,
		Modal,
		FlashMessagesView
	) {
		var BUTTON_REVERT = '<a href="#" class="btn btn-primary modal-btn-revert modal-btn-primary">' + _('Revert').t() + '</a>';
		return Modal.extend({
			moduleId: module.id,

			initialize: function() {
				Modal.prototype.initialize.apply(this, arguments);
				this.collection = this.collection || {};

				this.collection.flashMessages = new FlashMessagesCollection();

				this.children.flashMessages = new FlashMessagesView({
					collection: this.collection.flashMessages
				});
			},

			events: {
				'click .btn-primary': function(e) {
					e.preventDefault();

					var xhr,
						success = function() {
							this.hide();
							this.collection.stanzas.fetch().done(function() {
								// Causes list of types to be updated if necessary
								this.model.configuration.fetch();
							}.bind(this));
						}.bind(this);

					this.collection.flashMessages.reset([]);

					xhr = this.model.stanza.revert({ wait: true });

					xhr.done(success).fail(function() {
						this.collection.flashMessages.reset([{
							type: 'error',
							html: _('Your stanza could not be reverted at this time. Please try again later.').t()
						}]);
					}.bind(this));
				}
			},

			render: function() {
				this.$el.html(Modal.TEMPLATE);
				this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Are you sure?').t());
				this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().$el);
				this.$(Modal.BODY_SELECTOR).append('<h3><span class="icon-alert"></span> ' + _('Reverting stanza').t() + ' <i>' + this.model.stanza.entry.get('name') + '</i></h3><span class="icon-warn"></span> ');
				this.$(Modal.BODY_SELECTOR).append('<p>' + _('Once this stanza is reverted, all settings will be restored to their defaults.').t() + '</p>');
				this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
				this.$(Modal.FOOTER_SELECTOR).append(BUTTON_REVERT);

				return this;
			}
		});
	}
);