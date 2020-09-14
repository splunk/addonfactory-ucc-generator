define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/searchbarinput/searchassistant/help/Master',
        'views/shared/searchbarinput/searchassistant/typeahead/Master',
        'models/search/SHelper',
        'util/keyboard',
        'util/dom_utils',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Base,
        SearchHelp,
        TypeAhead,
        SHelperModel,
        keyboard_utils,
        dom_utils,
        splunkUtils
    ) {
        return Base.extend({
            moduleId: module.id,
            className: 'search-assistant-wrapper',
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         searchBar: <models.search.SearchBar>
             *         content: <models.Report.entry.content>,
             *         application: <models.Application>
             *     },
             *     input/Master options: All options passed to input/Master are passed to this view.
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.debouncedFillAssistant = _.debounce(this.fillAssistant, 250).bind(this);
                this.nameSpace = this.uniqueNS();
                this.model.sHelper = new SHelperModel();

                this.children.typeAhead = new TypeAhead({
                    model: {
                        searchBar: this.model.searchBar,
                        sHelper: this.model.sHelper
                    }
                });
                this.children.searchHelp = new SearchHelp({
                    model: {
                        searchBar: this.model.searchBar,
                        sHelper: this.model.sHelper,
                        application: this.model.application
                    }
                });
                this.activate({skipRender: true});
            },
            startListening: function() {
                this.listenTo(this.model.searchBar, 'change:search', function(model, value, options) {
                    options = options || {};

                    if (!this.model.searchBar.get('assistantOpen')) {
                        if (this.model.searchBar.get('autoOpenAssistant') && !options.skipOpenAssistant) {
                            this.openAssistant();
                        }
                    } else {
                        this.debouncedFillAssistant();
                    }
                });
                this.listenTo(this.model.searchBar, 'closeAssistant', this.closeAssistant);
                this.listenTo(this.model.searchBar, 'openOrEnterAssistant', function() {
                    if (!this.model.searchBar.get("assistantOpen")) {
                        this.openAssistant();
                    } else {
                        this.enterAssistant();
                    }
                });
                this.listenTo(this.model.sHelper, 'childRendered', _.debounce(this.setAssistantHeight));
            },
            activate: function(options) {
                options = options || {};
                this.ensureDeactivated();

                if (!options.skipRender) {
                    this.render();
                }

                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                this.model.sHelper.fetchAbort();
                this.closeAssistant();
                $(document).off(".assistantResizeActive");
                return this;
            },
            events: {
                'click .search-assistant-activator': function(e) {
                    this.model.searchBar.trigger('focusSearchField');
                    if (this.model.searchBar.get('assistantOpen')) {
                        this.closeAssistant();
                    } else {
                        this.openAssistant();
                    }
                    e.preventDefault();
                },
                'keydown a.search-assistant-activator': function(e) {
                    if (e.keyCode === keyboard_utils.KEYS['TAB'] && !e.shiftKey) {
                         if (this.model.searchBar.get('assistantOpen')) {
                            this.closeAssistant();
                        }
                    } 
                },
                'click .search-assistant-resize': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                'mousedown .search-assistant-resize': 'resizeAssistant', 
                'keypress': 'returnToSearchFocus'
            },
            returnToSearchFocus: function(e) {
                if (e.which !== 0 && e.keyCode != keyboard_utils.KEYS['ENTER']) {
                    this.model.searchBar.trigger('searchFieldfocus');
                }
            },
            resizeAssistant: function(e) {
                var startY = e.pageY;
                var startHeight = this.$assistantContainer.height();
                e.preventDefault();
                e.stopPropagation();

                $(document).on("mousemove.assistantResizeActive",
                    function(e) {
                        var newHeight = startHeight - (startY - e.pageY);
                        newHeight = newHeight < 75 ? 0 : newHeight;
                        newHeight = Math.min(newHeight, 500);
                        this.setAssistantHeight(newHeight);
                        e.preventDefault();
                        e.stopPropagation();
                    }.bind(this)
                );

                $(document).on("mouseup.assistantResizeActive",
                    function(e) {
                        var newHeight = startHeight - (startY - e.pageY);
                        if (newHeight < 75) {
                            this.closeAssistant();
                            this.setAssistantHeight(startHeight);
                        }
                        $(document).off(".assistantResizeActive");
                    }.bind(this)
                );
            },
            closeAssistant: function() {
                //try to kill any fetches to the search helper
                this.model.sHelper.fetchAbort();

                // Exit early if closeAssistant has been called before render has created all of the views
                if (!this.$assistantContainer || !this.model.searchBar.get("assistantOpen")) {
                    return;
                }

                this.$assistantContainer.hide();
                this.$assistantActivator.addClass("icon-triangle-down-small").removeClass("icon-triangle-up-small");
                this.$assistantResize.removeClass("search-assistant-resize-active");
                this.$el.removeClass('open');

                this.model.searchBar.set('assistantOpen', false);

                $(window).off('resize.' + this.nameSpace);
                $(document).off('keyup.' + this.nameSpace);
            },
            openAssistant: function() {
                if (!this.model.searchBar.get("assistantOpen")) {

                    $(document).on('keyup.' + this.nameSpace, function(e) {
                        if (e.keyCode == keyboard_utils.KEYS['ESCAPE']) {
                            this.closeAssistant();
                            this.returnToSearchFocus(e); 
                        }
                    }.bind(this));
                    this.$assistantActivator.addClass("icon-triangle-up-small").removeClass("icon-triangle-down-small");
                    this.$assistantResize.addClass("search-assistant-resize-active");
                    this.$el.addClass('open');
                    this.model.searchBar.set("assistantOpen", true);
                    this.fillAssistant();
                }
            },
            enterAssistant: function() {
                this.model.searchBar.trigger('highlightFirstKeyword');
            },
            fillAssistant: function() {
                if (this.model.searchBar.get("assistantOpen")) {
                    var searchString = splunkUtils.addLeadingSearchCommand(this.model.searchBar.get('search') || '*', true);
                    this.model.sHelper.safeFetch({
                        data: {
                            'snippet': 'true',
                            'snippetEmbedJS': 'false',
                            'namespace': this.model.application.get('app') || 'search',
                            'search': searchString,
                            'useTypeahead': this.options.useTypeahead,
                            'useAssistant': this.options.useAssistant,
                            'showCommandHelp': this.options.showCommandHelp,
                            'showCommandHistory': this.options.showCommandHistory,
                            'showFieldInfo': this.options.showFieldInfo
                        },
                        success: function() {
                            if (this.model.searchBar.get('assistantOpen')) {
                                this.$assistantContainer.show();

                                this.model.searchBar.set({
                                    assistantKeywordCount: this.$('.typeahead-keyword').length,
                                    assistantCursor: -1
                                });
                                this.model.searchBar.trigger('searchFieldfocus');
                            }
                        }.bind(this) 
                    });
                }
            },
            setAssistantHeight: function(userSetHeight) {
                this.userSetHeight = userSetHeight || this.userSetHeight;
                var newHeight = this.userSetHeight ||
                    (Math.max(this.children.searchHelp.$el.height(), this.children.typeAhead.$el.height()) || 230) + 20;
                if (newHeight > 500) {
                    newHeight = 500; // make sure we don't go over 500px
                }
                this.$assistantContainer.height(newHeight);
                this.$('.help-wrapper').css('min-height', newHeight);
            },
            render: function() {
                if (this.$el.html()) {
                    return this;
                }

                var template = _.template(this.template, {});
                this.$el.html(template);

                // Setup shortcuts
                this.$assistantContainer = this.$('.search-assistant-container');
                this.$assistantActivator = this.$('.search-assistant-activator');
                this.$assistantResize = this.$('.search-assistant-resize');

                this.children.typeAhead.render().appendTo(this.$assistantContainer);
                this.children.searchHelp.render().appendTo(this.$assistantContainer);

                return this;
            },
            template: '\
                <div class="search-assistant-container"></div>\
                <div class="search-assistant-resize"></div>\
                <a href="#" class="search-assistant-activator icon-triangle-down-small"></a>\
            '
        });
    }
);
