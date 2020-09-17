define(['underscore', 'models/shared/ClassicURL', 'util/console', 'util/url'], function(_, ClassicURLModel, console, urlUtil) {

    /**
     * Subclass of the ClassicURL model which adds support for encoding and decoding arrays of strings as a repeated
     * list of URL params.
     */
    var URLModel = ClassicURLModel.extend({
        encode: function(options) {
            var params = this.toJSON();
            return urlUtil.encode(params, options);
        },
        decode: urlUtil.decode
    });

    // Return a singleton instance of the URL model
    return new URLModel();
});
