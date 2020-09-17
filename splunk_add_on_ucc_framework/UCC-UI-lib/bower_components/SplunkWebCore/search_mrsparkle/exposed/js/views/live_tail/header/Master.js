define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/live_tail/header/SearchBarView',
        'views/live_tail/header/Settings',
        'bootstrap.tooltip'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        SearchBarView,
        Settings,
        tooltip
        ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.searchBarView = new SearchBarView({
                    model: {
                        report: this.model.report
                    }
                });

                this.children.settings = new Settings({
                    model: {
                        application: this.model.application,
                        userPref: this.model.userPref
                    }
                });
                this.children.settings.render().appendTo($('body'));
                this.activate();
            },

            events: {
                'click .livetail-header-container': function(e) {
                    e.preventDefault();
                    this.trigger('closeSidebars');
                },
                'click .header-keywords-open': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.trigger('openKeywords');
                },
                'click .header-settings-open': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.children.settings && this.children.settings.shown) {
                        this.children.settings.hide();
                        return;
                    }

                    this.children.settings.show($(e.currentTarget));
                    this.children.settings.shown = true;
                },
                'click .header-stop': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.trigger('stop');
                },
                'click .header-play': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.trigger('play');
                }
            },

            play: function() {
                this.$('.header-play').hide();
                this.$('.header-stop').show();
            },

            stop: function() {
                this.$('.header-stop').hide();
                this.$('.header-play').show();
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    highlightSVG: this.templateHighlight
                }));
                this.children.searchBarView.render().appendTo(this.$('.livetail-header-container'));
                this.$('.tooltip-link').tooltip({delay: 500, animation:true, container: 'body', placement: 'bottom'});
                return this;
            },

            template: '\
                <div class="livetail-header-container">\
                    <div class="livetail-settings-icons">\
                        <a href="#" class="header-play tooltip-link" rel="tooltip" data-title="<%- _("Start search").t() %>"><i class="icon icon-play"></i></a>\
                        <a href="#" class="header-stop tooltip-link" rel="tooltip" data-title="<%- _("Stop search").t() %>"><i class="icon icon-stop"></i></a>\
                        <a href="#" class="header-keywords-open tooltip-link" rel="tooltip" data-title="<%- _("Highlighting").t() %>"><%= highlightSVG %></a>\
                        <a href="#" class="header-settings-open tooltip-link" rel="tooltip" data-title="<%- _("Settings").t() %>"><i class="icon icon-gear"></i></a>\
                    </div>\
                </div>\
            ',

            templateHighlight: '\
                <svg version="1.1" id="highlight_icon" x="0px" y="0px" width="18px" height="14px" viewBox="0 0 30 26">\
                    <g>\
                        <path fill="#FFFFFF" d="M0,2v22h22V2H0z M17.124,21.524h-2.223V13.73H6.66v7.793h-2.2V4.9h2.2v6.956h8.242V4.9h2.224v16.624H17.124z"/>\
                        <polygon fill="#FFFFFF" points="22,0 22,1.978 25.085,1.978 25.085,24.022 22,24.022 22,26 30,26 30,24.022 26.914,24.022 26.914,1.978 30,1.978 30,0  "/>\
                    </g>\
                </svg>\
            '
        });
    }
);