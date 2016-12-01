var BLACK_LIST = [];

module.exports = function() {
    return {
        dev: {
            files: [
                {
                    expand: true,
                    cwd: 'package',
                    src: ['**'],
                    dest: 'build',
                    filter: function (file) {
                        for (var i = 0; i < BLACK_LIST.length; i++) {
                            var name = BLACK_LIST[i];
                            if (file.indexOf(name) >= 0) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
            ]
        },
        publish: {
            files: [
                {
                    expand: true,
                    cwd: 'package',
                    src: [
                        'appserver/static/css/*',
                        'appserver/static/img/*',
                        'appserver/static/styles/*',
                        'appserver/templates/base.html',
                        'default/data/**',
                        'locale/**'
                    ],
                    dest: 'build',
                    filter: function (file) {
                        for (var i = 0; i < BLACK_LIST.length; i++) {
                            var name = BLACK_LIST[i];
                            if (file.indexOf(name) >= 0) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
            ]
        }
    };
};
