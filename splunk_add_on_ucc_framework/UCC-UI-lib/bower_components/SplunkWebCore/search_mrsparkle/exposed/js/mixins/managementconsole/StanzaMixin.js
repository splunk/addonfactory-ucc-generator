define(
    [
        'jquery',
        'underscore',
        'backbone'
    ],
    function(
        $,
        _,
        Backbone
    ) {
        return {
            getResolvedUrl: function(url, bundle, type) {
                // "/" needs to be encoded to "%252F" or they break the URL, WSGI requires double encoding
                type = encodeURIComponent(encodeURIComponent(type));
                return [url, bundle, type].join('/');
            }
        };
    }
);
