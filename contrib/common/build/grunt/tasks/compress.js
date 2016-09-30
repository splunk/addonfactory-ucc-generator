module.exports = {
    package: {
        options: {
            mode: 'tgz',
            archive: '<%= package.name %>-<%= package.version %>-<%= build_no %>.<%= package.buildtype %>'
        },
        expand: true,
        cwd: 'stage',
        src: ['**/*'],
        dest: '<%= package.name %>'
    }
};
