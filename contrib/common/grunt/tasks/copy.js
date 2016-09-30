module.exports = { 

    copy: {
         files : [
           {expand: true, cwd: 'package', src: ['**/*'], dest: 'stage/<%= package.bldProperties.name.package%>/'},
	   {expand: true, cwd: 'contrib/common/misc', src: ['license-eula.txt','license-eula.rtf'], dest: 'stage/<%= package.bldProperties.name.package%>/', flatten: true}
        ]  
    } 
};
