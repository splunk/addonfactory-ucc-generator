module.exports = {
    stage: {
        files: [
            {
                expand: true,
                cwd: '<%= package.contrib %>/misc',
                src: ['license-eula.rtf', 'license-eula.txt'],
                dest: 'stage'
            },
            {
                expand: true,
                cwd: 'package',
                src: ['**'],
                dest: 'stage'
            }
        ]
    }
};
