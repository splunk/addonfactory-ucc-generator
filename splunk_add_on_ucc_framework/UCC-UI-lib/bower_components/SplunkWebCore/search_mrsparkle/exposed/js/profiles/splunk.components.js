//splunk cmd node $SPLUNK_HOME/lib/node_modules/requirejs/bin/r.js -o splunkbar.modulesystem.js
({
    mainConfigFile: './shared.js',
    out: '../build/splunk.components.js',
    name: 'contrib/almond',
    optimize: 'none',
    include: [
        'require/jquery-no-conflict',
        'views/shared/splunkbar/Master',
        'views/shared/appbar/Master',
        'views/shared/litebar/Master',
        'views/shared/footer/Master',
        'models/shared/Application',
        'models/config'
    ],
    wrap: {
        start: ' ',
        // we need to immediately do two things:
        // 1) require the "require/jquery-no-conflict" to put jQuery into no-conflict mode
        //    since it needs to co-exist with a legacy version that is in the global namespace
        // 2) require Underscore (the AMD module) because it is responsible for putting Underscore (the library) in no-conflict mode
        //    otherwise Underscore (the library) can potentially leak out into the global scope and clobber i18n
        end: 'require("require/jquery-no-conflict"); require("underscore")'
    }
})