Splunk.namespace("Splunk.scroller");
/**
 * A Y-Axis Scroller utility enabling vertical scrolling containers that are in multi column layouts, inline or at the bottom of a page.
 */
Splunk.scroller.YAxis = $.klass({
    RESIZE_BUFFER_TIME: 250,
    SCROLL_BUFFER_TIME: 250,
    UPDATE_SCROLLER_PIXEL_ADJUSTMENT: {other:-12, msie:-22},
    /**
     * Initializes scroller behavior, add event listeners and trigger an onUpdate event.
     * 
     * @param {Number} scrollerMinHeight Controls the scroller minumum pixel height constraint.
     * @param {Number} scrollerMaxHeight Controls the scroller maximum pixel height constraint.
     * @param {DOM||jQuery} container The target container element to enable scroller like behavior on.
     * @param {String} enabledClassName The CSS class name to apply when scrolling behavior is enabled.
     * @param {Object} options An object literal of optional params:
     *                 {Number} bottomLockHeight A non-negative integer indicating the height in pixels to lock bottom scroll bar.
     *                 {Number} topLockHeight A non-negative integer indicating the height in pixels to lock top scroll bar.
     *                 {Number} scrollHeightAdjust Certain complex css styles have adverse impacts on scroll height calculations, adjust to resolve delta.
     *                 {Boolean} logScrollHeightDelta Display in the console the delta between (offsetHeight + scrollTop) - scrollHeight. Useful for the calculation of scrollHeightAdjust. NOTE: Make sure scroll completely to end to see this value.
     */
    initialize: function(scrollerMinHeight, scrollerMaxHeight, container, enabledClassName, options){
        this.logger = Splunk.Logger.getLogger("Splunk.scroller.YAxis");
        this.scrollerMinHeight = scrollerMinHeight;
        this.scrollerMaxHeight = scrollerMaxHeight;
        this.container = $(container);
        this.enabledClassName = enabledClassName;
        this.options = options || {};
        this.bottomLockHeight = this.options.hasOwnProperty("bottomLockHeight")?this.options.bottomLockHeight:-1;
        this.topLockHeight = this.options.hasOwnProperty("topLockHeight")?this.options.topLockHeight:-1;
        this.scrollHeightAdjust =  this.options.hasOwnProperty("scrollHeightAdjust")?this.options.scrollHeightAdjust:0;
        this.logScrollHeightDelta = this.options.hasOwnProperty("logScrollHeightDelta")?this.options.logScrollHeightDelta:false;
        this.lockBottom = false;
        this.lockTop = false;
        this.onResizeBuffer = [];//Buffer resize events are tres rapide
        this.onScrollBuffer = [];//Buffer scroll events are tres rapide
        $(window).bind("resize", this.onResize.bind(this));
        $(this.container).bind("scroll", this.onScroll.bind(this));
        this.container.addClass(this.enabledClassName);
        this.onResize();
    },
    /**
     * Destroy/Disable scroller behavior, remove event listeners and reset the height of the container.
     */
    destroy: function(){
        $(window).unbind("resize", this.onResize.bind(this));
        $(this.container).unbind("scroll", this.onScroll.bind(this));
        this.container.removeClass(this.enabledClassName);
        this.container.height("");
    },
    /**
     * Resize the content area (container) to pageYOffset, window height and cumulativeOffsetTop while respecting
     * scrollerMaxHeight and scrollerMinHeight constraints. 
     */
    onResize: function(){
        this.onResizeBuffer.push("");
        //this.logger.info("look how chatty I am! Never operate on onresize events unless you have a buffer.");
        setTimeout(
            function(){
                if(this.onResizeBuffer.length>0){
                    var pixelAdjustment = (jQuery.browser.msie)?this.UPDATE_SCROLLER_PIXEL_ADJUSTMENT.msie:this.UPDATE_SCROLLER_PIXEL_ADJUSTMENT.other;
                    var height = ($(window).height() + Splunk.util.getPageYOffset() + pixelAdjustment) - Splunk.util.getCumlativeOffsetTop(this.container[0]);
                    height = Math.min(height, this.scrollerMaxHeight);
                    height = Math.max(height, this.scrollerMinHeight);
                    this.onResizeBuffer = [];
                    this.container.height(height);
                }
            }.bind(this),
            this.RESIZE_BUFFER_TIME
        );
    },
    /**
     * Handle bottom/top locking.
     */
    onScroll: function(){
        this.onScrollBuffer.push("");
        setTimeout(
            function(){
                if(this.onScrollBuffer.length>0){
                    this.onScrollBuffer = [];
                    var bottomPosition = this.container[0].offsetHeight + this.container[0].scrollTop; // + this.bottomLockHeight;
                    if(this.logScrollHeightDelta){
                        this.logger.info("logScrollHeightDelta", (this.container[0].offsetHeight + this.container[0].scrollTop) - (this.scrollHeight() - this.scrollHeightAdjust));
                    }
                    if(bottomPosition>=this.scrollHeight()){
                        //this.logger.info("onScroll this.lockBottom");
                        this.lockBottom = true;
                        this.lockTop = false;
                        return;
                    }
                    this.lockBottom = false;
                    if(this.container[0].scrollTop<=this.topLockHeight){
                        //this.logger.info("onScroll this.lockTop");
                        this.lockTop = true;
                        this.lockBottom = false;
                        return;
                    }
                    this.lockTop = false;
                    return;
                }
            }.bind(this),
            this.SCROLL_BUFFER_TIME
        );
    },
    /**
     * Safely retrieve the current scrollHeight adjusted for margins and standard deviations.
     * 
     * @type Number
     * @return The safe scrollHeight.
     */
    scrollHeight: function(){
        return this.container[0].scrollHeight + parseInt(this.container.css("margin-top"), 10) + parseInt(this.container.css("margin-bottom"), 10) + this.scrollHeightAdjust;
    },
    /**
     * Update the scroller to snap to the appropriate position. Call this method during content updates.
     */
    snap: function(){
        if(this.lockBottom){
            this.logger.info("snap back to bottom");
            this.container[0].scrollTop = this.scrollHeight();
        }else if(this.lockTop){
            this.logger.info("snap back to top");
            this.container[0].scrollTop = 0;
        }
    },
    /**
     * Resets the scroller by forcing an update and calling snap.
     */
    reset:function(){
        this.onResize();
        this.snap();
    }
});