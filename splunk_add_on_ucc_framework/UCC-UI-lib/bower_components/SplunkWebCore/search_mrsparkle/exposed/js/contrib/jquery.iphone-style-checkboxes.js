/*
 This was previously a jQuery library which enabled checkboxes
 to be decorated like iPhone-looking binary toggle switches.
 It has since been licensed under a paid license, so it's been
 deprecated and turned into a no-op to protect against piracy.
 */
(function($, iphoneStyle) {

$.fn[iphoneStyle] = function(options) {
    if(console && console.log) {
        console.log("jquery.iphone-style-checkboxes library has been deprecated. Please use another solution.");
    }
    return this;
};

})(jQuery, 'iphoneStyle');
