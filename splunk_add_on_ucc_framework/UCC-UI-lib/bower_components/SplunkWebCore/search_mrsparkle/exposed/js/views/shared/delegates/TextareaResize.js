/**
 *   views/shared/delegates/TextareaResize
 *
 *   Desc:
 *     This class applies auto resizing to textareas.  Textareas will resize as input changes until it reaches the maximum
 *     number of lines (specified in options, defaults to 5), after which the textarea will scroll.

 *   @param {Object} (Optional) options An optional object literal having non-required settings.
 *
 *    Usage:
 *       var t = new Splunk.TextareaResize({ options array })
 *
 *    Options:
 *        maxLines: (int) number to indicate the maximum lines to expand to.  ex: 5 (limits expansion to 5 lines, scroll after)
 *
 *    Methods:
 *        resizeTextarea: If the view updates the content, it needs to call resizeTextarea().
 *
 *
 *    ***NOTE***: this is a port and modification of the Elastic plugin for jquery.  The original plugin's page can be found here:  http://www.unwrongest.com/projects/elastic/
 */
define([
    'jquery',
    'views/shared/delegates/Base',
    'underscore',
    'helpers/user_agent',
    'splunk.logger'
],
function(
    $,
    DelegateBase,
    _,
    userAgent,
    sLogger
){
    return DelegateBase.extend({
        maxHeightMultiple: 5,
        maxHeight: null,
        lineHeight: null,
        minHeight: null,
        initialize: function(){
            this.logger = sLogger.getLogger("textarea_resize.js");

            this.content = null;
            this.$shadow = null;

            //defaults
            var defaults = {
                maxLines : this.maxHeightMultiple
            };

            _.defaults(this.options, defaults);

            this.lineHeight = parseInt(this.$el.css('lineHeight'),10) || parseInt(this.$el.css('fontSize'),10) + 1 || 20;
            this.minHeight = this.options.minHeight || this.options.lineHeight ;
            this.maxHeight = this.options['maxLines'] * this.lineHeight;

            // Create shadow div that will be identical to the textarea, used for measuring height changes
            this._createShadow();

            //fire off the first one to resize
            this.resizeTextarea();
            this.nameSpace = 'textarearesize-' + this.cid;

            //Non element event handlers
            $(window).on('resize.' +  this.nameSpace, this.resizeTextarea.bind(this));
        },
       /**
        *   function to set up event handles.
        */
       events: {
            "keyup": "debouncedResizeTextarea",
            "paste": "debouncedResizeTextarea",
            "cut": "debouncedResizeTextarea"
       },
       /**
        *   create a shadow div (or twin) of the textarea. we'll use this to measure how tall the textarea should be by copying the content from the
        *   textarea into the div and then measure it
        */
        _createShadow: function() {
            if (!this.$shadow) {
                //style attributes to copy from the textarea into the shadow div
                var styleAttrs = new Array('paddingTop','paddingRight','paddingBottom','paddingLeft','fontSize','lineHeight','fontFamily','fontWeight', 'wordWrap','whiteSpace','borderLeftWidth','borderLeftColor','borderLeftStyle','borderRightWidth','borderRightColor','borderRightStyle','borderTopWidth','borderTopColor','borderTopStyle','borderBottomWidth','borderBottomColor','borderBottomStyle','boxSizing');

                //create the shadow div (twin)
               this.$shadow = $('<div class="shadowTextarea"></div>').css({'position': 'absolute','left':'-9999px','top':'-9999px', 'marginRight' : "-3000px"}).appendTo(this.$el.parent());
                //    copy each of the attribute specified in styleAttributes from the textarea onto the shadow div
                var styles= {};
                _.each(styleAttrs, function(attr){
                    var value = this.$el.css(attr);
                    styles[attr] = (attr == "whiteSpace" && value == "normal") ? "pre-wrap" : value; // FF reports normal instead of pre-wrap.
                }, this);
                this.$shadow.css(styles);

                this._adjustShadowWidth();
            }
        },
        /**
        *   function to set the shadow div's width to the textarea width
        */
        _adjustShadowWidth: function() {
            if (this.$shadow) {
                this.$shadow.css("width", this.$el.css('width') || '0 px');
            }
        },
        /**
        *   function to actually do the resizing
        */
        resizeTextarea: function() {           
            if (this.$el.val() != this.content) {
                this.content = this.$el.val();
                if (userAgent.isIE11()) {
                    // IE11 bug SPL-113963
                    this.$shadow[0].innerText = this.content;
                } else {
                    this.$shadow.text(this.content);
                }
            }

            //if the height of the two twins is different by more than 3 px.
            this._adjustShadowWidth();
            var shadowHeight = parseInt(this.$shadow.css('height') || 0, 10),
                elementHeight = parseInt(this.$el.css('height') || 0, 10),
                endsInNewLineRegex = /.*(\n)$/;
            if (endsInNewLineRegex.test(this.content)) {
                shadowHeight = shadowHeight + this.lineHeight;
            }

            if (Math.abs(shadowHeight - elementHeight) > 3) {
                var newHeight = shadowHeight;
                if (newHeight >= this.maxHeight) {
                    this._setHeight(this.maxHeight, elementHeight, 'auto');
                } else if ( newHeight <= this.minHeight ) {
                    this._setHeight(this.minHeight, elementHeight, 'hidden');
                } else {
                    this._setHeight(newHeight, elementHeight, 'hidden');
                }
            }
        },
        debouncedResizeTextarea: function() {
            if (!this._debouncedResizeTextarea) {
                this._debouncedResizeTextarea = _.debounce(this.resizeTextarea);
            }
            this._debouncedResizeTextarea.apply(this, arguments);
        },
        /**
         *  function to set the height of the textarea
         */
        _setHeight: function(height, elementHeight, overflow) {
            var curratedHeight = Math.floor(parseInt(height, 10));
            if (elementHeight != curratedHeight) {
                this.$el.css({'height': curratedHeight + 'px', 'overflow': overflow});
            }
        },
         /**
        *  function to find out if there is more than one line of text.
        */
        isMultiline: function() {
            var lineCount = Math.floor(parseInt((this.$el.css('height') || 0), 10) / this.lineHeight) ;
            return (lineCount > 1);
        },
        /**
        *  Function to find out if the caret is at the end of the string.
        *  This function was migrated from textarea_resize.js
        */
        isCaretLastPos: function(caretPos) {
            return (caretPos >= this.content.length);
        },
        remove: function() {
            DelegateBase.prototype.remove.apply(this);
            $(window).off('resize.' + this.nameSpace);
            return this;
        }
    });
});