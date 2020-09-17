define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'contrib/text!./MoreInfoStanza.html',
		'contrib/text!./MoreInfoServerClass.html',
		'contrib/text!./MoreInfoApp.html'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		StanzaTemplate,
		ServerClassTemplate,
		AppTemplate
	) {
		var STRINGS = {
				STANZA_ADDED_BEFORE: _('Stanza did not exist').t(),
	            STANZA_REMOVED_AFTER: _('Stanza is removed').t(),
	            STANZA_NO_ATTRIBUTES: _('No attributes are set').t(),
				SERVER_CLASS_ADDED_BEFORE: _('Server Class did not exist').t(),
				SERVER_CLASS_REMOVED_AFTER: _('Server Class is removed').t(),
				APP_ADDED_BEFORE: _('App was not installed').t(),
				APP_REMOVED_AFTER: _('App is uninstalled').t(),
				APP_UPGRADE_TEXT: _('App is updated').t(),
				BEFORE: _('Before').t(),
				AFTER: _('After').t(),
				ATTRIBUTES: _('Attributes').t(),
				CONTEXT: _('Context').t(),
				CONFIGURATION_TYPE: _('Configuration Type').t(),
				WHITELIST: _('Whitelist').t(),
				BLACKLIST: _('Blacklist').t(),
				MACHINE_TYPE: _('Machine Type').t(),
				LOCATION: _('Location').t(),
				AFTER_INSTALLATION: _('After Installation').t(),
				VERSION: _('Version').t()
			},
			PENDING_COLSPAN = 5,
			DEPLOYED_COLSPAN = 7;

		return BaseView.extend({
			moduleId: module.id,
			tagName: 'tr',
			className: 'more-info',

			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);
				this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
				this.$('table-dotted').addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');

				this.compiledStanzaDetailsTemplate = _.template(this.stanzaDetailsTemplate);
				this.compiledAppDetailsTemplate = _.template(this.appDetailsTemplate);
				this.compiledServerClassDetailsTemplate = _.template(this.serverClassDetailsTemplate);
			},

			render: function() {
				var colspan = this.model.change.isPending() ? PENDING_COLSPAN : DEPLOYED_COLSPAN;
				
				colspan = this.options.hideColumns ? colspan - 2 : colspan;

				if (this.model.change.isStanzaChange()) {
					this.$el.html(this.compiledStanzaDetailsTemplate({
						colspan: colspan,
						simplifiedMoreInfo: this.options.simplifiedMoreInfo,
						change: this.model.change,
						mergedAttrs: this.model.change.getMergedAttributesObj(),
						strings: STRINGS
					}));
				} else if (this.model.change.isServerClassChange()) {
					// Todo: add Name and description changes record once UI allows that
					this.$el.html(this.compiledServerClassDetailsTemplate({
						colspan: colspan,
						change: this.model.change,
						strings: STRINGS
					}));
				} else {
					this.$el.html(this.compiledAppDetailsTemplate({
						colspan: colspan,
						simplifiedMoreInfo: this.options.simplifiedMoreInfo,
						change: this.model.change,
						version: this.model.change.getAppVersion(),
						strings: STRINGS
					}));
				}
				return this;
			},

			stanzaDetailsTemplate: StanzaTemplate,
			appDetailsTemplate: AppTemplate,
			serverClassDetailsTemplate: ServerClassTemplate

		});
	}
);
