Splunk.namespace("Splunk.Error");
Splunk.Error.PROPAGATE = true; //if error should propagate or not
Splunk.Error.loggerMode = Splunk.Logger.mode.Server; //the desired Splunk.Logger.mode
/**
 * The Handler singleton provides a standard interface for handling all thrown exceptions.
 * Dependency on splunk.js, logger.js
 */
/*jshint -W057:false */
Splunk.Error.Handler = new function(){
/*jshint -W057:true */
    var self = this,
        logger = Splunk.Logger.getLogger("Splunk.Error", Splunk.Error.loggerMode);
    /**
     * Interface for handling window.onerror events, first log it to standard logger, second re-throw the original exception if PROPAGATE set to true.
     *
     * @param {String} msg The error message
     * @param {String} url The error source url
     * @param {String} line The error line reference
     */
    self.onerror = function(message, fileName, lineNumber){
        var output = format(message, fileName, lineNumber);
        logger.error(output);
        return !Splunk.Error.PROPAGATE; //return true to stop error propagation, false to allow propagation
    };
    /**
     * Interface for throwing an error, first log it to standard logger, second re-throw the original exception if PROPAGATE set to true.
     *
     * @param {Error} error The error object caught
     */
    self.raise = function(error){
        var output = format(error.message, error.fileName, error.lineNumber);
        logger.error(output);
        if(Splunk.Error.PROPAGATE){
            throw error;
        }
    };
    /**
     * Format a logger message.
     * 
     * @param {String} message Human-readable description of the error.
     * @param {String} fileName The name of the file containing the code that caused the exception.
     * @param {Number} lineNumber The line number of the code that caused the exception.
     */
    var format = function(message, fileName, lineNumber){
        return "lineNumber=" + lineNumber + ", message=" + message + ", fileName=" + fileName;
    };
    /**
     * In Firefox if an error is thrown in an event handler attached using addEventListener
     * it will not make it to the window.onerror handler, see: https://bugzilla.mozilla.org/show_bug.cgi?id=312448
     * Override jQuery.fn.bind with a handler in a try/catch block.
     *
     * Note: This is currently broken, event exceptions in ff will not be caught.
     */
    var jQueryHandler = function(){
        var bindCopy = jQuery.fn.bind;
        jQuery.fn.bind = function(type, data, fn){
            if(!fn && data && typeof(data)=='function'){
                fn = data;
                data = null;
            }
            if(fn){
                var fnCopy = fn;
                var handler = function(){
                    try{
                        fnCopy.apply(this, arguments);
                    }catch(e){
                        self.raise(e);
                    }
                };
                fn = handler;
            }
            return bindCopy.call(this, type, data, fn);
        };
    };
    /**
     * Constructor for Handler interface
     */   
    self.Error = function(){
        window.onerror = self.onerror; //use onerror instead of $(window).error( ... ) for proper stack trace, Webkit does not support window.onerror, see: https://bugs.webkit.org/show_bug.cgi?id=8519
        //jQueryHandler();
    }();
};