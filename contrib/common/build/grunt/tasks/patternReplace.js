module.exports = {
    patternReplace: {
        options : {
            prefix : "\\$\\{",
            suffix : "\\}",
            tokens : {
                copyright: "<%= package.copyright %>",
                version: {
                    build: "<%= build_no %>",
                    major: "<%= version_major %>",
                    minor: "<%= version_minor %>",
                    revision: "<%= version_revision %>"
                },
                package: {
                    name: "<%= package.name %>"
                },
                friendly: {
                    name: "<%= package.friendly.name %>"
                },
                ponydocs: {
                    shortname: "<%= package.ponydocs.shortname %>"
                }
            }
        },
        expand : true,
        cwd    : "stage",
        dest   : "stage",
        src    : ['README.txt', 'default/*.conf']
    }
};
