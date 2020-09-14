/**
 * Screen for the X-Splunk-Messages-Available bit flag.
 * If the bit flag is present, request the messenger update
 * itself from the appserver.
 */ 

$(function(){

    $('body').bind('ajaxComplete', function(event, xhr, opts) {
        // xhr is undefined for off-site ajax requests like the
        // request to quickdraw in login.js
        if (xhr !== undefined && xhr.readyState == 4 && xhr.getResponseHeader('X-Splunk-Messages-Available')) {
            Splunk.Messenger.System.getInstance().getServerMessages();
        }
    });

});
