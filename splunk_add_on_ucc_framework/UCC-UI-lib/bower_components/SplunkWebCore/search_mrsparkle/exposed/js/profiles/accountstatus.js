({
    preserveLicenseComments: false,
    name: 'contrib/almond',
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    include: 'pages/accountstatus',
    out: '../build/accountstatuspage.js',
    mainConfigFile: './shared.js'
})