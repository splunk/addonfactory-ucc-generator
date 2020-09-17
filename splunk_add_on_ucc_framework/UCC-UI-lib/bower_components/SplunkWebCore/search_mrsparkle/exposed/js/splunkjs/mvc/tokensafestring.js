define(function(require, exports, module) {
    /**
     * Wraps a string to mark it to be interpreted as a template
     * that needs to be substituted.
     * 
     * @see splunkjs.mvc.tokenSafe
     */
    // Historical Note: The name of this class is inspired by
    //                  Django's 'SafeString' class.
    var TokenSafeString = function(value) {
        this.value = value;
    };

    return TokenSafeString;
});
