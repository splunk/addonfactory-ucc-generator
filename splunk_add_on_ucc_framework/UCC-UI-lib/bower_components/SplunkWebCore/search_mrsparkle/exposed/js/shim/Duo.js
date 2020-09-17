define(["contrib/Duo-Web-v2"], function() {
    var Duo = window.Duo;
    delete window.Duo;
    return Duo;
});
