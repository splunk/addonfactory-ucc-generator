define(['underscore'], function(_) {

    function quoteRegex(str) {
        return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }

    function likeMatch(str, pattern) {
        pattern = quoteRegex(pattern).replace(/_/g, '.').replace(/%/g, '.*');
        var r = new RegExp(pattern);
        if (_.isArray(str)) {
            return _(str).any(function(s) {
                return !!s.match(r);
            });
        } else {
            return !!str.match(r);
        }
    }

    return likeMatch;

});