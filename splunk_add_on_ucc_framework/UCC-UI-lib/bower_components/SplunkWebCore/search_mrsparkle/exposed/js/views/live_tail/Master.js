define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/live_tail/header/Master',
        'views/live_tail/results/Master',
        'views/live_tail/keyword_menu/Master',
        'models/shared/ClassicURL',
        'splunk.util',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        HeaderView,
        ResultsView,
        KeywordsView,
        ClassicURL,
        splunk_util,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'livetail',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.headerView = new HeaderView({
                    model: {
                        report: this.model.report,
                        userPref: this.model.userPref,
                        application: this.model.application
                    }
                });

                this.children.resultsView = new ResultsView({
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        result: this.model.result,
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        userPref: this.model.userPref
                    },
                    collection: {
                        results: this.collection.results,
                        keywords: this.collection.keywords
                    }
                });

                this.children.keywordsView = new KeywordsView({
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        result: this.model.result,
                        report: this.model.report,
                        application: this.model.application
                    },
                    collection: {
                        keywords: this.collection.keywords
                    }
                });

                this.alertReadyFlash = true;
                this.alertReadyAudio = true;
                this.activate();
                this.startSearch();

                this.model.classicurl = new ClassicURL();
                this.model.classicurl.fetch({
                    success: function(model, response) {
                        this.model.classicurl.unset('sid');
                        this.model.classicurl.save({}, {replaceState: true});
                    }.bind(this)
                });
            },

            startListening: function() {
                this.listenTo(this.children.resultsView, 'stop', this.stop);
                this.listenTo(this.children.resultsView, 'play', this.play);
                this.listenTo(this.children.headerView, 'stop', this.stop);
                this.listenTo(this.children.headerView, 'play', this.play);

                // Results listeners
                this.listenTo(this.children.resultsView, 'clear', function() {
                    this.children.resultsView.clearTerminal();
                });
                this.listenTo(this.children.resultsView, 'closeSidebars', function() {
                    this.children.keywordsView.closeKeywords();
                });
                this.listenTo(this.children.resultsView, 'grepSearch', function(grepStr) {
                    this.children.headerView.children.searchBarView.grepSearch(grepStr);
                });
                this.listenTo(this.children.resultsView, 'screenFlash', this.screenFlash);
                this.listenTo(this.children.resultsView, 'playSound', function(soundfile) {
                    this.playSound(soundfile);
                });
                this.listenTo(this.children.resultsView.children.keywordBar, 'openKeywords', this.openKeywordsMenu);
                this.listenTo(this.children.resultsView, 'updateTheme', function(theme) {
                    this.updateTheme(theme);
                });

                // Header/Settings listeners
                this.listenTo(this.children.headerView, 'closeSidebars', function() {
                    this.children.keywordsView.closeKeywords();
                });
                this.listenTo(this.children.headerView, 'openKeywords', this.openKeywordsMenu);
                this.listenTo(this.children.headerView.children.settings, 'updateWrap', function(wrap) {
                    this.children.resultsView.updateWrap(wrap);
                });
                this.listenTo(this.children.headerView.children.settings, 'updateFont', function(fontSize) {
                    this.children.resultsView.updateFont(fontSize);
                });
                this.listenTo(this.children.headerView.children.settings, 'updateTheme', function(theme) {
                    this.updateTheme(theme);
                });
                this.listenTo(this.children.headerView.children.settings, 'hidden', function() {
                    this.children.headerView.children.settings.savePrefs();
                });

                this.collection.keywords.each(function(keyword) {
                    this.listenTo(keyword, 'updateColor', function(keyword) {
                        this.children.resultsView.updateKeywordColors(keyword);
                    });
                }, this);
            },

            startSearch: function() {
                this.model.searchJob.startPolling();
            },

            play: function() {
                this.model.searchJob.unpause();
                this.children.resultsView.play();
                this.children.headerView.play();
            },

            stop: function() {
                this.model.searchJob.pause();
                this.children.resultsView.stop();
                this.children.headerView.stop();
            },

            screenFlash: function() {
                if (this.alertReadyFlash) {
                    this.$el.append(this.screenFlashTemplate);
                    this.$('.screen-flash').show();
                    this.$('.screen-flash').fadeOut(2000);
                    this.alertReadyFlash = false;
                    setTimeout(function() {
                        this.alertReadyFlash = true;
                    }.bind(this), 3000);
                }
            },

            playSound: function(keywordModel) {
                if (this.alertReadyAudio) {
                    var encodedSound = keywordModel.getEncodedSound(),
                        sound = new Audio('data:audio/ogg;base64,' + encodedSound);
                    sound.play();
                    this.alertReadyAudio = false;
                    setTimeout(function() {
                        this.alertReadyAudio = true;
                    }.bind(this), 3000);
                }
            },

            openKeywordsMenu: function() {
                this.children.keywordsView.openKeywords();
            },

            openSettingsMenu: function() {
                this.children.keywordsView.closeKeywords();
            },

            updateTheme: function(theme) {
                this.$el.removeClass(this.curTheme);
                this.curTheme = theme + '-theme-main';
                this.$el.addClass(this.curTheme);
            },

            render: function() {
                this.children.headerView.render().appendTo(this.$el);
                this.children.resultsView.render().appendTo(this.$el);
                this.children.keywordsView.render().appendTo(this.$el);

                return this;
            },

            screenFlashTemplate: '<div class="screen-flash"></div>'
        });
    }
);
