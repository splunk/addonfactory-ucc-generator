/*
MIXIN CLASSES
This post css mixin inlines class styles from a separate style. Splunk uses this to backport classes designed for CSS Modules to our old classes.
Thanks to postcss-modules-extract-imports and postcss-import. This mashes those to plugins together.

<buttons.pcss>
.colors {
    color: white;
    background: blue;
}
.default {
    composes: colors;
    border-radius: 4px;
}

<legacy.pcss>
.btn {
    mixin: default from "buttons.pcss"
}

<legacy.css output>
.btn {
    color: white;
    background: blue;
    border-radius: 4px;
}

*/

var fs = require("fs");
var path = require("path");
var _ = require("lodash")
var postcss = require('postcss');

var declWhitelist = ['mixin']; //Only matach mixin
var declFilter = new RegExp('^(' + declWhitelist.join('|') + ')$');
var declRecursionWhitelist = ['mixin', 'composes']; // Recursively expand composes
var declRecursionFilter = new RegExp('^(' + declRecursionWhitelist.join('|') + ')$');
var matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)')$/;

module.exports = postcss.plugin('splunk-postcss-mixin-class', function (options) {
    options = _.merge({
        root: process.cwd(),
        async: false,
        path: [],
        skipDuplicates: true,
        filter: declFilter
    }, options || {})

  return function (css) {
    expandMixins(css, options);
  };
});

function expandMixins(css, options) {
    css.walkDecls(options.filter, function (decl) {
        var matches = decl.value.match(matchImports);
        var sourceCSS;
        var newNodes = [];
        var classNames;

        if (matches) { // mixin from a different file
            classNames = matches[1];
            var doubleQuotePath = matches[2];
            var singleQuotePath = matches[3];
            var filepath = doubleQuotePath || singleQuotePath;

            var sourceDir = path.dirname(decl.source.input.file);
            var resolvedFilepath = path.resolve(sourceDir, filepath);

            var fileContent = readFile(resolvedFilepath);

            var sourceCSS = postcss.parse(fileContent, {file: resolvedFilepath});

        } else { // mixin from current file
            sourceCSS = css.root();
            classNames = decl.value;
        }

        var ruleFilter = new RegExp('^(\\.' + classNames.split(' ').join('|\\.') + ')$');

        sourceCSS.walkRules(ruleFilter, function (rule) {
            options.filter = declRecursionFilter;
            expandMixins(rule, options); // recursion
            newNodes = newNodes.concat(rule.clone().nodes);
        });

        decl.replaceWith(newNodes);
    });

    return css;
}


/**
 * Check if a file exists
 *
 * @param {String} name
 */
function resolveFilename(name, root, paths, source, resolver) {
  var dir = source && source.input && source.input.file
    ? path.dirname(path.resolve(root, source.input.file))
    : root

  try {
    var resolveOpts = {
      basedir: dir,
      moduleDirectory: moduleDirectories.concat(paths),
      paths: paths,
      extensions: [ ".css" ],
      packageFilter: function processPackage(pkg) {
        pkg.main = pkg.style || "index.css"
        return pkg
      },
    }
    var file
    resolver = resolver || resolve.sync
    try {
      file = resolver(name, resolveOpts)
    }
    catch (e) {
      // fix to try relative files on windows with "./"
      // if it's look like it doesn't start with a relative path already
      // if (name.match(/^\.\.?/)) {throw e}
      try {
        file = resolver("./" + name, resolveOpts)
        console.log('file', file);
      }
      catch (err) {
        // LAST HOPE
        if (!paths.some(function(dir2) {
          file = path.join(dir2, name)
          return fs.existsSync(file)
        })) {
          throw err
        }
      }
    }

    return path.normalize(file)
  }
  catch (e) {
    throw new Error(
      "Failed to find '" + name + "' from " + root +
      "\n    in [ " +
      "\n        " + paths.join(",\n        ") +
      "\n    ]",
      source
    )
  }
}

function readFile(file, encoding) {
  return fs.readFileSync(file, encoding || "utf8");
}
