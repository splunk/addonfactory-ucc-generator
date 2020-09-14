var fs = require('fs');
var path = require('path');
var archy = require('archy');
var cmd = require('commander');

cmd.version('1.0')
    .usage('[options] <module>')
    .description('Print the dependency tree of a module')
    .option('-s --stats-path <statsPath>', 'Path to stats.json file')
    .option('-f --full-output', 'Show all modules dependencies, including styles and HTML files')
    .option('-v --verbose', 'Verbose output')
    .parse(process.argv);

var moduleId = cmd.args[0];

if (!moduleId) {
    console.log("Missing module ID to print");
    process.exit(1);
}

var statsPath = cmd.statsPath;
var statsFile = statsPath;
if (!statsPath) {
    var logDir = path.join(__dirname, 'logs');
    if (cmd.verbose) {
        console.log('No stats.json path specified, looking for latest one in', logDir);
    }
    var matches = [];
    try {
        for (var f of fs.readdirSync(logDir)) {
            if (f.indexOf('buildStats.') === 0) {
                if (cmd.verbose) {
                    console.log('Found build stats file', f);
                }
                matches.push(f)
            }
        }
    } catch(e) {
        // If the log directory doesn't exist, catch the error and prompt the 
        // user to run the build with logging.
        if (e.code !== 'ENOENT') throw e;
    }
    matches.sort();
    statsFile = matches.pop();
    if (statsFile) {
        statsPath = path.join(logDir, statsFile);
        if (cmd.verbose) {
            console.log('Using stats file', statsFile);
        }
    } else {
        console.log('No stats.json file found. You need to generate one by running:');
        console.log('$ splunk cmd node $SPLUNK_SOURCE/web/build_tools/build.js --log --dev $SPLUNK_SOURCE/web/build_tools/profiles/pages.config.js');
        process.exit(1);
    }
}

if (cmd.verbose) {
    console.log('Reading stats file', statsFile);
}
var stats = JSON.parse(fs.readFileSync(statsPath));

function printModuleTree(id, modules, seen, indent) {
    indent || (indent = '');
    var nodes = [];
    modules.forEach(function(m) {
        m.reasons.forEach(function(r) {
            if (r.moduleId == id) {
                if (!seen[m.id] && (shouldPrint(m.id) || cmd.fullOutput)) {
                    seen[m.id] = true;
                    nodes.push(printModuleTree(m.id, modules, seen, indent + '  '));
                }
            }
        })
    });
    return {label: String(id), nodes: nodes};
}

function shouldPrint(id) {
    return !/\.html/.test(id) && id && id.toString().indexOf('..') !== 0
}

if (!stats.modules.some(function(mod) { return mod.id == moduleId; })) {
    console.log('Module %s not found in %s', moduleId, statsFile);
} else {
    var tree = printModuleTree(moduleId, stats.modules, {}, '');
    console.log(archy(tree));
}

