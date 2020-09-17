define(
	[
		'underscore',
		'module',
		'uri/route',
		'models/Base',
		'views/Base',
		'views/shared/Modal',
        'views/shared/controls/TextareaControl',
        'collections/services/saved/searches/Histories',
        'views/shared/FlashMessagesLegacy',
        'collections/shared/FlashMessages'
	], 
	function(
        _,
        module,
        route,
        BaseModel, 
        BaseView,
        ModalView,
        TextareaControl,
        Histories,
        FlashMessagesLegacyView,
        FlashMessagesCollection
    ) {
	return BaseView.extend({
		moduleId: module.id,
		initialize: function() {
			BaseView.prototype.initialize.apply(this, arguments);
			this.model.state = new BaseModel();
            this.collection = {
                    histories: new Histories(),
                    messages: new FlashMessagesCollection()
                };
            this.children.flashMessages = new FlashMessagesLegacyView({
                collection: this.collection.messages
            });
            this.collection.histories.url = this.model.report.entry.links.get('history');
            this.children.snippet = new TextareaControl({
                    spellcheck: false,
                    modelAttribute: 'text',
                    model: this.model.state
                }
            );
            this.model.report.entry.content.on('change:embed.token', this.setText, this);
            this.collection.histories.on('sync', this.maybeWarn, this);
            this.setText();
		},
		setText: function() {
            var src = route.embed(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.report.entry.content.get('embed.token'), 
                    this.model.report.get('id')
                ),
                displayGeneralType = this.model.report.entry.content.get('display.general.type'),
                displayVisualizationsType = this.model.report.entry.content.get('display.visualizations.type'),
                baseHeight = 300,
                offsetHeight = 36,
                height,
                text;
            if (displayGeneralType === 'visualizations' && displayVisualizationsType === 'charting') {
                baseHeight = parseInt(this.model.report.entry.content.get('display.visualizations.chartHeight'), 10);
            } else if(displayGeneralType === 'events' || displayGeneralType === 'statistics') {
                baseHeight = 600;
            } else if(displayGeneralType === 'visualizations' && displayVisualizationsType === 'mapping') {
                baseHeight = parseInt(this.model.report.entry.content.get('display.visualizations.mapHeight'), 0);
            } else if(displayGeneralType === 'visualizations' && displayVisualizationsType === 'singlevalue') {
                baseHeight = 60;
            }
            height = baseHeight + offsetHeight;
            text = _.template('<iframe height="<%- height %>" width="480" frameborder="0" src="<%= src %>"></iframe>', {src: src, height: height});
            this.model.state.set('text', text);
		},
        show: function() {
            this.$el.show();
            this.$('textarea').focus();
            this.collection.histories.fetch({
                data: {
                    count: 1
                }
            });
        },
        maybeWarn: function() {
            if (this.collection.histories.length) {
                this.collection.messages.reset([]);
            } else {
                this.collection.messages.reset([
                    {
                        type: 'warning',
                        html: _('Embedded Report will not have data until the scheduled search runs.').t()
                    }
                ]);
            }
        },
		events: {
            'focus textarea': function(e) {
                setTimeout(function() {
                    this.$('textarea').select();
                }.bind(this), 0);
            },
			'click a.disableEmbedding': function(e) {
				e.preventDefault();
				if (window.confirm(_('Are you sure you no longer want to share this report outside of Splunk?').t())) {
					this.model.report.unembed.save();
				}
			}
		},
		render: function() {
			this.$el.html(ModalView.TEMPLATE);
	        this.$(ModalView.HEADER_TITLE_SELECTOR).html(_("Embed").t());
            this.$(ModalView.BODY_SELECTOR).append(this.children.flashMessages.render().el);
	        this.$(ModalView.BODY_SELECTOR).append('<p>' + _('Copy and paste this code into your HTML-based web page.').t() + '</p>');
            this.children.snippet.render().appendTo(this.$(ModalView.BODY_SELECTOR));
	        this.$(ModalView.BODY_SELECTOR).append('<p>' + _('Disable embedding if you no longer want to share this report outside of Splunk.').t() + '</p>');
	        this.$(ModalView.FOOTER_SELECTOR).append('<a href="#" class="btn pull-left disableEmbedding">' + _('Disable Embedding').t() + '</a>');
            this.$(ModalView.FOOTER_SELECTOR).append(ModalView.BUTTON_DONE);
	        return this;
		}
	});
});
