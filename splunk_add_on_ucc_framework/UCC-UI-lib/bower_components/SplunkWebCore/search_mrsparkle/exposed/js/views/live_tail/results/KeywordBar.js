define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/live_tail/results/Keyword',
        'util/moment',
        'splunk.i18n'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        Keyword,
        moment,
        i18n
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'livetail-keyword-bar',

            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.activate({ deep:true });
            },

            startListening: function() {
                this.listenTo(this.collection.keywords, 'update', function() {
                    this.renderKeywords();
                });
            },

            addKeyword: function(keywordModel) {
                var keyword = this.children['keyword_' + keywordModel.cid] = new Keyword({
                    model: {
                        keyword: keywordModel
                    }
                });
                keywordModel.set('count', 0);
                this.addListeners(keywordModel);
                keyword.render().appendTo(this.$('.livetail-keywords-container'));
            },

            addListeners: function(keywordModel) {
                this.listenTo(keywordModel.entry.content, 'change:keyphrase', function() {
                    this.updateTimestamp();
                });
            },

            renderKeywords: function() {
                if (this.collection.keywords.length > 0) {
                    this.$('.livetail-keywords-container').empty();
                    this.collection.keywords.each(function(keyword) {
                        this.addKeyword(keyword);
                    }, this);
                }
            },

            updateTimestamp: function() {
                var now = new Date(),
                    timestamp = i18n.format_date(now, "h:mma M/d/yy");
                this.$('.timestamp-val').text(timestamp);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                this.updateTimestamp();
                this.renderKeywords();
                return this;
            },

            template: '\
                <div class="livetail-keywords-container"></div>\
                <div class="timestamp"><%- _("From").t() %> <span class="timestamp-val"><span></div>\
            '
        });
    }
);