var path = require('path');

var nodeCmd = path.join(process.env.SPLUNK_HOME, 'bin', 'node');
var lessCmd = path.join(process.env.SPLUNK_HOME, 'lib', 'node_modules', 'less', 'bin', 'lessc');
var jsdocCmd = path.join(process.env.SPLUNK_HOME, 'lib', 'node_modules', 'jsdoc', 'jsdoc.js');
var rjs = path.join(process.env.SPLUNK_HOME, 'lib', 'node_modules', 'requirejs', 'bin', 'r.js');
var lessClean = '-x';
var lessVar = '--modify-var=buildComment=true';

var webBuildDir = path.join(process.env.SPLUNK_SOURCE, 'web');
var webDestRelPath = path.join('share', 'splunk');
var webDestDir = path.join(process.env.SPLUNK_HOME, webDestRelPath);

var appBuildRelDir = path.join('cfg', 'bundles');
var appBuildDir = path.join(process.env.SPLUNK_SOURCE, appBuildRelDir);
var appDestRelDir = path.join('etc', 'apps');
var appDestDir = path.join(process.env.SPLUNK_HOME, appDestRelDir);

var profilesDir = path.join(webBuildDir, 'build_tools', 'profiles');
var standaloneProfilesDir = path.join(profilesDir, 'standalone');
var jsDir = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'js');
var pagesDir = path.join(jsDir, 'pages');
var lessSource = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'less');
var relCssDir = path.join('search_mrsparkle', 'exposed', 'css');
var cssDir = path.join(webBuildDir, relCssDir);
var cssBuildDir = path.join(cssDir, 'build');
var relJsBuildDir = path.join('search_mrsparkle', 'exposed', 'build');
var jsBuildDir = path.join(webBuildDir, relJsBuildDir);
var relSplunkJsCssDir = path.join('search_mrsparkle', 'exposed', 'js', 'splunkjs', 'css');
var splunkJsCssDir = path.join(webBuildDir, relSplunkJsCssDir);
var simplexmlSourceDir = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'build', 'simplexml');
var simplexmlMinSourceDir = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'build', 'simplexml');
var relSimplexmlDestDir = path.join('search_mrsparkle', 'exposed', 'js', 'build', 'simplexml');
var relSimplexmlMinDestDir = path.join('search_mrsparkle', 'exposed', 'js', 'build', 'simplexml.min');
var simplexmlDestDir = path.join(webBuildDir, relSimplexmlDestDir);
var simplexmlMinDestDir = path.join(webBuildDir, relSimplexmlMinDestDir);
var splunkJsSourceDir = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'build', 'splunkjs_dj');
var splunkJsMinSourceDir = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'build', 'splunkjs_dj');
var relSplunkJsDestDir = path.join('search_mrsparkle', 'exposed', 'js', 'build', 'splunkjs');
var relSplunkJsMinDestDir = path.join('search_mrsparkle', 'exposed', 'js', 'build', 'splunkjs.min');
var splunkJsDestDir = path.join(webBuildDir, relSplunkJsDestDir);
var splunkJsMinDestDir = path.join(webBuildDir, relSplunkJsMinDestDir);
var relJsdocsDir = path.join('search_mrsparkle', 'exposed', 'docs', 'js', 'public');
var jsdocsDir = path.join(webBuildDir, relJsdocsDir);

var splunkJsIndependentProfileDir = path.join(standaloneProfilesDir, 'splunkjs_independent');
var splunkJsIndependentAssetsDir = path.join(webBuildDir, 'splunkjs_independent', 'assets');
var splunkJsIndependentDestDir = path.join(webBuildDir, 'search_mrsparkle', 'exposed', 'build', 'splunkjs_independent');

var lessLegacySourceDir = path.join(lessSource, 'version-5-and-earlier');
var bootstrapLess = path.join(lessSource, 'base', 'bootstrap.less');

module.exports = {
    nodeCmd: nodeCmd,
    lessCmd: lessCmd,
    jsdocCmd: jsdocCmd,
    rjs: rjs,
    lessClean: lessClean,
    lessVar: lessVar,

    jsDir: jsDir,
    webBuildDir: webBuildDir,
    webDestRelPath: webDestRelPath,
    webDestDir: webDestDir,

    appBuildRelDir: appBuildRelDir,
    appBuildDir: appBuildDir,
    appDestRelDir: appDestRelDir,
    appDestDir: appDestDir,

    profilesDir: profilesDir,
    standaloneProfilesDir: standaloneProfilesDir,
    pagesDir: pagesDir,
    lessSource: lessSource,
    relCssDir: relCssDir,
    cssDir: cssDir,
    cssBuildDir: cssBuildDir,
    relJsBuildDir: relJsBuildDir,
    jsBuildDir: jsBuildDir,
    relSplunkJsCssDir: relSplunkJsCssDir,
    splunkJsCssDir: splunkJsCssDir,
    simplexmlSourceDir: simplexmlSourceDir,
    relSimplexmlDestDir: relSimplexmlDestDir,
    relSimplexmlMinDestDir: relSimplexmlMinDestDir,
    simplexmlDestDir: simplexmlDestDir,
    simplexmlMinSourceDir: simplexmlMinSourceDir,
    simplexmlMinDestDir: simplexmlMinDestDir,
    splunkJsSourceDir: splunkJsSourceDir,
    relSplunkJsDestDir: relSplunkJsDestDir,
    relSplunkJsMinDestDir: relSplunkJsMinDestDir,
    splunkJsDestDir: splunkJsDestDir,
    splunkJsMinSourceDir: splunkJsMinSourceDir,
    splunkJsMinDestDir: splunkJsMinDestDir,
    relJsdocsDir: relJsdocsDir,
    jsdocsDir: jsdocsDir,

    splunkJsIndependentProfileDir: splunkJsIndependentProfileDir,
    splunkJsIndependentAssetsDir: splunkJsIndependentAssetsDir,
    splunkJsIndependentDestDir: splunkJsIndependentDestDir,

    lessLegacySourceDir: lessLegacySourceDir,
    bootstrapLess: bootstrapLess,

    $dst: '$DST',
    $src: '$SRC'
};
