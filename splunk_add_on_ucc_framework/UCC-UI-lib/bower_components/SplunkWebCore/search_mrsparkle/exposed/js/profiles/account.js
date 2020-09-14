({
    preserveLicenseComments: false,
    name: 'contrib/almond',
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    include: 'pages/account',
    out: '../build/accountpage.js',
    mainConfigFile: './shared.js'
})
