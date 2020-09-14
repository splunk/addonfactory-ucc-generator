/**
 *   Splunk.TextareaResize 
 *
 *   Desc:
 *     This class applies auto resizing to textareas.  Textareas will resize as input changes until it reaches the maximum
 *     number of lines (specified in options, defaults to 5), after which the textarea will scroll. 
 *
 *   @param {Object} textarea A jQuery element reference to the textarea to auto-resize
 *   @param {Object} (Optional) options An optional object literal having non-required settings.
 *
 *    Usage:
 *       var t = new Splunk.TextareaResize($('textarea'), { options array })
 *
 *    Options:
 *        max_lines: (int) number to indicate the maximum lines to expand to.  ex: 5 (limits expansion to 5 lines, scroll after)
 *        NOTE: max_lines does not work correctly if there isn't a line-height set on the textarea.  Still cuts off and scrolls, but not at an accurate line-count.  TODO: fix that
 *      
 *    Methods:
 *        there are no intentionally public methods
 *
 *
 *    ***NOTE***: this is a port and modification of the Elastic plugin for jquery.  The original plugin's page can be found here:  http://www.unwrongest.com/projects/elastic/
 */

Splunk.TextareaResize = $.klass({
   MAX_HEIGHT_MULTIPLE: 5,
   MAX_HEIGHT: null,
   LINE_HEIGHT: null, //also serves as minheight, as we can't have less than one line
    
   initialize: function(textarea, options){
       this.logger = Splunk.Logger.getLogger("textarea_resize.js");

        if ( !textarea ) {
            this.logger.error('Splunk.TextareaResize: No textarea to resize specified');
        } else {
            this.input = $(textarea);
            this.inputContent = null;
            this.shadow = null;
    
            //defaults
            this._options = {
                max_lines : this.MAX_HEIGHT_MULTIPLE,
                pageType : null
            };
    
            // Set the options using the defaults
            if (options) $.extend(this._options, options);
            
            this.LINE_HEIGHT = parseInt(this.input.css('lineHeight'),10) || parseInt(this.input.css('fontSize'),10) + 1 || 20;
            this.MAX_HEIGHT = this._options['max_lines'] * this.LINE_HEIGHT;

            // Create shadow div that will be identical to the textarea, used for measuring height changes
            this._createShadow();
            
            // set up event handlers
            this._setupEventHandlers();
            
            //fire off the first one to resize
            this._resizeSearchBar();
        }
   },
   /**
    *   function to set up event handles.
    */
   _setupEventHandlers: function() {
        // on focus of the input, start observing the textarea
        this.input.focus(this._startObserving.bind(this));
        //on blur, stop observing
        this.input.blur(this._stopObserving.bind(this));  
        
        this.input.one('keyup', this._onKeyUp.bind(this));
        
        $(window).resize(this._onResize.bind(this));
   },
   /**
    *   create a shadow div (or twin) of the textarea. we'll use this to measure how tall the textarea should be by copying the content from the
    *   textarea into the div and then measure it
    */
   _createShadow: function() {
        if ( !this.shadow ) {
            //style attributes to copy from the textarea into the shadow div
			var styleAttrs = new Array('paddingTop','paddingRight','paddingBottom','paddingLeft','fontSize','lineHeight','fontFamily','fontWeight', 'wordWrap', 'whiteSpace');
			
			//create the shadow div (twin) 
			this.shadow = $('<div class="shadowTextarea"></div>').css({'position': 'absolute','left':'-9999px','top':'-9999px', 'marginRight' : "-3000px"}).appendTo(this.input.parent());
			
			if ( $.browser.mozilla && $.browser.version.substr(0,3) < "1.9" ){ // this is a fix for a bug in ff2 
                this.shadow.css('position','fixed');
            }

			var context = this;	
			//	copy each of the attribute specified in styleAttributes from the textarea onto the shadow div	
			$.each(styleAttrs, function(){
				attr = this.toString();
				value = context.input.css(attr);
				value = (value == "pre") ? "normal" : value; // white-space cannot be pre, as IE likes to think it is.
				context.shadow.css(attr, value);
			});   
			this._adjustShadowWidth();
        }
   },
   /**
    *   function to set the shadow div's width to the textarea width
    */
   _adjustShadowWidth: function() {
      if ( this.shadow ) {
            this.shadow.css('width',this.input.width());
            if(this._options.pageType=="manager-page"){
                this.shadow.css('height',this.input.height());
            }
      }
   },
   /**
    *   function to actually do the resizing
    */
   _resizeSearchBar: function() {
   		if (this.input.val() != this.inputContent) {
	   		this.inputContent = this.input.val();
	   		
	   		//creating an empty div with the contetns of the input allows us to encode the HTML entities.
	        var textareaContent = $('<div/>')
	        				.text(this.inputContent).html()
	        				.replace(/\n/g, '<br />')
	        				+ "<span class=''></span>";
	        
	         //set shadow div to have same contents as searchbar
	        this.shadow.html(textareaContent);
        }
    
        //if the height of the two twins is different by more than 3 px.
        this._adjustShadowWidth();
        if(Math.abs(this.shadow.height() - this.input.height()) > 3 && this._options.pageType!="manager-page"){    
            var newHeight = this.shadow.height();
            
            if ( newHeight >= this.MAX_HEIGHT ) 
                this._setHeight(this.MAX_HEIGHT, 'auto');
            else if ( newHeight <= this.LINE_HEIGHT )
                this._setHeight(this.LINE_HEIGHT, 'hidden');
            else
                this._setHeight(newHeight, 'hidden');
        } 
    
    },
    /**
     *  function to set the height of the textarea
     */
    _setHeight: function(height, overflow) {
		var curratedHeight = Math.floor(parseInt(height,10));
		if(this.input.height() != curratedHeight){
			this.input.css({'height': curratedHeight + 'px','overflow':overflow});
		}
	},
	/**
	 *  function to observe textarea for changes while focused (polling)
	 */
	_startObserving: function() {
        this.timer = setInterval(function(){
            this._resizeSearchBar();
        }.bind(this), 50);     
    },
    /**
     *  function to cancel observing on textarea blur
     */
    _stopObserving: function(){
        clearInterval(this.timer);
    },
    /**
     *  function to fire when window is resized. adjusts shadow width and fires the resizing method
     */
    _onResize: function() {
        this._adjustShadowWidth();
        this._resizeSearchBar();   
    },
    /**
     *  function (one-time) that makes sure resizing is kicked off if they're already in the textarea when this class is applied (already focused)
     */
     _onKeyUp: function() {
        this._startObserving();   
     },
      /**
     *  function to find the position of the caret (cursor/insertion point) in the textarea.
     */
     _getcaretPosition: function() {
     	var caretPos = 0,
     	inputControl = this.input[0];	
     	if (document.selection) { // IE
     		inputControl.focus();
     		var sel = document.selection.createRange ();
     		sel.moveStart ('character', -inputControl.value.length);
     		caretPos = sel.text.length;
     	} else if (inputControl.selectionStart || inputControl.selectionStart == '0') { // Standards
     		caretPos = inputControl.selectionStart;
     	}
     	return (caretPos);
     },
	 /**
	*  function to find out if the caret is at the end of the string.
	*/
	caretIsLast: function() {
		return (this._getcaretPosition() >= this.input.val().length);
	},
	 /**
	*  function to find out if there is more than one line of text.
	*/
	isMultiline: function() {
		var lineCount = Math.round(this.input.height() / this.LINE_HEIGHT) ;
		return (lineCount > 1);
	}
});

























