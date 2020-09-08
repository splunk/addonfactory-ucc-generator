Splunk.namespace("Splunk.Print");
/**
 * A simple class that dispatches jQuery document events Splunk.Print.START_EVENT, Splunk.Print.END_EVENT and Splunk.Print.PAGE_EVENT.
 * Flash movies are replaced with an image overlay if Flash printing not supported.
 * Dependencies on Splunk.util, Splunk.JABridge and jQuery.
 * 
 * w00t print it is!
 * 
 * @author Doc Yes
 */

var agentString = window.navigator.userAgent,
    isIE = /msie/i.test(agentString),
    isIE7 = /msie 7\.0/i.test(agentString),
    isIE8 = /msie 8\.0/i.test(agentString);

Splunk.Print = $.klass({
    START_EVENT: "PrintStart",
    END_EVENT: "PrintEnd",
    PAGE_EVENT: "PrintPage",
    // IE less than 9 is very inconsistent when it comes to setting print widths, so we err on the side of caution with 700px
    // all other browsers work great with a standard 800px
    PAGE_WIDTH: (isIE7 || isIE8) ? "700px" : "800px",
    WINDOW_PRINT_END_EVENT_DELAY: 1000,
    /**
     * Initializes Print.
     */
    initialize: function(){
        this.logger = Splunk.Logger.getLogger("Splunk.Print");
        $(document).bind(this.START_EVENT, this.onPrintStart.bind(this));
        $(document).bind(this.END_EVENT, this.onPrintEnd.bind(this));
        $(document).bind(this.PAGE_EVENT, this.onPrintPage.bind(this));
        
        // try binding to native print events
        this.bindPrintEvents();
    },
    /**
     * End of UI print event.
     * 
     * @param {Object) event The jQuery passed event.
     */
    onPrintEnd: function(event){
        this.logger.info("Splunk.Print.END_EVENT fired");
    },
    /**
     * Print page, emulates complete print lifecyle (PRINT_START event, window.print and PRINT_END event).
     * NOTE: The excessive setTimeout use gives execution sequence.
     * 
     * @param {Object} event The jQuery pass event.
     */
    onPrintPage: function(event) {
        var bodyStyle = $('body')[0].style,
            currentX = window.pageXOffset, 
            currentY = window.pageYOffset,
            
            printPrepare = function() {
                $('body').addClass('print').css({
                    'width': this.PAGE_WIDTH,
                    'min-width': 0
                });
                window.scrollTo(0, document.body.offsetHeight);
            }.bind(this),
            
            printCleanup = function() {
                $('body').removeClass('print');
                bodyStyle.width = "";
                bodyStyle['min-width'] = '';
                window.scrollTo(currentX, currentY);
            };
        
        this.logger.info("Splunk.Print.PAGE_EVENT fired");
        if(isIE) {
            printPrepare();
            $(document).trigger(this.START_EVENT);
            window.print();
            printCleanup();
            $(document).trigger(this.END_EVENT);
        }
        else if(this.isChromeThirteenPlus()) {
            // have to special-case the newer versions of Chrome because they might or might not use the "print preview" feature
            var printPreviewMode = false;
            $(window).bind('blur.splunkPrint', function() {
                // listen for an on-blur event, indicating that print preview mode has popped open a new tab
                // in this case, attach an on-focus event that will perform the print cleanup
                printPreviewMode = true;
                $(window).bind('focus.splunkPrint', function() {
                    printCleanup();
                    $(document).trigger(this.END_EVENT);
                    // now that our print preview handling work is done, clean up the event listeners
                    $(window).unbind('.splunkPrint');
                }.bind(this));
            }.bind(this));
            printPrepare();
            setTimeout(function() {
                $(document).trigger(this.START_EVENT);
            }.bind(this),0);
            setTimeout(function() {
                window.print();
                setTimeout(function() {
                    // only trigger the print cleanup here if we are NOT in print preview mode,
                    // because if we are we had no guarantee that window.print() was a synchronous operation
                    if(!printPreviewMode) {
                        printCleanup();
                        // do the unbinding here too just in case
                        $(window).unbind('.splunkPrint');
                        $(document).trigger(this.END_EVENT);
                    }
                }.bind(this), this.WINDOW_PRINT_END_EVENT_DELAY);
            }.bind(this), 0);
        }
        else {
            printPrepare();
            setTimeout(function() {
                $(document).trigger(this.START_EVENT);
            }.bind(this),0);
            setTimeout(function() {
                window.print();
                setTimeout(function() {
                    printCleanup();
                    $(document).trigger(this.END_EVENT);
                }.bind(this), this.WINDOW_PRINT_END_EVENT_DELAY);
            }.bind(this), 0);
        }
    },
    /**
     * Start of a new UI print event. Find all JABridge instances, toggle visibility to hidden, replace with an overlay base64 snapshot received from flash (w00t!).
     * 
     * @param {Object) event The jQuery passed event.
     */
    onPrintStart: function(event){
        this.logger.info("Splunk.Print.START_EVENT fired");
    },
    
    bindPrintEvents: function() {
        var onBeforePrint = function() {
            $('body').css('width', this.PAGE_WIDTH);
            $(document).trigger(this.START_EVENT);
        }.bind(this);

        var onAfterPrint = function() {
            $('body').css('width', "");
            $(document).trigger(this.END_EVENT);
        }.bind(this);

        if (window.onbeforeprint !== undefined) {
            if (window.addEventListener) {
                window.addEventListener('beforeprint', onBeforePrint, false);
                window.addEventListener('afterprint', onAfterPrint, false);
            } else if (window.attachEvent) {
                window.attachEvent('onbeforeprint', onBeforePrint);
                window.attachEvent('onafterprint', onAfterPrint);
            }
        } else if (window.matchMedia) {
            var mediaQueryList = window.matchMedia('print');
            if (mediaQueryList && mediaQueryList.addListener) {
                mediaQueryList.addListener(function(mql) {
                    if (mql) {
                        if (mql.matches) {
                            onBeforePrint();
                        } else {
                            onAfterPrint();
                        }
                    }
                });
            }
        }
    },
    
    // returns true if the user agent is Chrome and the version is 13 or higher
    isChromeThirteenPlus: function() {
        var chromeRegex = /chrome\/(\d+)/i,
            chromeInfo = chromeRegex.exec(navigator.userAgent);
        
        return !!(chromeInfo && (parseInt(chromeInfo[1], 10) >= 13));
    }
    
});
Splunk.Print.instance = null;
/**
 * Singleton reference to a Print object.
 *
 * @return A reference to a shared Print object.
 * @type Object
 */
Splunk.Print.getInstance = function(){
    if(!Splunk.Print.instance){
        Splunk.Print.instance = new Splunk.Print();
    }
    return Splunk.Print.instance;
};