define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/live_tail/results/KeywordBar',
        'util/splunkd_utils',
        'splunk.util',
        'util/color_utils'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        KeywordBar,
        splunkd_utils,
        splunk_util,
        ColorUtils
        ){

        var DEFAULT_MAX_LINES = 500;

        return BaseView.extend({
            moduleId: module.id,
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.imgUrl = splunk_util.make_url('/static/img/cursor_blink.gif');

                this.children.keywordBar = new KeywordBar({
                    collection: {
                        keywords: this.collection.keywords
                    }
                });

                this.activate({deep:true});
                this.isRunning = true;
            },

             events: {
                'click .livetail-results-container': function(e) {
                    e.preventDefault();
                    if (!window.getSelection().toString()) {
                        var pagePos = this.$('.livetail-results-container').scrollTop();
                        this.$('.livetail-focus').focus();
                        this.$('.livetail-results-container').scrollTop(pagePos);
                    }
                    this.trigger('closeSidebars');
                },

                'keydown .livetail-focus': function(e) {
                    var ENTER_KEY = 13,
                        CTRL_KEY = e.ctrlKey,
                        CMD_KEY = e.metaKey,
                        C_KEY = 67,
                        A_KEY = 65,
                        LEFT_KEY = 37,
                        RIGHT_KEY = 39,
                        key = e.which;

                    if ([LEFT_KEY, RIGHT_KEY].indexOf(key) > -1) {
                        e.preventDefault();
                        return false;
                    }

                    if ((CTRL_KEY && key === C_KEY) && this.isRunning) {
                        e.preventDefault();
                        this.trigger('stop');
                    } else if ((CMD_KEY || CTRL_KEY) && key === A_KEY) {
                        e.preventDefault();
                        this._selectAll();
                    } else if (key === ENTER_KEY) {
                        e.preventDefault();
                        var terminalVal = this.$('.livetail-focus').val().trim();

                        if (terminalVal == 'start' && !this.isRunning) {
                            this.trigger('play');
                        } else if (terminalVal == 'clear') {
                            this.clearTerminal();
                        } else if (terminalVal.startsWith('grep')) {
                            var grepVal;
                            if (this.isRunning) {
                                this.terminalError('Stop the search before grepping.');
                                return false;
                            } else if (terminalVal.substr(4,500).trim() == '') {
                                this.terminalError('Specify a keyword to grep.');
                                return false;
                            } else if (terminalVal.indexOf('"') > -1) {
                                grepVal = terminalVal.split('"')[1].trim();
                            } else {
                                grepVal = terminalVal.substr(5,1000).trim();
                            }

                            this.trigger('grepSearch', grepVal);
                        } else {
                            this.carriageReturn();
                        }

                        this.$('.livetail-focus').val('');
                    }
                },
                'keyup .livetail-focus': 'updateTerminal'
            },

            startListening: function() {
                this.listenTo(this.model.result, 'sync', this.updateResults);
            },

            updateWrap: function(wrap) {
                this.$('.livetail-results-container').removeClass('wrap-results');
                if (wrap) {
                    this.$('.livetail-results-container').addClass('wrap-results');
                    this._snapToBottom();
                }
            },

            updateFont: function(fontSize) {
                var $resultsEl = this.$('.livetail-results-container'),
                    isWrapped = $resultsEl.hasClass('wrap-results');
                $resultsEl.removeClass().addClass('livetail-results-container').addClass('font-' + fontSize);
                if (isWrapped) {
                    $resultsEl.addClass('wrap-results');
                }
            },

            updateKeywordColors: function(keyword) {
                var color = keyword.getColor();
                this.$('.livetail-results-list li span[data-cid=' + keyword.getName() + ']')
                    .css('background', color ? color.replace('0x', '#') : '#000');
            },

            setInitialPrefs: function() {
                var font = this.model.userPref.entry.content.get('display.prefs.livetail.font'),
                    theme = this.model.userPref.entry.content.get('display.prefs.livetail.theme'),
                    wrap = this.model.userPref.entry.content.get('display.prefs.livetail.wrap');

                if (font) {
                    this.updateFont(font);
                }

                if (theme) {
                    this.trigger('updateTheme', theme);
                }

                if (splunk_util.normalizeBoolean(wrap)) {
                    this.updateWrap(true);
                }
            },

            updateTerminal: function() {
                var inputVal = this.$('.livetail-focus').val();
                this.$('.mockTerminal').text(inputVal);
            },

            terminalError: function(errorMsg) {
                errorMsg = errorMsg || 'Error';
                this.$('.livetail-focus').val(errorMsg);
                this.carriageReturn();
                this.$('.livetail-focus').val('');
            },

            carriageReturn: function() {
                var $terminalInput = this.$('.livetail-focus'),
                    terminalInputVal = $terminalInput.val(),
                    $blinker = this.$('.blinker');
                if (terminalInputVal !== '') {
                    $blinker.before('<li>' + terminalInputVal + '</li>');
                } else {
                    $blinker.before('<li> &nbsp; </li>');
                }
                this.$('.mockTerminal').text('');
                this._snapToBottom();
            },

            updateResults: function() {
                var resultString = '',
                    rawString = '',
                    matchRows = '',
                    newKeywordCount;

                if (this.model.result && this.model.result.results && this.model.result.results.length > 0) {
                    var atBottom = this._atBottom(),
                        keywords = {},
                        keywordsHTML = {};

                    this.$('.livetail-waiting').hide();

                    this.collection.keywords.each(function(keyword) {
                        // Sets up the highlighting HTML for each keyword
                        var keywordString = keyword.getKeyword(),
                            name = keyword.getName(),
                            color = ColorUtils.replaceSymbols(keyword.getColor(), '#'),
                            highlightHTML = '<span data-cid="' + name + '" class="highlighted-keyword" style="background-color:' + color + '">' + keywordString + '</span>';

                        keywords[keywordString] = highlightHTML;
                    });

                    _.each(this.model.result.results.models, function(result) {
                        rawString = result.get('_raw')[0];
                        resultString = rawString;
                        matchRows = '';

                        // sort keywords from longest to shortest
                        var sortedCollection = this.collection.keywords.sortBy(function(keyword) {
                          return -keyword.getKeyword().length;
                        });
                        this.collection.keywords.models = sortedCollection;

                        this.collection.keywords.each(function(keyword) {
                            if (keyword.isEnabled() && keyword.getKeyword()) {
                                var escapedRegEx = keyword.getKeyword().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                                    regExKeyword = new RegExp(escapedRegEx, "g");

                                // Counts occurrence of keywords in result
                                newKeywordCount = rawString.match(regExKeyword);

                                if (newKeywordCount) {
                                    var newResultString = rawString.replace(regExKeyword, function(matches) {
                                                      return keywords[matches];
                                                    });

                                    newKeywordCount = (newKeywordCount) ? newKeywordCount.length : 0;
                                    keyword.set('count', keyword.getCount() + newKeywordCount);

                                    this.showScreenFlash(keyword);
                                    this.playSound(keyword);

                                    // Creating an additional row for matched keywords in said row
                                    matchRows += '<div class="keyword-match">' + newResultString + '</div>';
                                }
                            }
                        }, this);

                        rawString  = '<div class="raw-result">' + rawString + '</div>';
                        this.$('.blinker').before('<li>' + rawString + matchRows + '</li>');
                    }.bind(this));

                    this.checkMaxResults();

                    if (atBottom) {
                        this._snapToBottom();
                    }
                }
            },

            checkMaxResults: function() {
                var $currentResults = this.$('.livetail-results-container li:not(.blinker)'),
                    maxResults = this.model.userPref.entry.content.get('display.prefs.livetail.lines') || DEFAULT_MAX_LINES,
                    currentResultsLength = $currentResults.length,
                    removeResults = currentResultsLength - maxResults;

                if (removeResults > 0) {
                    $currentResults.slice(0, removeResults).remove();
                }
            },

            showScreenFlash: function(keyword) {
                if (keyword.isFlashOn() && this.exceedsThreshold(keyword)) {
                    this.trigger('screenFlash');
                }
            },

            playSound: function(keyword) {
                if (keyword.playSound() && this.exceedsThreshold(keyword)) {
                    this.trigger('playSound', keyword);
                }
            },

            exceedsThreshold: function(keyword) {
                return keyword.getCount() >= keyword.getThreshold();
            },

            play: function() {
                this.startListening();
                this.isRunning = true;
                this.$('.mockTerminalInput').hide();
                this.$('.mockTerminal').text('');
                this.$('.blinker').before('<li>' + _("Starting").t() + '...</li>');
                this.$('.blinker').before('<li> &nbsp; </li>');
                this._snapToBottom();
                this.children.keywordBar.updateTimestamp();
            },

            stop: function() {
                this.collection.keywords.each(function(keyword) {
                    keyword.set('count', 0);
                }, this);
                this.stopListening(this.model.result, 'sync', this.updateResults);
                this.isRunning = false;
                this.$('.mockTerminalInput').show();
                this.$('.mockTerminal').text('');
                this.$('.blinker').before('<li>' + _("Stopped").t() + '...</li>');
                this.$('.blinker').before('<li> &nbsp; </li>');
                this._snapToBottom();
            },

            clearTerminal: function() {
                var $blinker = this.$('.blinker');
                this.$('.livetail-results-container li:not(:last-child)').remove();
            },

            _atBottom: function() {
                var divHeight = this.$('.livetail-results-container').innerHeight(),
                    scrollPos = this.$('.livetail-results-container').scrollTop(),
                    scrollHeight = this.$('.livetail-results-container')[0].scrollHeight,
                    test = (scrollHeight - divHeight) <= scrollPos;

                return test;
            },

            _snapToBottom: function() {
                this.$('.livetail-results-container').scrollTop(this.$('.livetail-results-container')[0].scrollHeight);
            },

            _selectAll: function() {
                var results = $('.livetail-results-list')[0];

                if (results && window.getSelection) {
                    var selection = window.getSelection(),
                        range = document.createRange();

                    range.selectNodeContents(results);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    imgUrl: this.imgUrl
                }));

                // sets a delay to ensure proper focus
                setTimeout(function(){
                    this.$('.livetail-focus').focus();
                }, 500);
                this.$('.livetail-results-container').append(this.children.keywordBar.render().el);
                this.$('.mockTerminalInput').hide();
                this.setInitialPrefs();
                return this;
            },

            template: '\
                <div class="livetail-results-container">\
                    <div class="livetail-waiting"><%- _("Waiting for data").t() %>...</div>\
                    <ul class="livetail-results-list">\
                        <li class="blinker"><span class="mockTerminalInput">&gt;</span><span class="mockTerminal"></span><img src="<%- imgUrl %>"></li>\
                    </ul>\
                    <input type="text" class="livetail-focus" />\
                </div>\
            ',
            starwarstemplate: '<div id="screen"></div>'
        });
    }
);