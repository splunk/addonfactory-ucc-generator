var coreJSRequire = 'require(\'core-js/es6\');\n';
var useStrictRegExp = /^['"]use strict['"];?/;

/**
 * A webpack loader that prepends a require statement importing
 * the core-js ES6 polyfill. Handles 'use strict' statements if
 * they appear at the very beginning of the resource.
 *
 * @param content - module content
 * @returns - polyfilled or unmodified module content
 */
module.exports = function (content) {
    this.cacheable();

    var result = useStrictRegExp.exec(content);
    if (result) {
        return '\'use strict\';\n' + coreJSRequire + content.slice(result[0].length);
    }

    return coreJSRequire + content;
};