define(
	[
		'jquery',
		'underscore',
		'backbone',
		'views/shared/controls/TextControl',
        'contrib/typeahead.jquery',
        'splunk.util',
        './TypeaheadTextControl.pcss'
	],
	function(
		$,
		_,
		Backbone,
		TextControl,
		typeahead,
		splunkUtil,
		css
	) {
		return TextControl.extend({
			sources: [],

			initialize: function() {
				TextControl.prototype.initialize.apply(this, arguments);

				this.options.typeaheadView = _.defaults(
					this.options.typeaheadView || {},
					{
						minLength: 0,
						highlight: true,
						zIndex: 2000,
						attachTo: 'body',
						topOffset: 10
					}
				);

				this.options.typeaheadData = _.defaults(
					this.options.typeaheadData || {},
					{
						source: this._findMatches.bind(this),
						limit: Infinity
					}
				);

				this.options.waitModel = this.options.waitModel || new Backbone.Model();
				this.options.waitModelAttribute = this.options.waitModelAttribute || 'canRenderTypeahead';

				if (!this.options.waitModel.has(this.options.waitModelAttribute)) {
					this.options.waitModel.set(this.options.waitModelAttribute, true);
				}

				this.setSources(this.options.sources, { skipRender: true });
				this.setHelpText(this.options.helpText, { skipRender: true });

				// In some cases, the parent container of this view
				// will need some time to render itself (e.g. Modal view animating into view).
				// In this case, we need to defer the render of the typeahead control since it
				// relies on screen positions of these elements in the DOM.
				this.listenTo(this.options.waitModel, 'change:' + this.options.waitModelAttribute, this.renderTypeahead);

				if (this.options.waitModelEvent) {
					this.listenTo(this.options.waitModel, this.options.waitModelEvent, this.renderTypeahead);
				}

				// Always listen for window resizing, which requires a recomputed position
				this._resizeHandler = _.debounce(this.renderTypeahead, 100).bind(this);
				$(window).resize(this._resizeHandler);
			},

			render: function() {
				TextControl.prototype.render.apply(this, arguments);
				this.renderTypeahead();
				this.renderHelpText();
				return this;
			},

			renderTypeahead: function() {
				var that = this,
					updateModel = function() {
						that.model.set(that.options.modelAttribute, that.$input.typeahead('val'));
					},
					events = [
						'typeahead:change',
						'typeahead:select',
						'typeahead:autocomplete'
					];

				if (this._typeaheadAvailable()) {
					_.each(events, function(ev) {
						this.$input.off(ev);
					}, this);

					this._destroyTypeahead();

					if (this.canRenderTypeahead()) {
						this.$input.typeahead(
							this.options.typeaheadView,
							this.options.typeaheadData
						);
						_.each(events, function(ev) {
							this.$input.on(ev, updateModel);
						}, this);
					}
				}
			},

			renderHelpText: function() {
				var $helpText;

				if (!_.isUndefined(this.helpText)) {
					$helpText = this.$('.help-block');
					if ($helpText.length === 0) {
						$helpText = $('<span class="help-block"></span>');
						this.$el.append($helpText);
					}

					$helpText.text(this.helpText || '');
				}
			},

			remove: function() {
				this._destroyTypeahead();
				$(window).off('resize', this._resizeHandler);
				return TextControl.prototype.remove.apply(this, arguments);
			},

			setSources: function(sources, opts) {
				this.sources = (sources || []).concat();

				if (!opts || !opts.skipRender) {
					this.debouncedRender();
				}
			},

			setHelpText: function(helpText, opts) {
				this.helpText = helpText;

				if (!opts || !opts.skipRender) {
					this.debouncedRender();
				}
			},

			canRenderTypeahead: function() {
				return !!this.options.waitModel.get(this.options.waitModelAttribute) &&
					this._typeaheadAvailable();
			},

			// Computes matches that the typeahead should render.
			_findMatches: function(q, cb) {
				var substringRegex = new RegExp(splunkUtil.escapeRegex(q), 'i');
				cb(_.sortBy(
					_.filter(this.sources, function(source) {
						return substringRegex.test(source);
					}),
					function(source) {
						return source.toLowerCase();
					}
				));
			},

			_destroyTypeahead: function() {
				if (this._typeaheadAvailable()) {
					this.$input.typeahead('destroy');
				}
			},

			_typeaheadAvailable: function() {
				return !!(this.$input && _.isFunction(this.$input.typeahead));
			}
		});
	}
);