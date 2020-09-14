define(
    [
        'jquery',
        'underscore',
        'module',
        'models/search/SearchBar',
        'models/services/authentication/User',
        'views/Base',
        'views/shared/searchbarinput/SearchField',
        'views/shared/searchbarinput/searchassistant/Master',
        'splunk.util',
        './Master.pcss'
    ],
    function($, _, module, SearchBarModel, UserModel, Base, SearchField, SearchAssistant, splunkUtils, css) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         content: <models.Backbone> A model with the searchAttribute. 
             *                 The value of the searchAttribute populates the search bar on initialize, activate and change.
             *                 The value of the searchAttribute is set on submit.
             *                 Triggering 'applied' on this model calls submit.,
             *         user: <models.services.authentication.User> (Optional) only needed if using user's preferences to determine useSyntaxHighlighting and searchHelper,
             *         application: <models.Application>
             *         searchBar: <models.search.SearchBar> (Optional) created if not passed in.
             *                    This represents the state of the search string in the text area.
             *                    Listens to change of search attribute and updates text area
             *     },
             *     collection: {
             *         searchBNFs: <collections/services/configs/SearchBNFs>
             *     },
             *     useSyntaxHighlighting (optional): <Boolean> determines if syntax highlighting is on, this trumps user preference in user model.
             *     showLineNumbers (optional): <Boolean> determines if show line numbers is on, this trumps user preference in user model.
             *     searchAssistant (optional): <String: full|compact|none> determines which search assistant to use, this trumps user preference in user model.
             *     autoFormat (optional): <Boolean> determines if auto-format is on, this trumps user preference in user model.
             *     forceChangeEventOnSubmit: <Boolean> If true change:search event will be triggered on the content model on submit regardless of if the search has changed. Defaults to false.
             *     submitEmptyString: <Boolean> If true the value of empty string can be set for the searchAttribute on the content model. Defaults to true.
             * }
             */
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);

                this.options = $.extend(true, {}, this.options, (options || {}));
                
                var defaults = {
                    useTypeahead: true,
                    showCommandHelp: true,
                    showCommandHistory: true,
                    showFieldInfo: false,
                    autoOpenAssistant: true,
                    disableOnSubmit: false,
                    submitOnBlur: true,
                    giveFocusOnRender: false,
                    maxSearchBarLines: Infinity,
                    minSearchBarLines: 1,
                    forceChangeEventOnSubmit: false,
                    autoFormat: this.model.user ? this.model.user.getSearchAutoFormat() : false,
                    showLineNumbers: this.model.user ? this.model.user.getSearchLineNumbers() : false,
                    enabled: true,
                    searchAttribute: 'search',
                    submitEmptyString: true
                };
                _.defaults(this.options, defaults);
                
                if (!this.model.searchBar) {
                    this.model.searchBar = new SearchBarModel();    
                }
                
                this.model.searchBar.set({'autoOpenAssistant': this.options.autoOpenAssistant});
                this.windowListenerActive = false;
                this.nameSpace = this.uniqueNS();

                if (!_.isUndefined(this.options.searchAssistant)) {
                    this.options.useAssistant = this.options.searchAssistant === UserModel.SEARCH_ASSISTANT.FULL;
                    this.options.useAutocomplete = this.options.searchAssistant === UserModel.SEARCH_ASSISTANT.COMPACT;
                } else if(!_.isUndefined(this.options.useAssistant)) {
                    this.options.useAutocomplete = !this.options.useAssistant;
                } else {
                    var assistant = this.model.user.getSearchAssistant();
                    this.options.useAssistant = assistant === UserModel.SEARCH_ASSISTANT.FULL;
                    this.options.useAutocomplete = assistant === UserModel.SEARCH_ASSISTANT.COMPACT;
                }
                
                this.children.searchField = new SearchField($.extend(true, {}, this.options, {
                    model: {
                        user: this.model.user,
                        content: this.model.content,
                        searchBar: this.model.searchBar,
                        application: this.model.application
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs
                    }
                }));
                
                if (this.options.useAssistant) {
                    this.children.searchAssistant = new SearchAssistant($.extend(true, {}, this.options, {
                        model: {
                            searchBar: this.model.searchBar,
                            application: this.model.application
                        }
                    }));
                }

                this.activate();
            },
            
            startListening: function() {
                this.listenTo(this.model.searchBar, 'change:assistantOpen', function() {
                    if (this.model.searchBar.get('assistantOpen')) {
                        this.$el.addClass('search-assistant-open');
                        if (!this.windowListenerActive) {
                            $(document).on('click.' + this.nameSpace, function(e) {
                                if ((e.target === this.$el[0]) || ($.contains(this.$el[0], e.target))) {
                                    return;
                                }
                                this.model.searchBar.trigger('closeAssistant');
                            }.bind(this)); 
                            this.windowListenerActive = true;
                        }
                    } else {
                        this.$el.removeClass('search-assistant-open');
                        $(document).off('click.' + this.nameSpace);
                        this.windowListenerActive = false;
                    }
                });
                
                this.listenTo(this.model.searchBar, 'change:autoOpenAssistant', function(model, value, options) {
                    this.trigger('changedAutoOpenAssistant', value);
                });
            },
            
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                if (this.model.content.get(this.options.searchAttribute)) {
                    this.model.searchBar.set(
                        {search: this.model.content.get(this.options.searchAttribute)},
                        {skipOpenAssistant: true}
                    );
                }
                this.model.searchBar.set('autoOpenAssistant', this.options.autoOpenAssistant);
        
                return Base.prototype.activate.apply(this, arguments);
            },
            
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                $(document).off('click.' + this.nameSpace);
                this.windowListenerActive = false;
                Base.prototype.deactivate.apply(this, arguments);
                this.model.searchBar.clear({setDefaults: true});
                return this;
            },
            
            /**
             * Disable the input, make the search string unwritable.
             */
            disable: function() {
                this.children.searchField.disable();
            },
            
            /**
             * Enable the input, make the search string editable.
             * If option disableOnSubmit this must be called to re enable the input.
             */
            enable: function() {
                this.children.searchField.enable();
            },
            
            /**
             * Updates the text value in the searchbar input. The text is not submitted. 
             * @param {string} search
             */
            setText: function(search) {
                this.model.searchBar.set('search', search);
            },
            
            /**
             * Returns the text value in the searchbar input. The text is not necessarily submitted. 
             * @return {string} search
             */
            getText: function() {
                return this.model.searchBar.get('search') || '';
            },
            
            /**
             * Sets the autoOpenAssistant option.
             * @param {boolean} value
             */
            setAutoOpenAssistantOption: function (value) {
                this.options.autoOpenAssistant = splunkUtils.normalizeBoolean(value);
                this.model.searchBar.set({'autoOpenAssistant': value});
            },
            
            /**
             * Sets the search attribute on the content model to the text value in the search bar.
             * @param {object} options {
             *     forceChangeEvent: <Boolean> Determines if a change event is triggered on submit if 
             *         the search string has not changed. If set to true the event will fire.
             *         Default to the view's option forceChangeEventOnSubmit which defaults to false.
             * }
             */
            submit: function(options) {
                this.children.searchField.submit(options);
            },
            
            render: function() {
                if (this.$el.html()) {
                    return this;
                }

                this.children.searchField.render().appendTo(this.$el);

                if (this.options.useAssistant) {
                    this.children.searchAssistant.render().appendTo(this.$el);
                }

                return this;
            }
        });
    }
);
