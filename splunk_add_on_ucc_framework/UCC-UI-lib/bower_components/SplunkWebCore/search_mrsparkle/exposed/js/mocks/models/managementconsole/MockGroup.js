define(
	[
		'jquery',
		'underscore',
		'backbone',
		'models/managementconsole/Group',
		'fixtures/managementconsole/group_all',
		'fixtures/managementconsole/group_indexers',
		'fixtures/managementconsole/group_search_heads',
		'fixtures/managementconsole/group__example_node'
	],
	function(
		$,
		_,
		Backbone,
		GroupModel,
		GroupAllFixture,
		GroupIndexersFixture,
		GroupSearchHeadsFixture,
		GroupExampleNodeFixture
	) {
		return GroupModel.extend({
			fetch: function(options) {
				var fixture = {},
					success = true,
					dfd = $.Deferred();

				switch (this.entry.get('name')) {
					case '_indexers':
						fixture = GroupIndexersFixture;
						break;
					case '_search_heads':
						fixture = GroupSearchHeadsFixture;
						break;
					case '_all':
						fixture = GroupAllFixture;
						break;
					case '__example_node':
						fixture = GroupExampleNodeFixture;
						break;
					default:
						success = false;
						break;
				}

				if (success) {
					this.setFromSplunkD(fixture);
					dfd.resolve();
				} else {
					this.setFromSplunkD(
						{
							"messages": [{
								"type": "ERROR",
								"text": "\n In handler 'groups': Could not find object id=" + this.entry.get('name')
							}]
						}
					);
					this.entry.unset('name');
					dfd.reject();
				}

				return dfd.promise();
			}
		});
	}
);