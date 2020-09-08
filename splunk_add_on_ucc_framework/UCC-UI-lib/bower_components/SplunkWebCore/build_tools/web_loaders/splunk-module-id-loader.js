/**
 * This is a webpack loader that replaces every instance of 'module.id' in a
 * source file with the id that would have been derived by requirejs.
 *
 * @param {String} - The file contents
 * @returns The updated file contents, with 'module.id' replaced
 */
module.exports = function moduleIdLoader(content) {
    // Notify webpack that this loader is cacheable
    this.cacheable();

    // Calculate the module id from the resourcePath by stripping everything
    // up to and including the 'stripString'. This is a string that we are 
    // certain all resourcePaths contain, but should not be included in the
    // module id.
    var stripString = 'web/search_mrsparkle/exposed/js/';
    var start = this.resourcePath.indexOf(stripString) + stripString.length;
    var end = this.resourcePath.length - 3;
    var moduleId = this.resourcePath.substring(start, end);
    return content.replace(/module\.id/g, '"' + moduleId + '"');
};
