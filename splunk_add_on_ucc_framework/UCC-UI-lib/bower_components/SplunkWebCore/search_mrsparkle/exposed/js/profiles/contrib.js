({
    preserveLicenseComments: false,
    name: 'contrib/almond',
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    include: ['backbone', 'highcharts', 'jquery.ui.draggable', 'jquery.ui.droppable', 'jquery.ui.sortable'],
    out: '../build/contrib.js',
    mainConfigFile: './shared.js'
})
