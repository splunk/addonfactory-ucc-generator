//  CI UI runner script
//
//  This is called by ci_ui_integration.sh - see file for input/environment
//
//  EDIT WITH CAUTION!
//    This script impacts all of our CI runs. If you break it, expect angry yelling.
//
//  WHAT THIS DOES:
//    Executes multiple parallel Karma runs
//    Runs all the linters
//
//  OUTPUT:
//    If one ore more subtasks fail, the exit code will be > 0.


// Configuration

var karmaRuns = [
    {name: 'corejs', args: ['--apps', 'corejs_test', '--filter', quote('!(views)/**,*')]},
    {name: 'corejs_views', args: ['--apps', 'corejs_test', '--filter', quote('views/!(shared)/**,views/*')]},
    {name: 'corejs_views_shared', args: ['--apps', 'corejs_test', '--filter', quote('views/shared/**')]},
    {name: 'splunkjs', args: ['--apps', 'splunkjs_test']},
    {name: 'splunk_monitoring_console', args: ['--apps', 'splunk_monitoring_console']}
];

var lintingRuns = [
    {name: 'npmLinters', cmd: 'npm', args: ['run', 'ci:lint']}
];

// Execution

console.log('Running CI UI tasks\n');

var cproc = require('child_process');
var fs = require('fs-extra');
var path = require('path');

var karmaPath = path.join('..', 'node_modules', 'karma', 'bin', 'karma');
var karmaBaseArgs = [karmaPath, 'start', '--single-run', '--browsers', 'PhantomJS', '--reporters', 'dots,junit'];
var karmaOutputDir = path.join('.', 'test', 'xml_output');

var parallelCmdsFile = 'ci_ui_commands_';
var parallelJoblogFile = 'ci_ui_joblog_';
var parallelPath = 'parallel';
var parallelBaseArgs = ['--no-notice', '--keep-order', '::::'];


function buildCommands() {

    var karmaCmds = karmaRuns.map(function (run) {
        return karmaBaseArgs.concat('--junit-filename', run.name + '.xml', run.args).join(' ');
    }).join('\n');

    var lintingCmds = lintingRuns.map(function (run) {
        return [run.cmd].concat(run.args).join(' ');
    }).join('\n');

    fs.writeFileSync(parallelCmdsFile + 'karma', karmaCmds);
    fs.writeFileSync(parallelCmdsFile + 'linting', lintingCmds);
}

function runParallel() {

    //parallel groups only have one exit code (one or more fail -> fail). since we need
    // to evaluate the individual exit codes of each karma run, we separate the karma runs
    // into their own group. an alternative would be to use parallel's joblog feature.
    // however, that would require parsing codes out a text file in an arbitrary format -
    // that could break any time.

    var parallelKarmaArgs = [
        '--joblog', path.join('..', parallelJoblogFile + 'karma'),
        '--tagstring', '{= s/.*junit-filename (.+?)\.xml.*/Karma: $1/ =}'
    ].concat(parallelBaseArgs, path.join('..', parallelCmdsFile + 'karma'));
    var parallelLintingArgs = [
        '--joblog', parallelJoblogFile + 'linting',
        '--tagstring', '{}'
    ].concat(parallelBaseArgs, parallelCmdsFile + 'linting');

    //show final command lists before starting execution
    console.log('Will run the following command group - karma:');
    cproc.spawnSync(parallelPath, ['--dry-run'].concat(parallelKarmaArgs), {cwd: 'test', stdio: 'inherit'});

    console.log('\nWill run the following command group - linting:');
    cproc.spawnSync(parallelPath, ['--dry-run'].concat(parallelLintingArgs), {stdio: 'inherit'});

    console.log('');
    Promise.all([
        spawn('karma', parallelPath, parallelKarmaArgs, 'test', karmaExitCodeCallback),
        spawn('linting', parallelPath, parallelLintingArgs)
    ]).then(function (codes) {
        var globalExitCode = (codes[0] === 0 && codes[1] === 0) ? 0 : 1;
        console.log('\nCombined exit code - karma:', codes[0]);
        console.log('Combined exit code - linting:', codes[1]);
        console.log('Global exit code:', globalExitCode);
        process.exit(globalExitCode);
    }).catch(function (error) {
        console.log('Failure during parallel runs', error);
        process.exit(1);
    });
}

function karmaExitCodeCallback(code) {

    //ignore exit code of the parallel karma run, determine our own based on output file verification
    // if even one output file cannot be verified, the whole run should fail
    return karmaRuns.some(function (run) {

        var outputFile = path.join(karmaOutputDir, run.name) + '.xml';
        console.log('Verifying output file:', outputFile);

        try {
            fs.accessSync(outputFile);
        } catch (e) {
            console.log('Unable to access output file', outputFile, '- this is a critical error');
            return true;
        }
        return false;
    }) ? 1 : 0;
}

function spawn(name, cmd, args, cwd, cb) {

    return new Promise(function (f, r) {
        console.log('Starting execution of group:', name);
        var child = cproc.spawn(cmd, args, {cwd: cwd ? cwd : '.', stdio: 'inherit'});

        child.on('close', function (code) {
            var joblog = fs.readFileSync(parallelJoblogFile + name, 'utf8');
            console.log('Joblog for group:', name);
            console.log(joblog);

            f(cb ? cb(code) : code);
        });
    });
}

function quote(str) {
    return '"' + str + '"';
}


//safety: clean any lingering intermediary/output files
fs.emptyDirSync(karmaOutputDir);
fs.removeSync(parallelCmdsFile + 'karma');
fs.removeSync(parallelCmdsFile + 'linting');
fs.removeSync(parallelJoblogFile + 'karma');
fs.removeSync(parallelJoblogFile + 'linting');

buildCommands();
runParallel();

//why the exit code of a single run is ignored:
//karma makes it impossible to tell whether a test failure or an infrastructure error occurred:
//0 - ok, no test failures
//1 - ok, one or more test failures
//1 - not ok, browser error (e.g. phantomjs failed to launch)
//
//right now, the only thing we can do is verify is the existence of the output file.
//however, that's not conclusive, a browser crash in the middle of the run results in
//an incomplete XML file (=> looks like a successful test run with a reduced total test
//count). spawning karma using the API would probably allow interception of error details.
