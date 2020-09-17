define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/searchbarinput/searchassistant/help/IntroAndCommand',
        'views/shared/searchbarinput/searchassistant/help/Notices', 
        'splunk.util'
    ],
    function(_, module, Base, IntroAndCommand, Notices, splunkUtils) {
        return Base.extend({
            moduleId: module.id,
            className: 'search-assistant-help-wrapper',
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         searchBar: <models.search.SearchBar>
             *         sHelper: <models.search.SHelper>,
             *         application: <models.Application>
             *     }
             * }
             */
            events: {
                'click .search-assistant-autoopen-toggle': function(e) {
                    this.setAutoOpen(!this.model.searchBar.get('autoOpenAssistant'));
                    e.preventDefault();
                }
            },
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.introAndCommand = new IntroAndCommand({
                    model: {
                        sHelper: this.model.sHelper, 
                        application: this.model.application 
                    }
                });

                this.children.notices = new Notices({
                    model: {
                        sHelper: this.model.sHelper,
                        searchBar: this.model.searchBar, 
                        application: this.model.application 
                    }
                });
                this.activate();
            },
            setAutoOpen: function(isEnabled) {
                this.model.searchBar.set({'autoOpenAssistant': isEnabled});

                this.$assistantAutoOpenToggle.find("i").toggleClass('icon-check', isEnabled);
            },
            render: function() {
                var template = _.template(this.template, {_:_});
                this.$el.html(template);
                this.$assistantAutoOpenToggle = this.$('.search-assistant-autoopen-toggle');
                this.setAutoOpen(this.model.searchBar.get('autoOpenAssistant'));
                this.children.notices.render().appendTo(this.$el);
                this.children.introAndCommand.render().appendTo(this.$el);
                return this;
            }, 
            template: '\
                <div class="search-assistant-autoopen-wrapper"><a class="search-assistant-autoopen-toggle btn-pill" href=""><i></i><%= _("Auto Open").t() %></a></div>\
            '
        });
    }
);
