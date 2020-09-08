var postcss = require('postcss');
var path = require('path');

module.exports = postcss.plugin('splunk-theme-import', function (options) {
    return function (css) {
        var basedir = path.resolve(__dirname, '../../../search_mrsparkle/exposed/pcss/base/');
        var relativedir = path.relative(path.dirname(css.source.input.file), basedir) || '.';

        css.prepend({ name: 'import', params: '"' + relativedir + '/mixins-shared.pcss"', source: css.source });
        css.prepend({ name: 'import', params: '"' + relativedir + '/mixins-' + options.theme + '.pcss"', source: css.source });
        css.prepend({ name: 'import', params: '"' + relativedir + '/variables-' + options.theme + '.pcss"', source: css.source });
    };
});
