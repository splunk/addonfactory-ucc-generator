module.exports = {

     compress : {
         options: {
             archive: '<%= package.bldProperties.name.package%>-<%= package.bldProperties.version.major%>-<%= package.bldProperties.version.minor%>-<%= package.bldProperties.version.revision%>-<%= bambooParams.buildNumber %>.<%= package.bldProperties.extension.package%>'
         },
         files: [
             {  expand: true, cwd: 'stage', src: ['<%= package.bldProperties.name.package%>/**/*'], dest: '.' }
        ]
       }
}
