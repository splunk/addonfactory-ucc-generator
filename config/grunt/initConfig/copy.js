var BLACK_LIST = ['package/bin/test', 'package/local/'];

module.exports = function(grunt) {
    return {
        all: {
            files: [
                {
                    expand: true,
                    cwd: 'package',
                    src: ['**'],
                    dest: 'stage',
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
