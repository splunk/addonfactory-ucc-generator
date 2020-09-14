define(['contrib/leaflet/leaflet.css',
       'imports?this=>window!contrib/leaflet/leaflet'], function(css, leaflet) {
    // SPL-98647: monkey patch the getParamString method to avoid an XSS vulnerability in our
    // version of Leaflet.
    // See https://github.com/Leaflet/Leaflet/pull/1317/files
    if (leaflet && leaflet.Util) {
        leaflet.Util.getParamString = function(obj, existingUrl) {
            var params = [];
            for(var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    params.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
                }
            }
            return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
        };
    }

    return leaflet;

});
