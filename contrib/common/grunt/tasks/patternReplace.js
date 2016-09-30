module.exports = {

    patternReplace : {
               options : {
                   prefix : "\\@",
	           suffix : "\\@",
                   tokens : '<%= package.bldProperties %>'
                },	
                expand : true,
                cwd : 'stage/<%= package.bldProperties.name.package%>/',
                dest : 'stage/<%= package.bldProperties.name.package%>/',
	        src : ['default/*.conf','default/data/ui/views/setup.xml','README.txt']
    }
};
