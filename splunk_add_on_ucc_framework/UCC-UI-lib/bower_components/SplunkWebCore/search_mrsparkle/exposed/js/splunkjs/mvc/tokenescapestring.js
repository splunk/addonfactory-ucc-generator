define(function(require, exports, module) {
    /**
     * Wraps a string to mark it to be interpreted as a literal.
     * 
     * @see splunkjs.mvc.tokenEscape
     */
    // Historical Note: The name of this class is inspired by
    //                  Django's 'EscapeString' class.
    var TokenEscapeString = function(value) {
        this.value = value;
    };

    return TokenEscapeString;
});
