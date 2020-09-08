define(function (require, exports, module) {
	var _ = require('underscore');
	var $ = require('jquery');
	var mvc = require('../mvc');
	var BaseSplunkView = require('../basesplunkview');
	var AppNav = require('helpers/AppNav');
	var NavsCollection = require('collections/services/data/ui/Navs');
	var ViewsCollection = require('collections/services/data/ui/Views');
	var SavedSearchesCollection = require('collections/services/saved/Searches');
	var SplunkConfig = require('splunk.config');
	var AceMenuBuilder = require('./acemenubuilder');
	var AppsCollection = require('collections/services/AppLocals');
	var SplunkUtil = require('splunk.util');
	require("css!./aceheader");

	// private state
	var initialized = false; 
	var appName = '';
	var owner = '';
    var userDisplayName = '';
    var appDisplayName = '';
	var navData = null;
	var allMenuData = null;
	var apps = [];


	// private functions

	// Ripped off from AppBar.js
	var transposeMenuData = function(menu, options){
        var output = [];
        options = options || {};
        var isTop = (options.hasOwnProperty("isTop"))?options.isTop:false;
        var isActive = (options.hasOwnProperty("isActive"))?options.isActive:false;
        for(var i=0; i<menu.length; i++){
            var menuEntry = menu[i];
            var replacement = {};
            
            if(menuEntry.hasOwnProperty("submenu")){
                var transpose = transposeMenuData(menuEntry.submenu, {isActive:isActive});
                var subnode = transpose.output;
                isActive = transpose.isActive;
                replacement["items"] = subnode;
                replacement["label"] = (menuEntry.hasOwnProperty("label"))?menuEntry.label:"";
            
            } else {
                replacement = menuEntry;

                // add class to menu item for private items; possible 'sharing'
                // values are 'user', 'app', 'system', 'global'.  see eai:acl
                if (menuEntry['sharing'] == 'user') {
                    replacement['style'] = 'splUserCreated';
                }
            }
            
            if(isTop && isActive){
                replacement["isActive"] = true;
            }
            output.push(replacement);
        }
        return {output:output, isActive:isActive};
    };
	// Ripped off from AppBar.js
  	var parseNavConfig = function(navConfig){
        var transpose = transposeMenuData(navConfig, {isTop:true});
        var menuData = {};
        for(var i=0; i<transpose.output.length; i++){
            if(transpose.output[i].hasOwnProperty("items")){
                menuData["splunk-navmenu_" + i] = transpose.output[i].items;
            }else{
                continue;
            }
        }
        return menuData;
    };
	// Ripped off from AppBar.js
    var generateMainMenus = function(menuData, container){
        // setup the menu systems for all of the app menus
        for (var key in menuData) {
            if (menuData.hasOwnProperty(key)) {
                new AceMenuBuilder({
                    containerDiv: container,
                    menuDict: menuData[key],
                    activator: $('#' + key),
                    menuClasses: 'splunk-splMenu-primary ' + key
                });
            }
        }
    };

    

	var AceHeader = BaseSplunkView.extend({
		className: 'splunk-ace-header',
		tagName: 'header',
        
        options: {
            'appbar': true
        },
        
		initialize: function() {
            this.configure();
            
			var _this = this;
			appName = SplunkConfig.APP; 
			owner = SplunkConfig.USERNAME;
            userDisplayName = SplunkConfig.USER_DISPLAYNAME;
            appDisplayName = SplunkConfig.APP_DISPLAYNAME;

			// This is shamelessly ripped from Homepage.js
			var navsDfd = $.Deferred();
			var navsCollection = new NavsCollection();
			navsCollection.on('reset change', navsDfd.resolve);
			navsCollection.fetch({ data: { app: '-', owner: owner, count: -1 }});


			var parseViewsDfd = $.Deferred();
			var viewsCollection = new ViewsCollection();
			viewsCollection.fetch({data: {app:'-', owner: owner, count: -1, digest: 1}});
            viewsCollection.on('reset change', function() {
                parseViewsDfd.resolve(viewsCollection);
            });


            var searchesDfd = $.Deferred();
            var savedSearchesCollection = new SavedSearchesCollection();
            savedSearchesCollection.fetch({data:{app:'-', owner: owner, search:'is_visible=1 AND disabled=0', count:-1}}); 
            savedSearchesCollection.on('reset change', searchesDfd.resolve);

            var appsCollection = new AppsCollection();
            var appsDfd = $.Deferred();
            appsCollection.fetch({data:{'sort_key':'name', 'sort_dir':'desc', app: appName, owner: owner, search: 'visible=true AND name!=launcher', count:-1}});
            appsCollection.on('reset sort change', appsDfd.resolve);

			$.when(
				appsDfd,
				navsDfd,
				parseViewsDfd,
				searchesDfd
			).done(function(appsCollection, navsCollection, parsedViewLabels, savedSearches) {
				savedSearches = savedSearches[0];
                navsCollection = navsCollection[0];
                apps = appsCollection[0];
				var navModel = navsCollection.get('/servicesNS/nobody/' + appName + '/data/ui/nav/default');
				allMenuData = AppNav.parseNavModel(navModel, parsedViewLabels, savedSearches).nav; 
				
				navData = parseNavConfig(allMenuData);

				initialized = true;
				_this.render();
			});


		},
		render: function() {
			if (initialized) {
				this.$el.html(_.template(AceHeader.template, {
					navData: allMenuData,
					appNamespace: appName, 
					userName: userDisplayName, 
					appDisplayName: appDisplayName,
                    appbar: this.settings.get("appbar")
				}));


				var appsNavData = [];

				apps.each(function(app) {
                    // We are generating a Splunkweb URL for these, which means
                    // we have to go through a redirect cycle. That's OK,
                    // and on par with what we have for the Bubbles header.
					appsNavData.push({
						label: app.entry.content.get('label'),
						uri: SplunkUtil.make_url('app', app.entry.get('name')) 
					});
				});
                
                appsNavData = _.sortBy(appsNavData, function(app) { 
                    return (app.label || "").toLowerCase(); 
                });
				
				appsNavData.push({
					divider: true
				});

				appsNavData.push({
					label: 'Home',
					uri: SplunkUtil.make_url('app', 'launcher')
				});
				appsNavData.push({
					label: 'Manage apps...',
					uri: SplunkUtil.make_url('manager', 'search', 'apps', 'local')
				});
				appsNavData.push({
					label: 'Find more apps...',
					uri: SplunkUtil.make_url('manager', 'search', 'apps', 'remote')
				});

				generateMainMenus(navData, this.el);



				new AceMenuBuilder({
					activator: $('#splunk-applicationsMenuActivator'),
					menuDict: appsNavData,
					menuClasses: 'splunk-splMenu-primary splunk-app-menu'
				});

			}
			return this;
		}
		
	},
	// Class static
	{
		template: '\
		<div> \
	        <ul class="splunk-account-bar-items"> \
			    <li> \
        			<a href="/en-US/manager/<%= appNamespace %>/authentication/changepassword/admin?action=edit" class="splunk-user-full-name"><%- userName %></a> \
    			</li> \
    			<li class="splunk-account-divider">|</li> \
			    <li id="splunk-applicationsMenuActivator"> \
			        <a href="#" >App<span class="splunk-dropdown-icon splunk-triangle-1"></span></a> \
			    </li> \
			    <li class="splunk-account-divider">|</li> \
		        <li> \
		            <a href="/en-US/manager/<%= appNamespace %>">Manager</a> \
		        </li> \
		        <li class="splunk-account-divider">|</li> \
		        <li> \
		            <a href="/en-US/alerts/<%= appNamespace %>" class="alerts_opener">Alerts</a> \
		        </li> \
		        <li class="splunk-account-divider">|</li> \
		        <li> \
		            <a href="/en-US/app/<%= appNamespace %>/job_management" class="job_manager_opener">Jobs</a> \
		        </li> \
		        <li class="splunk-account-divider">|</li> \
		        <li> \
		            <a href="/en-US/account/logout">Logout</a> \
		        </li> \
		    </ul> \
		    <div class="splunk-app-logo-container"> \
		    	<a href="/en-US/app/<%= appNamespace %>" class="splunk-app-logo"></a> \
		    	<h1><%= appDisplayName %></h1> \
		    </div> \
		    <div class="splunk-clear"></div> \
    	</div> \
        <% if (appbar) { %> \
        <div class="splunk-navigation-header"> \
			<ul> \
			<% _.each(navData, function(navItem, index) { %> \
				<% if (navItem.submenu) { %> \
					<li class="splunk-has-menu dropdown"> \
						<a href="#" id="splunk-navmenu_<%= index %>"><%= navItem.label %><span class="splunk-dropdown-icon splunk-triangle-2"></span></a> \
					</li> \
				<% } else { %> \
					<li> \
						<a href="<%= navItem.uri %>"><%= navItem.label %></a> \
					</li> \
				<% } %> \
	        <% }); %> \
			</ul> \
	    </div> \
        <% } %>'
	});

	return AceHeader;
});