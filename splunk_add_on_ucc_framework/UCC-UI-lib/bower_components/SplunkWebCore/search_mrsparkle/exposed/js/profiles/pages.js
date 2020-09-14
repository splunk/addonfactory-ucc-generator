/**
 * This is only the static portion of the core pages build configuration...
 *
 * Certain parts of this configuration will be updated dynamically at build time.  These updates are documented inline.
 */

require.config({
    preserveLicenseComments: false,
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    mainConfigFile: './shared.js',
    skipDirOptimize: true,
    optimizeCss: 'none',
    wrapShim: true,
    // The `baseUrl` and `dir` attributes will be added dynamically at build time.

    shim: {
        'profiles/shared': {
            deps: ['contrib/require']
        }
    },

    modules: [

        {
            name: 'build/bundles/require',
            create: true,
            include: [
                'contrib/require',
                'profiles/shared'
            ],
            override: {
                wrapShim: false,
                wrap: {
                    start: '',
                    // At build time, all modules that declare makeAvailableAtRuntime=true in their configuration will be
                    // converted to a stringified require.js `bundle` configuration and prepended to `wrap.end`.
                    end: ''
                }
            }
        },

        {
            name: 'build/bundles/common',
            create: true,
            makeAvailableAtRuntime: true,
            include: [
                'jquery',
                'underscore',
                'backbone',
                'collections/Base',
                'models/Base',
                'routers/Base',
                'util/router_utils',
                'views/Base'
            ]
        },
        {
            name: 'build/bundles/js_charting',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['js_charting/js_charting'],
            exclude: ['build/bundles/common']
        },
        {
            name: 'build/bundles/jg_common',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['jg_global', 'jgatt'],
            exclude: ['build/bundles/common']
        },
        {
            name: 'build/bundles/mapping',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['views/shared/map/Master'],
            exclude: ['build/bundles/common', 'build/bundles/jg_common']
        },
        {
            name: 'build/bundles/canvas_timeline',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['views/shared/CanvasTimeline'],
            exclude: ['build/bundles/common', 'build/bundles/jg_common']
        },
        {
            name: 'build/bundles/events_viewer',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['views/shared/eventsviewer/Master', 'views/shared/eventsviewerdrilldown/Master'],
            exclude: ['build/bundles/common']
        },
        {
            name: 'build/bundles/results_table',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['views/shared/results_table/ResultsTableMaster', 'views/shared/ResultsTableDrilldown'],
            exclude: ['build/bundles/common']
        },
        {
            name: 'build/bundles/single_value',
            create: true,
            makeAvailableAtRuntime: true,
            include: ['views/shared/singlevalue/Master'],
            exclude: ['build/bundles/common']
        }

        // At build time, a module entry for each file in the $SPLUNK_SOURCE/web/search_mrsparkle/exposed/js/pages/ directory
        // will be added here.  Unless a file of the same name exists in $SPLUNK_SOURCE/web/search_mrsparkle/exposed/js/profiles/,
        // which is taked as an indication that a custom build configuration is in use for that page.
    ]
})
