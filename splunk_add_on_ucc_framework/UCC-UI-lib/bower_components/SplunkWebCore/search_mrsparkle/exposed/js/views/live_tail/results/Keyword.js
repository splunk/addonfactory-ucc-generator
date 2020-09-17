define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base'
    ],
    function(
        _,
        $,
        module,
        BaseView
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'livetail-keyword',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.activate();
            },

            startListening: function() {
                this.listenTo(this.model.keyword, 'change:count', function(keyword) {
                    this.$('.keyword-count').html(keyword.getCount());
                });
                this.listenTo(this.model.keyword.entry.content, 'change:keyphrase', function(keyword) {
                    this.$('.keyword-name').html(keyword.get('keyphrase'));
                    this.toggleVisible();
                });
                this.listenTo(this.model.keyword.entry.content, 'change:color', function() {
                    this.setColor();
                    this.model.keyword.trigger('updateColor', this.model.keyword);
                });
                this.listenTo(this.model.keyword.entry.content, 'change:enabled', function() {
                    this.toggleVisible();
                });
            },

            setColor: function() {
                var color = this.model.keyword.getColor();
                this.$('.keyword-name').css('background', color ? color.replace('0x', '#') : '#FFF');
            },

            toggleVisible: function() {
                if(this.model.keyword.isValid()) {
                    this.$el.css('display', 'inline-block');
                } else {
                    this.$el.hide();
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    keyword: this.model.keyword.getKeyword(),
                    keywordCount: this.model.keyword.getCount()
                }));

                this.setColor();
                this.toggleVisible();
                return this;
            },

            template: '\
                <div class="keyword-name"><%- keyword %></div>\
                <div class="keyword-count"><%- keywordCount %></div>\
            '
        });
    }
);