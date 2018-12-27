define(['lib/lodash', 'splunk.i18n'], function(_, i18n) {
    // use underscore's mixin functionality to add the ability to localize a string
    _.mixin({
        t: function(string) {
            return i18n._(string);
        }
    }, {
        'chain': false
    });

    return _.noConflict();
});
