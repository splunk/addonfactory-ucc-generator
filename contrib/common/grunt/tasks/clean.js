module.exports = {

        options: {
            force : true
	},
	all : {
   	    src: ["<%= package.bldProperties.name.package%>-<%= package.bldProperties.version.major%>-<%= package.bldProperties.version.minor%>-<%= package.bldProperties.version.revision%>-<%= bambooParams.buildNumber%>.<%= package.bldProperties.extension.package%>","stage"]
	},
        stage: {
            src: ["stage"]
	}
};
