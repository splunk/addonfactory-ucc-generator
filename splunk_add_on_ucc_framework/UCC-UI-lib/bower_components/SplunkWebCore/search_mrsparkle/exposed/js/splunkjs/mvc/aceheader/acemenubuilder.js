/* Menu building class. COPIED FROM exposed/js/menu_builder.js and modified to fit your screen (splunkjs/mvc) */
/*
 *    Usage:
 *     var foo = new Splunk.MenuBuilder({options array}); 
 *
 *    Options:
 *         - containerDiv : reference to the container div (this.container usually)
 *         - menuDict : JSON dictionary of menu contents/structure
 *         - activator : Jquery selector for menu activator, usually an <a> tag ex: $('#_menuActivator')
 *         - menuOpenClass : class to apply to the activator when open
 *         - menuClasses : String, list of classes to apply to the top-level outer wrapper of the menu.  Can be multiple classes, space seperated. ex: 'class1 class2 ..'
 *         - autoInit : automatically build the menu. Defaults to true;
 *         - showOnInit : build menu and immediately show it, defaults to false
 *         - fadeEffects : use a fadeIn effect for when showing the menu, defaults to true
 *
 *    Menu Dictionary:
 *      The menu is built from the menuDict object passed in.  The variety of options is confusing, this is a first pass at doc'ing.
 *      Menu Dict Options:
 *          label: {string} text to display in the menu item (ex: Save Search)
 *          uri:   {string} becomes the href of the menu item
 *          style: {string} list of classes (separated by spaces) to apply to this menu item
 *          items: {array} used to define a submenu
 *              ex: {
 *                      label: 'sub menu 1',
 *                      items: [
 *                                { 
 *                                  label: 'sub menu item 1'
 *                                  uri: 'http://foo.com'
 *                                },
 *                                { 
 *                                  label: 'sub menu item 2'
 *                                  uri: 'http://bar.com'
 *                                }
 *                      ]
 *                  }
 *          callback: {function} defines a callback function to fire when menu item is clicked                     
 *          attrs: {array} array of attributes and their values to apply to the menu item
 *              ex: {
 *                      label: 'foo',
 *                      attrs: {
 *                                  'attr1' : 'attr1Value',
 *                                  'attr2' : 'attr2Value'
 *                              }
 *                   } 
 *          showInFilter: If a filter is defined for this menu, show only menu items that have that filter set in their 'showInFilter' property.
 *          divider: {string} creates a divider div, value is the class to apply to the divider (splDivider is pre-defined in default skin)
 *          menuType: {string} optionally specify special menu type:
 *                     - 'htmlBlock' : specifies that for this menu (or submenu), the contents will be a simple html block.  used in conjuction with 'element' and optionally 'action'
 *                          ex: {
 *                                  menuType: 'htmlBlock',
 *                                  element: '.specialElement',
 *                                  action: 'clone'  
 *                               }
 *                     - 'grouping' : specifies that this is a menu grouping header, which can be used to group menu items under a common header. 'label' becomes header
 *                          ex: {
 *                                  menuType: 'grouping',
 *                                  label: 'Group 1'
 *                               }
 *                           
 *           element:  {JQuery selector} used in conjuction with menuType: 'htmlBlock', this JQuery selector indicates the element to put into the html block menu or submenu
 *           action: {string} defines a special action to use with menuTyp: 'htmlBlock'.  currently, the only option is 'clone', which causes the element specified with the 'element' property to be cloned into the html block.  default is to remove the element from its current position and move it within the dom
 *           popup : if property is present, the uri of the menu item will open in a new window
 *           remove: if property is present, menu will be removed on click
 *
 *          Examples:
 *              Basic Menu :
 *                   var newMenu = [
 *                                      {
 *                                          label : 'Item 1',
 *                                          uri: 'http://www.splunk.com',
 *                                          callback : function(){ alert('foo'); }
 *                                      },
 *                                      {
 *                                           label : 'Item 2',
 *                                           uri: 'http://apps.splunk.com'
 *                                           style: 'specialFoofyClass'
 *                                      }
 *                                  ]
 *                            
 *             Menu with submenu :
 *                  var newMenu = [
 *                                    {
 *                                        label : 'Item 1',
 *                                        uri : 'http://www.splunk.com'
 *                                    },
 *                                    {
 *                                        label : 'Item 2',
 *                                        items : [
 *                                              {
 *                                                  label : 'Submenu Item 1',
 *                                                  uri : 'http://www.splunk.com'
 *                                              },
 *                                              {
 *                                                  label : 'Submenu Item 2',
 *                                                  uri : 'http://www.splunk.com'
 *                                              }                                                    
 *                                        ]
 *                                    }
 *                                  ]
 *              Menu with divider and groupings :
 *                  var newMenu = [
 *                                  {
 *                                      menuType: 'grouping',
 *                                      label: 'Group 1'
 *                                  },
 *                                  {
 *                                      label: 'Item 1',
 *                                      uri: 'http://www.splunk.com'
 *                                  },
 *                                  {
 *                                      label: 'Item 2',
 *                                      uri: 'http://www.splunk.com'
 *                                  },
 *                                  {
 *                                      divider: 'splDivider'
 *                                  },
 *                                      menuType: 'grouping',
 *                                      label: 'Group 2'
 *                                  },
 *                                  {
 *                                      label: 'Item 1',
 *                                      uri: 'http://www.splunk.com'
 *                                  },
 *                                  {
 *                                      label: 'Item 2',
 *                                      uri: 'http://www.splunk.com'
 *                                  } 
 *                                ]                      
 *    
 */

define(function (require, exports, module) {
    var mvc = require('../mvc');
    var BaseSplunkView = require('../basesplunkview');
    var $ = require('jquery');
    require('jquery.ui.position');
    require('css!./acemenubuilder');

    var smartTrim = function(string, maxLength) {
        if (!string) return string;
        if (maxLength < 1) return string;
        if (string.length <= maxLength) return string;
        if (maxLength == 1) return string.substring(0,1) + '...';

        var midpoint = Math.ceil(string.length / 2);
        var toremove = string.length - maxLength;
        var lstrip = Math.ceil(toremove/2);
        var rstrip = toremove - lstrip;
        return string.substring(0, midpoint-lstrip) + '...' + string.substring(midpoint+rstrip);
    };

    /**
     * Meant to be a sane wrapper to the insane world of window.open.
     * This should probably just be merged with this.popup. Get popup's centering goodness
     * and open's options management, safer focus call.
     *
     * Be default, calling this method opens a new window with the same width and height as
     * the calling window.  It also centers the new window on the user's screen.
     * To change the width and height of the new window set 'width' and 'height' values to
     * the passed in options object.  To change the position of the new window, set 'top'
     * and 'left' in the passed in options parameter.
     *
     * @param uri {String} path to the new window object.
     * @param name {String} name of the new window object.
     * @param args {Object} dictionary of key / value pairs used to manage the window's options.
     */
    var popupOpen = function(uri, name, options) {

        // Set defaults
        options = $.extend({
            resizable: true,
            scrollbars: true,
            toolbar: true,
            location: true,
            menubar: true,
            width: $(window).width(),
            height: $(window).height()
        }, options);

        if (!options['top']) options['top'] = Math.max(0, screen.availHeight/2 - options['height']/2);
        if (!options['left']) options['left'] = Math.max(0, screen.availWidth/2 - options['width']/2);
        options['screenX'] = options['left'];
        options['screenY'] = options['top'];

        var compiled_options = [];
        for (var key in options) {
            if (options[key] === true) options[key] = 'yes';
            if (options[key] === false) options[key] = 'no';
            compiled_options.push(key + '=' + options[key]);
        }

        name = 'w' + name.replace(/[^a-zA-Z 0-9]+/g,'');
        
        var newWindow = window.open(uri, name, compiled_options.join(','));
        if (newWindow && newWindow.focus) newWindow.focus();
        return newWindow;
    };

    var AceMenuBuilder = BaseSplunkView.extend({
        _containerDiv    : null, //reference to the container
        _menuOpen         : null, //flag: is menu open
        _menuActivator    : null, //reference to menu activator
        _menuTimer        : null, //timer to be used for timeouts
        _menuActivationTime : 0, //time to be used to prevent double activation errors
        _timeoutDelay    : null, //default timeout delay
        _menu            : null, //reference for the menu  
        
        // define the max number of characters to display per menu item   
        MAX_ITEM_LENGTH: 50,
        
        // number of milliseconds to animate fades
        FADE_DURATION: 100,
        
        initialize: function(options) {       
            //defaults
            this._menuOpen = false;
            this._timeoutDelay = 5000;
            this._menu = false;
            this._menuOpen = false;
        
           
            this._options = {
                containerDiv  : false,
                menuDict      : false,
                activator     : false,
                menuOpenClass : false,
                menuClasses   : '',
                autoInit      : true,
                showOnInit    : false,
                fadeEffects   : false,
                filter        : false
            };
           
            // Set the options using the defaults
            if (options) $.extend(this._options, options);
           
            // Build the menu on initialize if asked to do so.
            if (this._options.autoInit) this.menuInit();
        },

        menuInit: function() {
            // build the dictionary into a menu
            this._menu = this.buildMenu(this._options['menuDict'], 1);

            // add menu class and any classes they specified
            var extraClasses;
            if ( this._options['menuClasses'] ) {
                extraClasses = this._options['menuClasses'];   
            } else {
                extraClasses = "splunk-splMenu-primary";   
            }
            this._menu.addClass('splunk-splMenu ' + extraClasses);

            // attach menu to container
            $('body').append(this._menu);

            // used to reduce the .bind(this) calls
            var moduleInstance = this;

            // attach click to menu activator
            if ( this._options['activator'] ) {
                this._menuActivator = $(this._options['activator']); // again, cast with $() to be sure. this also allows jquery selectors to be valid
                this._menuActivator.click(this._onActivatorClick.bind(this));
            } 

            //add hovers for menu
            this._menu.hover(function() {
                    clearTimeout(moduleInstance._menuTimer);
                },
                function() {
                    clearTimeout(moduleInstance._menuTimer);
                    moduleInstance._menuTimer = setTimeout( function() {
                            moduleInstance.hideMenu();
                        }, moduleInstance._timeoutDelay);
                }
            );

            //add top-level click event handler
            $(this._menu).bind('click', function(evt){
                this.onMenuClick(evt);	
            }.bind(this));
    		
    		// hard stopping clicks from escaping the html block in menus.  for some reason testing if we're in the menu block in a top-level handler fails to catch all clicks
            $('.htmlBlock', this._menu).click(function(evt){
                 evt.stopPropagation();
            });

            //add submenu arrows span and hover actions
            $('li.hasSubMenu', this._menu)
                .hover( function(){
                    clearTimeout(moduleInstance._menuTimer);
                    moduleInstance.menuOver(this);
                }, function(){
                    clearTimeout(moduleInstance._menuTimer);
                    moduleInstance._menuTimer = setTimeout(function(){ moduleInstance.menuOut(this); }.bind(this),400);
                });
            
            //show the menu now.
            if(this._options.showOnInit){
                setTimeout(this.showMenu.bind(this), 0);
            }
                   
            //for Navigation with the keyboard through top nav ~ TOP LEVEL
            var curActivator;
            
            $(this._menuActivator).focus(function(evt){ //opens the dropdown when Activator is focused
               	if ( !this._menuOpen ) {
               		this._onActivatorFocus(evt);
               		curActivator = $(this._menuActivator);
               	}
            }.bind(this));        
            
            //Listener to capture the anchor with the current focus
            var curFocus;
            $("a").focus(function(){
            	curFocus = $(this);   
            });        
            
            //Listens for a keypress when focus is on the Activator
            $(this._menuActivator).bind('keydown',function(evt){  
          		var kc = evt.keyCode;       		
           		if(kc == 9){
           			this.hideMenu();
           			return true;
           		}else if(kc == 40){
            		if ( this._menuOpen ) {
               			$("a:first",this._menu).focus();
           			}
            		return false;
            	}        	
           	}.bind(this));
            
            //for Navigation with the keyboard through top nav ~ IN DROPDOWN       	
            $(this._menu).bind('keydown',function(evt){
               	 var kc = evt.keyCode,
            	     hasSubMenu = (curFocus.parent().hasClass('hasSubMenu')),
            	     subMenuWrapper = (hasSubMenu && kc == 37)?curFocus.parents('li.hasSubMenu').slice(1,2):curFocus.parents('li.hasSubMenu:first'),
            	     submenu = subMenuWrapper.children('div.splunk-outerMenuWrapper:first');        	
            	if(kc == 9){ //tab
            	    this.hideMenu();   // needs to happen before focus for IE9?
            		curActivator.focus();
                    this.hideMenu(); // this needs to happen again after focus for IE9?
            		return true;
            	} else if(kc == 38){ // Up arrow
            		if(curFocus.parent().prev().is("div")){   //need this to skip the 'div' separators
               			curFocus.parent().prev().prev().children("a").focus();
               			return false;
               		}else{
               			curFocus.parent().prev().children("a").focus();
               			return false;
               		}           		
            	}else if(kc == 40){ //down arrow 
            	    if(curFocus.parent().next().is("div")){   //needed to skip the 'div' separators
               			curFocus.parent().next().next().children("a").focus();
               			return false;
               		}else{
               			curFocus.parent().next().children("a").focus();
               			return false;
               		}
            	}else if(kc == 39 && hasSubMenu){ //right arrow on submenu activator
            		this.menuOver(subMenuWrapper);
            		$("li > a:first", submenu).focus();
            	}
            	else if(kc == 37){ //left arrow in submenu   
            		subMenuWrapper.children('a:first').focus();
            		submenu.hide();		
            	}
            }.bind(this));
            
            
            
            $(document).click(this._onDocumentClick.bind(this));
            $("body").bind("focusin", function(evt) {
            	if($(evt.target).is("select")){
            		this._onDocumentClick(evt);        		
            	}
            }.bind(this));
            $(window).resize(this._onWindowResize.bind(this));

        },
        /* top-level click handler */
        onMenuClick: function(evt){
            var t = evt.target;
    		var isA = $(t).is('a');
    		
            //stop clicks on submenu parent items
            if (!isA || isA && $(t).parent('li.hasSubMenu').length ) {
    			evt.stopPropagation();
                return false;
            } else {
                $('a', t).click();
            }
        },
        /* function for hovering over an li containing a submenu */
        menuOver: function(orig) {
            this.hideSubMenus(orig); 
            $(orig).addClass('sfhover');
           
            var submenu = $(orig).children('div.splunk-outerMenuWrapper');

            var hangRight = ($(orig).offset().left + $(orig).width() + submenu.width() > $(window).width());
            var submenuLeft = (hangRight) ? -submenu.width() : $(orig).parent('div').parent('ul').width();
            submenu.css({left:submenuLeft});
    	    //submenu.bgiframe();
            submenu.show();
        },
       
        /* function for mouseout of submenu, hides submenu */
        menuOut: function(orig) { 
            $(orig).removeClass('sfhover');
            $(orig).children('div.splunk-outerMenuWrapper').hide();
        },
       
        /* build menu structure from the JSON dict passed */
        buildMenu: function(menuDict, menuLevel) {
            var menu = $('<div class="splunk-outerMenuWrapper splunk-splShadow"><ul></ul></div>');
            $.each(menuDict, function(index,menuitem) {

                // If a filter is defined for this menu, show only menu items that have that filter set in their 'showInFilter' property.
                if (this._options.filter !== false) {
                    if ( menuitem.hasOwnProperty("showInFilter") && (menuitem.showInFilter != undefined) ) {
                        var l = menuitem.showInFilter.length;
                        var hasMatch = false;
                        for ( var i=0; i<l; i++ ) {
                           if ( menuitem.showInFilter[i] == this._options.filter ) hasMatch = true;
                        }
                        if ( !hasMatch ) return true; // If nothing matches, onto the next...
                    } else {
                        return true; // If the menu has a filter set and the menuitem does not, toss out the menuitem.
                    }
                }

                var itemClasses = '';
           
                // apply any styles to this item if specified in the menu dictionary
                if (menuitem.hasOwnProperty('style')){
                    itemClasses += menuitem.style;
                }

                if ( menuitem.hasOwnProperty('divider') ) {  // NOTE: Need to figure this out, I don't really like this approach.  we need a way to specify a divider element,
                                                             //       but not tie implementation to the JSON dict
                    newNode = $('<div class="actionsMenuDivider"></div>');  // currently using a div with the class passed
                } else if ( menuitem.hasOwnProperty('menuType') && menuitem.menuType == 'htmlBlock') { // htmlBlocks are to drop in the contents of a div, or possibly html returned remotely via ajax
                    if ( menuitem.hasOwnProperty('element') ) {
                        // html block to place in menu comes from an existing element with class elementClass
                        // grab the element and shove it into the menu structure
                        newNode = $('<li class="' + itemClasses + ' htmlBlock"></li>');

                        if ( menuitem.hasOwnProperty('action') && menuitem.action == 'clone' ) { //clone element and add it in
                            $(menuitem.element).clone(true).appendTo(newNode);
                        } else { //actually insert the dom node itself
                            $(menuitem.element).appendTo(newNode);
                        }
                    }
                    
                    // Allow callbacks using jQuery's typical callback binding ('this' refers to calling element in callback)
                    if (menuitem.hasOwnProperty('callback')) {
                        newNode.click(function(event){
                            this.hideMenu(menuitem.callback, event);
                            event.stopPropagation();
                            return false;
                        }.bind(this));
                    }
                } else {
                    var label = '';

                    //NOTE: again, probably not the best approach to this, we need a way to specify grouping headers.
                    if ( menuitem.hasOwnProperty('menuType') && menuitem.menuType == 'grouping') { //treat label as a header, further uls as the items to be grouped
                        label = $('<p class="splunkMenuGroupingHeader">').html(menuitem.label);
                    } else {

                        var href = 'javascript:void(0);';
                        var attrs = '';
                       
                        if (menuitem.hasOwnProperty('uri')){
                            href = menuitem.uri;
                        }
                        label = $('<a>')
                            .attr("href", href)
                           	.attr("tabindex","-1")
                            .addClass("menuItemLink")
                            .html(smartTrim(menuitem.label, this.MAX_ITEM_LENGTH));

                        if (menuitem.hasOwnProperty('attrs')) {
                            for (var key in menuitem.attrs) {
                                label.attr(key, menuitem.attrs[key]);                               
                            }
                        }
                        
                        if (menuitem.hasOwnProperty('popup')) {
                            label.click(function(){
                                popupOpen(this.href, menuitem.popup);
                                return false;
                            });
                        }

                        if (menuitem.hasOwnProperty('remove')) {
                            label.click(function(){
                                this.removeMenu();
                            }.bind(this));
                        }
                        
                        if (menuitem.hasOwnProperty('data')) {
                            label.data('data', menuitem.data);
                        }
                    }
                    
                    var newNode = $('<li class="' + itemClasses + '">').append(label);

                    if ( menuitem.hasOwnProperty('items') ) {
                        newNode
                          .append('<span class="splIcon splIcon-triangle-4-e dropDown"></span>')
                          .addClass('hasSubMenu')
                          .append( this.buildMenu(menuitem.items) );
                    }
               
                    // Allow callbacks using jQuery's typical callback binding ('this' refers to calling element in callback)
                    if (menuitem.hasOwnProperty('callback')) {
                        newNode.click(function(event){
                            this.hideMenu(menuitem.callback, event);
                            event.stopPropagation();
                            return false;
                        }.bind(this));
                    }
                    
                }
                   menu.children('ul').append(newNode);
            }.bind(this));

            // inner wrapper element for extra styling needs.  unfortunate, but necessary for additional styling options
            menu.children('ul').children('*').wrapAll('<div class="splunk-innerMenuWrapper"></div>');
    		
    		return menu;
            
        },
       
        /**
         * Removes the menu and deactivates the activator control.
         *
         */
        removeMenu: function() {
            // Remove click actions from the menu
            this._menuActivator.unbind('click');
           
            // Remove the event handlers from the menu itself
            this._menu.unbind('click').unbind('hover');
           
            // Kill the menu. This will also remove any data associated with the menu.
            this._menu.remove();
        },
       
        /**
         * Removes the current menu and builds a new one
         * using a new menu dictionary.
         *
         * TODO better updating of menu items without rebuilding the entire menu structure
         */
        updateMenu: function(menuDict) {
            var originalShowOnInitVal = this._options.showOnInit;
            
            if(this._menuOpen){
                this._options.showOnInit = true;
            }
            
            this.removeMenu();        
            this._options.menuDict = menuDict;
            this.menuInit();
            
            this._options.showOnInit = originalShowOnInitVal;
        },
       
        /* function to position and show menu */
        showMenu: function() {        

            //using Brandon Aaron's bgiframe plugin to fix select element bleed-through in IE6
            // this._menu.bgiframe();
          
            this._menuOpen = true;

            if ( this._options["menuOpenClass"] ) {
                this._menuActivator.addClass(this._options["menuOpenClass"]);
            } else {
                this._menuActivator.addClass('menuOpen');
            }
            
            // adding a testing hook class
            this._menu.addClass('splOpenMenu');
            if ( this._options['fadeEffects'] ) {
                this._menu.fadeIn(this.FADE_DURATION);
            } else {
                this._menu.show();
            }
            this.setPosition();
    	
        },
       
        setPosition: function() {
    	
            var t = $(this._menuActivator);
            
            var menu = this._menu;
            menu.position({
                of: t,
                my: 'left top',
                at: 'left bottom',
                collision: 'fit none'
            });
    	
        },
       
        /* function to hide all submenus
                NOTE: not sure we want to go down this path, where everything is so heavily DOM-dependent.
         */
        hideSubMenus: function(orig) {
            if (typeof orig === 'undefined') {
                orig = this._menu;
            } else {
                orig = $(orig).parent();
            }
            orig.find('.hasSubMenu').each(  //loop over all menu items that have submenus
                function(){
                    if ( this != orig ) { //if this hover is triggered on the currently open menu, don't hide it's submenus
                       $(this).children('div.splunk-outerMenuWrapper').hide();
                    }
                }
            );
        },
       
        /* function to hide the menu */
        /* @param {function} callback - if they assigned a callback to a menu item, fire it after the menu closes */
        /* @param {Object} event - a JQuery normalized event */
        hideMenu: function(callback, event) {
            this._menuOpen = false;
            if ( this._options["menuOpenClass"] ) {
                this._menuActivator.removeClass(this._options["menuOpenClass"]);
            } else {
                this._menuActivator.removeClass('menuOpen');
            }
            this.hideSubMenus();
            
            // if this menu is being closed because of another menu being opened,
            // do a fast hide
            // removing the testing hook class
            this._menu.removeClass('splOpenMenu');
            if (!this._menuOpen && !callback) {
                this._menu.fadeOut(this.FADE_DURATION);
                //jQuery 1.6.2 started using timing control for script-based animations using the new requestAnimationFrame.
                //FF 8.X was not hiding menus so we defer this operation to the end of the stack maintaining the smooth animation for
                //friends and family.
                setTimeout(function(){this._menu.hide();}.bind(this), this.FADE_DURATION);
            } else {
                this._menu.hide();   
                return callback(event);
            }
        },
       
        
         /* function to handle closing of the menu */
         _onDocumentClick: function(evt) {
    	 	 if ( 
    	 	 	!this._menuOpen || // isn't open
    	 	 	!this._menuActivator || // don't have an object
    	 	 	!this._menuActivator.length || //  object doesn't have anything in it.
    	 	 	this._menuActivator.is(evt.target) || // clicked on the activator.
    	 	 	$.contains(this._menuActivator[0], evt.target) // clicked on a child of the activator
    	 	 	) {
    	 	 	
    	 	 	// if anything above is true, then return – don't hide anything.
    	         return true;
    	     }
    	     
    	     this.hideMenu();
         },
         
      
       /* function to reposition the menu on window resize */
       _onWindowResize: function(evt) {
       		if (this._menuOpen) {
     	     	this.setPosition();
     	    }
       },
       
        /* function to handle activating the menu */
        _onActivatorFocus: function(evt) {
        	//Prevent this from firing twice in a 1/4 second
        	//This allows focus and click to activate the menu without interfering.
        	var time = new Date();
    		if ((time - this._menuActivationTime) < 250) return true ;
    		this._menuActivationTime = time;
        	
        	
            if (this._menuOpen) {
                this.hideMenu();
            } else {
            	this.showMenu();
            }
        },
        
         /* function to handle click on the menu activator */
         _onActivatorClick: function(evt) {
             evt.preventDefault();
             this._menuActivator.focus(); 
             this._onActivatorFocus(); //Note, this can cause double call for _onActivatorFocus
         },
          
        /* getter for a handle on the menu */
        getMenu: function(){
            return this._menu;
        },
       
        /* getter for the menu activator */
        getActivator: function () {
            return this._menuActivator;
        }
    });

    return AceMenuBuilder;
});
