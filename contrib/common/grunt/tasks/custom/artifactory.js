module.exports = function(grunt){

    grunt.config( 'shell', {

       artifactory:{
           command: './artifacts.py --configpath ../../../ --push --buildnumber <%= bambooParams.buildNumber %>',
	   options:{
	       execOptions:{
	          cwd: 'contrib/common/artifactorytool'
	       }
	   }
       }
    });
    
};


