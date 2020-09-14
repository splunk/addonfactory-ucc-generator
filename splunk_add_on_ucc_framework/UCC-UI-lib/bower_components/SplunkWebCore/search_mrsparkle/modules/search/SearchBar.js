/* The SearchBar provides a query input area along with a submit button. 
 * In this version, the initial DOM elements are added to the container.
 */
Splunk.Module.SearchBar = $.klass(Splunk.Module.FieldSearch, {

    // define module parameter name
    TYPEAHEAD_PARAM_KEY: 'useTypeahead',
    ASSISTANT_PARAM_KEY: 'useAssistant',
    AUTO_FOCUS_KEY: 'useAutoFocus',
    AUTO_ASSIST_PARAM_KEY: 'autoOpenAssistant',
    SHOW_COMMAND_HELP_PARAM_KEY: 'showCommandHelp',
    SHOW_COMMAND_HISTORY_PARAM_KEY: 'showCommandHistory',
    SHOW_FIELD_INFO_PARAM_KEY: 'showFieldInfo',
    SUBMIT_BUTTON_PARAM_KEY: 'useOwnSubmitButton',
    MAX_SEARCH_BAR_HEIGHT_MULTIPLE: 80,
    MIN_WIDTH_FOR_TWO_COLUMNS: 560,

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("SearchBar.js");
        this.fieldName = false;
        this.timer = false;
        
        
        this.label = $('label', this.container);
        this.searchFieldWrapperInner = $('.searchFieldWrapperInner', this.container);
    
        this.initAssistant();
        this.realBindEventListeners();
        
        //set up resizing
        this.resize = new Splunk.TextareaResize(this.input, { max_lines: this.MAX_SEARCH_BAR_HEIGHT_MULTIPLE});
        
        //   this may be removed, but SearchBar takes a param whereby it implements its own submit button. 
        //   if this is the case, it needs an extra 45px margin-right, which it gets from this classname
        if (Splunk.util.normalizeBoolean(this._params[this.SUBMIT_BUTTON_PARAM_KEY])) {
            this.container.addClass(this.SUBMIT_BUTTON_PARAM_KEY);
        }
        if (Splunk.util.normalizeBoolean(this._params[this.AUTO_FOCUS_KEY])) {
            this.activateSearchBar();
            setTimeout(function() {
                $('textarea', this.container).focus();
            }.bind(this), 250);  // need timeout for IE
        } else {
        	this.deactivateSearchBar(true);
        }
        this.onInputChange();
     
    },

    
    ///////////////////////////////////////////////////////////////////////////
    // Search Assistant
    ///////////////////////////////////////////////////////////////////////////
    
    initAssistant: function() {
    	this.assistantWrapper = $('.assistantWrapper', this.container);
        this.assistantContainer = $('.assistantContainer', this.assistantWrapper);
        this.assistantAutoOpener = $('.assistantAutoOpener', this.container);
        this.assistantEnabled = false;
        this.assistantRolloverEnabled = true; //required to override mouseenter function during keyboard scrolling.
        this.assistantFillPending = false;
        this.assistantNeedsUpdate = false;
        this.assistantCursor = 0;
        this.assistantTimer = 0;
        this.assistantRolloverTimer = 0;

        if (this.getParam(this.AUTO_ASSIST_PARAM_KEY) == null) {
            this.setParam(this.AUTO_ASSIST_PARAM_KEY, true);
        }
        if (this.getParam(this.SHOW_COMMAND_HELP_PARAM_KEY) == null) {
            this.setParam(this.SHOW_COMMAND_HELP_PARAM_KEY, true);
        }
        if (this.getParam(this.SHOW_COMMAND_HISTORY_PARAM_KEY) == null) {
            this.setParam(this.SHOW_COMMAND_HISTORY_PARAM_KEY, true);
        }
        if (this.getParam(this.SHOW_FIELD_INFO_PARAM_KEY) == null) {
            this.setParam(this.SHOW_FIELD_INFO_PARAM_KEY, false);
        }
        
        // add toggle as click handler
        this.assistantAutoOpener.bind('click',
            function(evt) {
                this.setAssistantAutoOpen(
                    !Splunk.util.normalizeBoolean(this.getParam(this.AUTO_ASSIST_PARAM_KEY))
                );
                return false;
            }.bind(this)
        );
        
        this.setAssistantAutoOpen();
        
    },
    resetUI: function() {
	    this.setInputField("");
    },
    setInputField: function($super, str) {
	    $super(str);
	    this.onInputChange();
	    this.resize._resizeSearchBar(); //Shouldn't have to call an internal method, but need to.
	    this.deactivateSearchBar(true);
    },
    
    setAssistantHeight: function(newHeight) {
    	this.assistantContainer.height(newHeight);
    	$('.saHelpWrapper', this.assistantContainer).css('min-height', newHeight);
    },
    
    setAssistantWidth: function() {
    	assistantInner=$('.assistantInner', this.assistantContainer);
    	
    	if(assistantInner.length && (this.input.width() < this.MIN_WIDTH_FOR_TWO_COLUMNS)) { 
    		assistantInner.addClass('assistantInnerNarrow');
    	} else {
    		assistantInner.removeClass('assistantInnerNarrow');
    	}
    	return true;
    },

    setAssistantAutoOpen: function(isEnabled) {
        if (typeof(isEnabled) == 'undefined') {
            isEnabled = Splunk.util.normalizeBoolean(this.getParam(this.AUTO_ASSIST_PARAM_KEY));
        } else {
            this.setParam(this.AUTO_ASSIST_PARAM_KEY, isEnabled);
        }
        this.updateAssistantAutoOpen();
    },
    
    updateAssistantAutoOpen: function() {
        var controlText =  Splunk.util.normalizeBoolean(this.getParam(this.AUTO_ASSIST_PARAM_KEY)) ? _('turn off auto-open') : _('turn on auto-open');
        this.assistantAutoOpener.text(controlText);
    },
    
    openAssistant: function() {
        if (!Splunk.util.normalizeBoolean(this.getParam(this.ASSISTANT_PARAM_KEY))) {
            return false;
        }      
        if (this.assistantFillPending) return false;
        this.assistantEnabled = true;
        $('.assTab', this.container).addClass('assistantEnabled');
        this.assistantWrapper.addClass('assistantWrapperEnabled');
        this.fillAssistant();
        return true;
    },
    
    closeAssistant: function() {
        this.assistantContainer.hide();
        this.assistantEnabled = false;
        this.assistantFillPending = false;
        $('.assTab', this.container).removeClass('assistantEnabled');
        this.assistantWrapper.removeClass('assistantWrapperEnabled');
        return true;
    },
    
    toggleAssistant: function() {
    	this.input.focus();
        if (this.assistantEnabled) {
        	this.closeAssistant();
        } else {
        	this.openAssistant();
        }
        return false;
    },
     
    fillAssistant: function() {
        if (!this.assistantEnabled) return false;
        if (this.assistantFillPending) {
            this.assistantNeedsUpdate = true;
            return false;
        }

        var searchString = this._getUserEnteredSearch();
        var namespace    = Splunk.util.getCurrentApp();
        
        this.assistantContainer.load(
            Splunk.util.make_url('/api/shelper'), {
                'snippet': 'true',
                'namespace': namespace,
                'search': searchString,
                'useTypeahead': this.getParam(this.TYPEAHEAD_PARAM_KEY),
                'useAssistant': this.getParam(this.ASSISTANT_PARAM_KEY),
                'showCommandHelp': this.getParam(this.SHOW_COMMAND_HELP_PARAM_KEY),    
                'showCommandHistory': this.getParam(this.SHOW_COMMAND_HISTORY_PARAM_KEY),    
                'showFieldInfo': this.getParam(this.SHOW_FIELD_INFO_PARAM_KEY)
            },
            this.fillAssistantCompleteCallback.bind(this)
        );
        this.assistantFillPending = true;
        
        return true;
    },
    
    fillAssistantCompleteCallback: function() {
        this.assistantFillPending = false;
        if (!this.assistantEnabled) {
            this.assistantNeedsUpdate = false;
            return false;
        }
        if (this.assistantNeedsUpdate) {
            this.assistantNeedsUpdate = false;
            this.fillAssistant();
        }
        this.setAssistantWidth();
        this.assistantContainer.show().bgiframe().scrollTop(0);
        this.setAssistantHeight(this.assistantContainer.height());     
        
        this.assistantKeywordCount = $('.sakeyword', this.assistantContainer).length;
        this.assistantCursor = -1;
        
        return true;
    },
    
    selectNextKeyword: function() {
        if (this.assistantCursor >= (this.assistantKeywordCount-1)) {
            this.assistantCursor = this.assistantKeywordCount - 1;
        } else {
            this.assistantCursor += 1;
            this._highlightKeyword(this.assistantCursor);
        }
        return true;
    },
    
    selectPreviousKeyword: function() {
        if (this.assistantCursor <= 0) {
            this.assistantCursor = -1;
            this.input.focus();
        } else {
            this.assistantCursor -= 1;
        }
        this._highlightKeyword(this.assistantCursor);
        return true;
    },
    
    useSelectedKeyword: function(updateContents) {
        if (this.assistantCursor < 0) return false;
        var value = $('a.sakeyword', this.assistantContainer
            ).slice(this.assistantCursor, this.assistantCursor + 1
            ).attr('replacement');
		var newval = $.trim(value);
		// don't add space after =
		if (newval.substr(-1) != '=') newval += ' ';
	
        this.setSearchTerm(newval);

        if (updateContents)
            this.fillAssistant();
         
        return true;
    },
    
    _highlightKeyword: function(keywordPosition) {
        // set the CSS style for selected
        var el = $('.sakeyword', this.assistantContainer
            ).removeClass('saKeywordSelected'
            ).slice(keywordPosition, keywordPosition + 1
            ).addClass('saKeywordSelected');
        
        if (el.length) {
	        // keep selected item in view
	        var win = this.assistantContainer;
	        var visibleWindowTop = win.scrollTop();
	        var visibleWindowBottom = win.scrollTop() + win.height();
	        var elementTop = el.position().top + visibleWindowTop;
	        
	        var elementHeight = el.outerHeight();
	        if (elementTop < visibleWindowTop) {
	            win.scrollTop(elementTop);
	        } else if (elementTop + elementHeight > visibleWindowBottom) {
	            win.scrollTop(elementTop + elementHeight - win.height());
	        }
	        
	        el.focus();
        }
        return true;
    },

    ///////////////////////////////////////////////////////////////////////////
    // Search context handling
    ///////////////////////////////////////////////////////////////////////////


    applyContext: function($super,context) {
        var search = context.get("search");
        var stopPropagation = false;
        // When intentions are passed up on contexts,  from clicks in SimpleEventsViewer
        // or clicks in FieldViewer,   they will always have 'addterm'.
        // Depending on the click preference we pick up (TBD),
        // this module will either  - replace addterm with toggleterm
        // or blow away the searchStr and leave the addterm unchanged.
        // TODO - for various reasons there's a lot of room for improvement here. At the very least accessing intention properties directly should be fixed.
        if (this.isPageLoadComplete()) {
            if ((search._intentions.length == 1)  && (search._intentions[0]["name"] == "addterm")) {
                search._intentions[0]["name"] = "toggleterm";
            }
            var thisSearchStr = Splunk.util.trim(this._getUserEnteredSearch()) || "*";
            search.setBaseSearch(thisSearchStr);
            context.set("search", search);
            stopPropagation = true;
        }
        
        var searchWasResurrected = !this.isPageLoadComplete();
        search.clone().absorbIntentions(function(newQ) {
            this.setInputField(Splunk.util.stripLeadingSearchCommand(newQ));
            // if this wasnt a resurrected context, then we'll need to do a push
            if (searchWasResurrected) {
                this.setChildContextFreshness(false);
            } else {
                this.pushContextToChildren();
            }
        }.bind(this));

        // the fact that we absorb the intentions above,  means that we cannot leave them here or else they can get doubled up. 
        // applyContext passes a reference to the context, so we strip the intentions and push the modified search back in.
        search.clearIntentions();
        context.set("search", search);
        this.onInputChange();

        // potentially return true so we can stop the context from propagating upward any further.
        return stopPropagation;
    },
    isEmpty: function() {
        return ($.trim(this.input.attr('value')).length == 0);
    },

    /**
     * Returns a normalized search string by removing leading whitespace and
     * trimming all trailing whitespace to a single space; also send through
     * the 'search' command cleaner
     */
    _getUserEnteredSearch: function() {
        var q = this.input.attr('value') || '*';
        q = Splunk.util.addLeadingSearchCommand(q, true);
        return q;
    },
    
    /**
     * Sometimes, like when we're resurrecting a search, we will 
     * write our own input value. 
     */
    setSearchTerm: function(terms) {
        this.input.attr('value', terms);
        this.onInputChange();
        this.input.focus();
    },
    /**
     * When SearchBar receives a new context from above, 
     * it flattens the intentions and writes the result to 
     * it's input.  
     * NOTE: if there are no intentions the callback will just 
     * execute instantly.  As a practical matter that will 
     * probably be the case, but this way we also cover cases 
     * where SearchBar might have some modules like FieldSearch 
     * above it, and for some reason the developer wants SearchBar
     * to display the full search string for the user. 
     */
    onContextChange: function() {
        var context = this.getContext();
        var search  = context.get("search");

        search.absorbIntentions(function(newQ) {
            this.setInputField(Splunk.util.stripLeadingSearchCommand(newQ));
        }.bind(this));
    },
    /**
     *  In this case the modification we make is to change the 
     *  underlying 'base search' string.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        if (!this.isEmpty()) {   
            var search  = context.get("search"); 
            var searchTermStr = this._getUserEnteredSearch();
            this.logger.info('getModifiedContext - got search=', searchTermStr);
            if (this.baseContext) this.logger.warn(this.moduleType, "WARNING: clobbering base search.");
            search.abandonJob();
            search.setBaseSearch(searchTermStr);
            context.set("search", search);
        }
        return context;
    },
    
    activateSearchBar: function() {
        // only activate if not currently activated
        if (this.searchFieldWrapperInner.hasClass('searchFieldActive')) return true;

        this.searchFieldWrapperInner.addClass('searchFieldActive');
     	this.assistantWrapper.show();
     	this.input.css('margin-top', 0);
     	this.searchFieldWrapperInner.css('zoom', 1);
      	return true;
    },
  
    deactivateSearchBar: function(blur) {
        // only deactivate if currently activated
        if (!this.searchFieldWrapperInner.hasClass('searchFieldActive')) return false;

        this.searchFieldWrapperInner.removeClass('searchFieldActive');
      	this.assistantWrapper.hide();
        if (this.resize.isMultiline()) this.input.css('margin-top', -3);
      	if (blur) this.input.blur();
      	return false;
    },
    
    
    ///////////////////////////////////////////////////////////////////////////
    // User event handling
    ///////////////////////////////////////////////////////////////////////////
    
    /**
     * null out the superclass invocation; its load order messes up this class
     */
    bindEventListeners: function() {
        this.searchForm.submit(this._onFormSubmit.bind(this));
    },
    
    realBindEventListeners: function() {
        var searchBar = this;

        this.input = $('textarea', this.container);
        // provide a fallback for unit tests.
        if (this.input.length==0) {
            this.input = $('<textarea>').appendTo(this.container);
        }

        // bind focus events.; 
        this.input.bind("focus", this.onInputFocus.bind(this));
    
        // bind key events.; 
        this.input.bind("keyup", this.onInputCanonicalKeyUp.bind(this));
        $('a.sakeyword', this.container).live("keyup", this.onKeywordCanonicalKeyUp.bind(this));
        if ($.browser.msie) {
            this.input.bind("keydown", this.onInputCanonicalKeyPress.bind(this));
            this.input.bind("keypress", this.onInputErrantIEKeyPress.bind(this));
            $('a.sakeyword', this.container).live("keydown", this.onKeywordCanonicalKeyPress.bind(this));
        } else if ($.browser.safari) {
            this.input.bind("keydown", this.onInputCanonicalKeyPress.bind(this));
            this.input.bind("keypress", this.onInputCanonicalKeyPress.bind(this));
            $('a.sakeyword', this.container).live("keydown", this.onKeywordCanonicalKeyPress.bind(this));
            $('a.sakeyword', this.container).live("keypress", this.onKeywordCanonicalKeyPress.bind(this));
        } else {
            this.input.bind("keypress", this.onInputCanonicalKeyPress.bind(this));
            $('a.sakeyword', this.container).live("keypress", this.onKeywordCanonicalKeyPress.bind(this));
        }

        // make sure that we activate the search bar fully on a click, even if we already had focus
        this.input.bind("click", 
            function(evt) {
     	        if (!$('div.searchFieldWrapper', this.container) ||
                    !$('div.searchFieldWrapper', this.container).hasClass('searchFieldActive')) {
                    searchBar.activateSearchBar(); 
                }
            });

        // setup the assistant layer
        if (Splunk.util.normalizeBoolean(this.getParam(this.ASSISTANT_PARAM_KEY))) {
            
            $('div.assistantWrapper', this.container).show();
            $('a.assistantActivator', this.container).css('display','block');
            $('div.searchFieldWrapper', this.container).addClass('hasAssistant');
            $('.assistantActivator', this.container).bind('click', this.toggleAssistant.bind(this));

            // attach event handler to catch search box modifying requests that
            // come from the search assistant
            this.assistantContainer.bind('click', 
                function(evt) {
                    var target = evt.target;
                    
                    if ($(target).hasClass('assistantAutoOpener')) {
                        this.setAssistantAutoOpen(
                            !Splunk.util.normalizeBoolean(this.getParam(this.AUTO_ASSIST_PARAM_KEY))
                        );
                    }
                    if ( $(target).hasClass('salink') ) {
                        return true;   
                    }                    
                    // walk up tree for a bit
                    for (var i=0; i<4; i++) {
                        if (target.tagName != 'A'){ 
                            target = target.parentNode;
                        } else {
                            break;
                        }
                    }
                    
                    if (target.tagName != 'A') {
                        evt.stopImmediatePropagation();
                        return false;
                    }

                    var searchString = $(target).attr('replacement');
                    if (searchString) {
                        this.setSearchTerm(searchString);
                        this.fillAssistant();
                    }
                    
                    //Set the cursor position to the end
                    pos =  this.input.attr('value').length;
                    if (this.input.get(0).setSelectionRange) {
                      this.input.get(0).setSelectionRange(pos, pos);
                    } else if (this.input.get(0).createTextRange) {
                      var range = this.input.get(0).createTextRange();
                      range.collapse(true);
                      range.moveEnd('character', pos);
                      range.moveStart('character', pos);
                      range.select();
                    }
                    return false;
                }.bind(this)
            );
                        
            // catch all key
            $(document).bind('keyup', 
                function(evt){ 
                    if (evt.keyCode == this.keys['ESCAPE']) this.closeAssistant(); 
                }.bind(this)
            );            
            
            // hide the search tab and the search assistant .
            $(document).bind('click', function(evt) {
				var target = $(evt.target);
				if(target.attr('name') != 'q'){
					searchBar.closeAssistant();
					searchBar.deactivateSearchBar(false);	
				}							
            }.bind(this));
            	
            //bind to resize handle
            $(".saHandle", this.container).mousedown(
                function(evt) {
                    var startY = evt.pageY;
                    var startHeight = searchBar.assistantContainer.height();
                    evt.preventDefault();
                    evt.stopPropagation();
                    
                    $(this).bind("click.saActiveResize",
                    	function(evt){
                    		evt.preventDefault();
                    		evt.stopPropagation();
                    		return false;
                    	}
                    );
                    
                    $(document).bind("mousemove.saActiveResize",
                    	function(evt){
                    		newHeight = startHeight - (startY - evt.pageY);
                    		newHeight = newHeight < 75 ? 0 : newHeight;
                    		newHeight = Math.min(newHeight, 500);
                    	    searchBar.setAssistantHeight(newHeight);
                    	    evt.preventDefault();
                    	    evt.stopPropagation();
                    	    return false;
                    	}
                    );
                    
                    $(document).bind("mouseup.saActiveResize",
                    	function(evt){
                    		newHeight = startHeight - (startY - evt.pageY);
                    		if (newHeight < 75) {
                    			searchBar.closeAssistant(); 
                    			searchBar.setAssistantHeight(startHeight);
                    		}
                    		$(document).unbind(".saActiveResize");
                    	}
                    );
                    return false;
                }
              );
              
              // resize assistant on window resize.
              $(window).bind("resize", this.setAssistantWidth.bind(this));
        }

    },

    _onFormSubmit: function($super, event) {
        // don't do anything if there's nothing in the search box
        if (this.isEmpty()) {
            return false;
        }
        
        this.baseContext = null;
        return $super(event);
    },
    
    onInputFocus: function(evt) {
        this.assistantCursor = - 1;
        this._highlightKeyword(this.assistantCursor);
        this.activateSearchBar();
        return true;
    },
   
    onInputChange: function() {
    	/*This is called by keyup because binding to change would never call the function,
    	 *presumably because one of the key bindings stops propagation of the change event. */
         if (this.isEmpty()) {
         	this.label.show();
          	return true;
         } else {
          	this.label.hide();
          	return false;
         }
    },
    
    /**
     * This is more IE loveliness.  Most of the time, IE will fire key events
     * in the correct order: keyDown -> keyPress -> keyUp.  However, it 
     * frequently forgets to jiggle the handle, and neglects to fire keyDown,
     * instead preferring to fire keyPress first (sometimes without keyDown
     * or keyUp).  This listener anticipates our retarded cousin and ensures
     * that hitting enter will do the right thing and not insert random
     * carriage returns before a search submit.
     */
    onInputErrantIEKeyPress: function(evt) {
        if (evt.keyCode == this.keys['ENTER']) {
            //ctrl-enter|shift-enter adds line to the textarea
            if (evt.ctrlKey || evt.shiftKey) {
                return true;
            }
            return false;
        }
    },
    
    
    onInputCanonicalKeyPress: function(evt) {
        switch (evt.keyCode) {
            case this.keys['ESCAPE']:
                return this.onEscape(evt);
            case this.keys['TAB']:
                this.closeAssistant();
                this.deactivateSearchBar(false);
                return true;
            case this.keys['DOWN_ARROW']:
            	// Left bracket and down arrow register as 40. If the shift key is down, then it must be a bracket.
                this.activateSearchBar();
            	if (!evt.shiftKey) return this.onInputDownArrow(evt);
            	break;
            case this.keys['ENTER']:
                return this.onInputEnter(evt);
            default:
                this.activateSearchBar();
                break;
        }

        // any other keypress is a change in the search string. 
        // although obviously we cant push context here, 
        // we can mark the context stale so if changes are made downstream
        // it will re-request fresh contexts back up at least to this module.
        this.setChildContextFreshness(false);
        return true;
    },

    onInputCanonicalKeyUp: function(evt) {
        switch (evt.keyCode) {
            case this.keys['ESCAPE']:
                return this.onEscape(evt);
            // is handled by onInputCanonicalKeyPress
            case this.keys['ENTER']:
                return false;
            case this.keys['DOWN_ARROW']:
            	// Left bracket and down arrow register as 40. If the shift key is down, then it must be a bracket.
            	if (evt.shiftKey) break;
            case this.keys['UP_ARROW']:
            case this.keys['LEFT_ARROW']:
            case this.keys['RIGHT_ARROW']:
                return true;
            default:
                break;
        }
        
        if (!this.assistantEnabled) {
            if (Splunk.util.normalizeBoolean(this.getParam(this.AUTO_ASSIST_PARAM_KEY))) {
                this.openAssistant();
            }
        } else {
            clearTimeout(this.assistantTimer);
            this.assistantTimer = setTimeout(this.fillAssistant.bind(this), parseInt(this.getParam('assistantDelay', 200), 10));
        }
        this.onInputChange();
        return true;
    },  
    
    onInputEnter: function(evt) {
        
        //ctrl-enter|shift-enter adds line to the textarea
        if (evt.ctrlKey || evt.shiftKey) {
            return true;
        }

	    this.deactivateSearchBar(false);
	    this._onFormSubmit();

        return false;
    },
    
    onInputDownArrow: function(evt) {
        if (this.assistantEnabled && this.assistantKeywordCount>0 && (!this.resize.isMultiline() || this.resize.caretIsLast())) {
            this.selectNextKeyword();
            return false;
        }
    }, 
        
        
    onKeywordCanonicalKeyPress: function(evt) {
        switch (evt.keyCode) {
            case this.keys['DOWN_ARROW']:
            	// Left bracket and down arrow register as 40. If the shift key is down, then it must be a bracket.
            	if (!evt.shiftKey) return this.onInputDownArrow(evt);
            	break;
            case this.keys['UP_ARROW']:
                return this.onKeywordUpArrow(evt);
            case this.keys['TAB']:
            case this.keys['ENTER']:
            case this.keys['RIGHT_ARROW']:
            case this.keys['SPACE_BAR']:
                return this.onKeywordSelect(evt);
            case this.keys['ESCAPE']:
                return this.onEscape(evt);
            default:
                break;
        }
        return true;
    },
        
    onKeywordCanonicalKeyUp: function(evt) {
        switch (evt.keyCode) {
            case this.keys['ESCAPE']:
                return this.onEscape(evt);

            // is handled by onKeywordCanonicalKeyPress
            case this.keys['DOWN_ARROW']:
            	// Left bracket and down arrow register as 40. If the shift key is down, then it must be a bracket.
            	if (!evt.shiftKey) return false;
            case this.keys['UP_ARROW']:
            case this.keys['TAB']:
            case this.keys['ENTER']:
            case this.keys['LEFT_ARROW']:
            case this.keys['RIGHT_ARROW']:
            case this.keys['SPACE_BAR']:
                return false;
            default:
                break;
        }
        
        if (!this.assistantEnabled) {
            if (Splunk.util.normalizeBoolean(this.getParam(this.AUTO_ASSIST_PARAM_KEY))) {
                this.openAssistant();
            }
        } else {
            clearTimeout(this.assistantTimer);
            this.assistantTimer = setTimeout(this.fillAssistant.bind(this), parseInt(this.getParam('assistantDelay', 200), 10));
        }
        return true;
    },   
    
    onKeywordDownArrow: function(evt) {
        if (this.assistantEnabled && this.assistantKeywordCount>0) {
            this.selectNextKeyword();
            return false;
        }
    },
    
    onKeywordUpArrow: function(evt) {
        if (this.assistantEnabled && (this.assistantKeywordCount>0)) {
            this.selectPreviousKeyword();
            return false;
        }
    },
    
    onKeywordSelect: function(evt) {
        if (this.assistantEnabled) {
            this.useSelectedKeyword(true);


            var searchString = $(evt.target).attr('replacement');
            
            if (searchString) {
                this.setSearchTerm(searchString);
                this.fillAssistant();
            }

            return false;
        }
    },
   
    onEscape: function(evt) {
        this.deactivateSearchBar(false);
        return false;
    }
});
