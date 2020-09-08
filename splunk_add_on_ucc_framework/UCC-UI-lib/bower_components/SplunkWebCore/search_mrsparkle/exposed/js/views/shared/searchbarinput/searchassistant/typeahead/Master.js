define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'util/keyboard',
        'views/shared/searchbarinput/searchassistant/typeahead/Matching',
        'views/shared/searchbarinput/searchassistant/typeahead/Commands'
    ],
    function(_, $, module, Base, keyboard_utils, Matching, Commands) {
        return Base.extend({
            moduleId: module.id,
            className: 'search-assistant-typeahead-wrapper',
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         searchBar: <models.search.SearchBar>
             *         sHelper: <models.search.SHelper>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.children.matching = new Matching({
                    model: {
                        sHelper: this.model.sHelper
                    }
                });

                this.children.commands = new Commands({
                    model: {
                        sHelper: this.model.sHelper
                    }
                });
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchBar, 'highlightFirstKeyword', this._highlightFirstKeyword);
            },
            events: {
                'keydown a.typeahead-keyword': function(e) {
                    if ((!e.metaKey && !e.ctrlKey  && !e.shiftKey) || (e.shiftKey && e.which === keyboard_utils.KEYS['TAB'])) {
                        switch (e.keyCode) {
                            case keyboard_utils.KEYS['DOWN_ARROW']:
                                this.traverseDownward(e);
                                e.preventDefault();
                                break;
                            case keyboard_utils.KEYS['UP_ARROW']:
                                this.traverseUpward(e);
                                e.preventDefault();
                                break;
                            case keyboard_utils.KEYS['ENTER']:
                            case keyboard_utils.KEYS['RIGHT_ARROW']:
                            case keyboard_utils.KEYS['SPACE_BAR']:
                                this.onSuggestionSelect(e, false);
                                e.preventDefault();
                                break;
                            case keyboard_utils.KEYS['TAB']: //BAK: This is for SPL-100049 chrome sets the cursor position when tabbing in reverse into the searchbar back to the beginning
                                if (e.shiftKey) {
                                    this.traverseUpward(e);
                                    e.preventDefault();
                                }
                                break;
                            default:
                                break;
                        }
                    } 
                },
                'click a.typeahead-keyword': function(e) {
                    this.onSuggestionSelect(e, true);
                    e.preventDefault();
                }
            },
            traverseUpward: function(e) {
                var allKeywords = this.$el.find('.typeahead-keyword'); 
                var keywordPosition = _.indexOf(allKeywords, e.target) - 1; 
                if (keywordPosition < 0) {
                    this.model.searchBar.trigger('searchFieldfocus');
                } else {
                    $(allKeywords[keywordPosition]).focus();
                }
            },
            traverseDownward: function(e) {
                var allKeywords = this.$el.find('.typeahead-keyword'); 
                var keywordPosition = _.indexOf(allKeywords, e.target) + 1; 
                if (keywordPosition < allKeywords.length) {
                    $(allKeywords[keywordPosition]).focus();
                }
            },
            onSuggestionSelect: function(e, triggerSearchBarResize) {
                var newval = $(e.currentTarget).data('replacement').trim(),
                    type = $(e.currentTarget).data('type');

                if (newval) {
                    if (type === 'nextCommand') {
                        var original = this.model.searchBar.get('search'),
                            index = original.lastIndexOf('|');
                        
                        newval = original.substring(0, index + 1) + ' ' + newval;
                    }

                    if (newval.substr(-1) != '=') {
                        newval += ' '; // don't add space after =
                    }

                    this.model.searchBar.set('search', newval);
                    
                    if (type === 'matchingSearch') {
                       this.model.searchBar.trigger('reformatSearch'); 
                    }
                    
                    if (triggerSearchBarResize) {
                        this.model.searchBar.trigger('resize');
                    }
                }
            },
            _highlightFirstKeyword: function() {
                var allKeywords = this.$el.find('.typeahead-keyword'); 
                if (allKeywords.length > 0 ) {
                    allKeywords[0].focus(); 
                }
            }, 
            render: function() {
                if (this.$el.html()) {
                    return this;
                }
                if (this.children.matching) {
                    this.children.matching.render().appendTo(this.$el);
                }
                if (this.children.commands) {
                    this.children.commands.render().appendTo(this.$el);
                }
                return this;
            }
        });
    }
);
