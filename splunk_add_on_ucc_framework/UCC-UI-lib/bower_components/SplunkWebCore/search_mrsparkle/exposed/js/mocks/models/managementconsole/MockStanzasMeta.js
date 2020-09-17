define(
	[
		'jquery',
		'underscore',
		'backbone',
		'models/managementconsole/StanzasMeta',
		'fixtures/managementconsole/stanzasmeta_basic'
	],
	function(
		$,
		_,
		Backbone,
		StanzasMetaModel,
		StanzasMetaBasicFixture
	) {
		return StanzasMetaModel.extend({
			fetch: function(options) {
				this.setFromSplunkD(StanzasMetaBasicFixture);
				return $.Deferred().resolve().promise();
			}
		});
	}
);