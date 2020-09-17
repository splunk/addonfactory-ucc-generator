({
    preserveLicenseComments: false,
    name: 'contrib/almond',
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    include: ['i18n', 'splunk.logger'],
    exclude: ['jquery'],
    out: '../build/legacy.js',
    mainConfigFile: './shared.js'
})
