/**
 * This plugin replaces the default umd output so that when an amd or commonjs
 * environment is detected, the module is anonymous and required with the path
 * to the file (ie `api/layout`). If neither an amd nor a commonjs environment
 * is detected, it will create a global called `__splunk_layout__`.
 *
 * This plugin is only intended for use by layout.config.js.
 *
 */
function SplunkLayoutUMDTemplateReplacementPlugin() {}

SplunkLayoutUMDTemplateReplacementPlugin.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation) {
        compilation.templatesPlugin('render-with-entry', function(source) {
            var target = /else {([\S\s]*)\n\t}/;
            var replacement = 'else {\n\t\troot["__splunk_layout__"] = factory();\n\t}';
            source.children[0]._value = source.children[0]._value
                .replace(target, replacement);
            return source;
        });
    });
};

module.exports = SplunkLayoutUMDTemplateReplacementPlugin;
