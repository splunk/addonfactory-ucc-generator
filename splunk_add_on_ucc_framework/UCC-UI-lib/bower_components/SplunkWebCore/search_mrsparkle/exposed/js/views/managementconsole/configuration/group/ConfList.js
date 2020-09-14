define(
	[
		'jquery',
		'underscore',
		'backbone',
		'module',
		'views/Base',
		'contrib/text!./ConfList.html'
	],
	function(
		$,
		_,
		Backbone,
		module,
		BaseView,
		Template
	) {
		return BaseView.extend({
			moduleId: module.id,
			tagName: 'div',
			className: 'input_list',
			
			initialize: function() {
				BaseView.prototype.initialize.apply(this, arguments);

				this.listenTo(this.model.configuration.entry.content, 'change:@existingTypes', this.debouncedRender);
				this.listenTo(this.model.stanzasMeta, 'change', this.debouncedRender);
				this.listenTo(this.collection.stanzas.fetchData, 'change:type', this.debouncedRender);
			},

			events: {
				'click .link-wrap:not(.link-title)': function(e) {
					var $el = $(e.target),
						type = $el.data('type');

					e.preventDefault();

					this.collection.stanzas.fetchData.set({
						bundle: this.collection.stanzas.fetchData.get('bundle') ||
							this.model.configuration.getBundleName(),
						type: type,
						offset: 0,
						sortKey: 'name',
						sortDirection: 'asc'
					});
				}
			},

			render: function() {
				this.el.innerHTML = this.compiledTemplate({
					items: this._collateTypes(),
					currentType: this.collection.stanzas.fetchData.get('type')
				});

				// Wait for DOM to fully update so we can compute and scroll
				_.defer(this._scrollToSelected.bind(this));

				return this;
			},

			_scrollToSelected: _.once(function() {
				var $selected = this.$('.selected'),
					yOffset,
					height,
					listYOffset,
					listHeight,
					listScrollTop,
					selectedItemScreenPosition,
					listElementWindow;

				if ($selected.get(0)) {
					yOffset = $selected.offset().top;
					height = $selected.height();
					listYOffset = this.$el.offset().top;
					listHeight = this.$el.height();
					listScrollTop = this.$el.scrollTop();

					selectedItemScreenPosition = yOffset + height;
					listElementWindow = listYOffset + listHeight;

					if (selectedItemScreenPosition > listElementWindow) {
						this.$el.scrollTop(listScrollTop + yOffset - listYOffset);
					}
				}
			}),

			// Takes the current state of all types, specifically those that are
			// known to the system and those that exist in the current group context
			// and outputs the sorted/formatted list of types available with their
			// counts for the UI to render.
			_collateTypes: function() {
				var internalTypes = _.pluck(this.model.stanzasMeta.entry.content.get('internalTypes') || [], 'type'),
					existingTypes = this.model.configuration.getExistingTypes(),
					groupTypes = _.pluck(existingTypes, 'name'),
					groupIndex = _.indexBy(existingTypes, 'name'),
					allTypes = [],
					preferredTypes = this.model.configuration.getPreferredTypes() || [],
					first = [],
					second = [];

				// If there are no internal types, render nothing.
				if (!_.isArray(internalTypes) || internalTypes.length === 0) {
					return [];
				} else {
					// Get the full set of group context types + internal types.
					// Generally, this union should just be equal to internalTypes
					allTypes = _.union(internalTypes, groupTypes);

					// Get the current group's "preferred" types
					preferredTypes = _.intersection(allTypes, preferredTypes);

					// If there are preferred types, we need to group the types
					if (preferredTypes.length > 0) {
						// The first section is a header plus the preferred types
						first = [{
							type: '',
							label: _('Common').t(),
							count: 0,
							cls: 'link-title'
						}].concat(
							this._formatTypes(preferredTypes, groupIndex)
						);

						// The section section is now pre-populated to
						// simply be a header
						second = [{
							type: '',
							label: _('Other').t(),
							count: 0,
							cls: 'link-title'
						}];

						// Finally, remove the preferred types from
						// allTypes so as not to duplicate them
						allTypes = _.difference(allTypes, preferredTypes);
					} 

					// The second section is either
					//   (a) The alphanumerically sorted list of all types, or
					//   (b) in the case of preferred types, it is the "rest"
					second = second.concat(
						this._formatTypes(allTypes, groupIndex)
					);

					return first.concat(second);
				}
			},

			// Takes a set of types and turns them into a basic
			// format that the UI can render
			_formatTypes: function(types, groupIndex) {
				var mapType = function(type) {
						var count = (groupIndex[type] || {}).count || 0; 
						return {
							type: type,
							label: type,
							count: count
						};
					};

				return _.sortBy(
					_.map(types, mapType),
					function(item) {
						return item.label;
					}
				);
			},

			template: Template
		});
	}
);