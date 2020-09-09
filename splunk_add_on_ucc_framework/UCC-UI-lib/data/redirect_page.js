/*global require,document*/
require([], function() {
    // This method takes param name and searches it from windows url, if found returns it
    var getUrlParam = function(param) {
        var params = window.location.search.substring(1);
        params = params.split("&");
        for (var i = 0; i < params.length; i++) {
            var kv = params[i].split("=");
            if(kv[0] === param) {
                return kv[1];
            }
        }
    };
    // Check if we get any error param in url
    var error = getUrlParam("error"),
        message = {};
    // If we get error param return the error param
    if (error !== undefined) {
        message = {"error":error};
    } else {
        // Else return the code and state param
        var code = getUrlParam("code"),
            state = getUrlParam("state");
        message = {"code": code, "state": state};
    }
    // Call the parent windows' getMessage method
    window.opener.getMessage(message);
    // Close the window
    window.close();
});