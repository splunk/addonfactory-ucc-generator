/* layout engine for difficult layout problems css can't handle and dynamic page behaviors that can't be modularized */

Splunk.LayoutEngine = $.klass({
    initialize: function() {
        //target IE
        if ( $.browser.msie ) {
            //alert('your browser sucks');

            var context = this;
            //handle window resizing, for IE6 only after window has finished resizing (horribly slow otherwise)
            if ( $.browser.version == '6.0' ) {
                //do initial width calcs and rendering
                this._SetLayoutIE6();
               
                var resizeTimer = null;
                $(window).resize(function(){
                    if ( resizeTimer ) {
                        clearTimeout(resizeTimer);
                    }
                    resizeTimer = setTimeout(context._SetLayoutIE6,1);
                });
            } else if ($.browser.version in {"7.0": true, "8.0": true}) {
                this._SetLayoutIE7plus();
                $(window).resize(context._SetLayoutIE7plus);
            }
        }

        //set up sidebars
        this._setUpSidebars();
        
        //set up options popups
        this._setupResultsOptionsPopup();
        
        $(window).bind('showsidebar', this.show.bind(this));
        $(window).bind('hidesidebar', this.hide.bind(this));
        
    },
    // For IE6, full-on js widths required, because of how it handles padding + %, and other stupidness.  divide parent by 2, assign the widths
    //  NOTE: this will break if the modules in a layoutCell have a width of 100% and left/right padding (IE6 assumes width is min-width, and feels
    //  free to interpret 100% with padding as 100% width PLUS however many pixels of padding). 
    _SetLayoutIE6: function() {
        $('.twoColRow').each(function(){
            var parentWidth = $(this).innerWidth();

            var halfWidth = parentWidth/2;
            $(this).children('div.layoutCell').each(function(){
                $(this).css('width',halfWidth);
            });
        });
        // lame attempt at fixing 3col rounding bug
        $('.threeColRow').each(function(){
            var parentWidth = $(this).innerWidth();
            var thirdWidth = Math.floor(parentWidth/3);
            $(this).children('div.layoutCell').each(function(){
                $(this).css('width',thirdWidth);
            });
        });
    },
    // The idea for IE7 is just to defeat the pixel rounding bug.  basically, if you have 2 50% cols and the divided width of the
    // parent is 595.5, IE rounds up.  two children 596px wide won't fit, so it wraps.  if it divides evenly, no problem.  so, check
    // if there's no remainder, if there is, subtract one pixel from the last column.
    _SetLayoutIE7plus: function(){
        $('.twoColRow').each(function(){
            $(this).children('div.layoutCell').width('50%');
            var twoColRowWidth = $(this).innerWidth();
            if ( twoColRowWidth%2 != 0 ) {
                var lastCellWidth = parseInt( $(this).children('div.layoutCell:last-child').width(),10) - 1;
                $(this).children('div.layoutCell:last-child').width(lastCellWidth);
            } 
        });
        // lame attempt at fixing 3col rounding bug
        $('.threeColRow').each(function(){
            var parentWidth = $(this).innerWidth();
            var thirdWidth = Math.floor(parentWidth/3);
            $(this).children('div.layoutCell').each(function(){
                $(this).css('width',thirdWidth);
            });
        });
    },
    _setUpSidebars: function(){
        $('.sidebar').each(function(){
            $sidebar = $(this);
            $sidebar.addClass('sidebarExpanded');
            $('<span class="sidebarControl splHeader splHeader-secondary splBorder splBorder-e"><a href="javascript:void(0)" class="splIconicLink splIcon-sidebar-open"><span class="splIconicLinkIcon"></span></a></span>').prependTo($sidebar);
            $sidebar.click(function(evt){
                var t = evt.target;
                
                // walk up tree for a bit
                for (var i=0; i<2; i++) {
                    if (t.tagName != 'A'){ 
                        t = t.parentNode;
                    } else {
                        break;
                    }
                }
                var $t = $(t);
                if ( $t.hasClass('sidebarControl') || $t.parent('span.sidebarControl').length ) {
                   if ( $sidebar.hasClass('sidebarCollapsed') ) {
                       $sidebar.removeClass('sidebarCollapsed').addClass('sidebarExpanded');
                       $sidebar.find('.splIcon-sidebar-closed').removeClass('splIcon-sidebar-closed').addClass('splIcon-sidebar-open');
                   } else {
                       $sidebar.removeClass('sidebarExpanded').addClass('sidebarCollapsed');
                       $sidebar.find('.splIcon-sidebar-open').removeClass('splIcon-sidebar-open').addClass('splIcon-sidebar-closed');
                   }
                }

                if ( $.browser.msie && $t.hasClass('sidebarCollapsed') ) {
                   $sidebar.removeClass('sidebarCollapsed').addClass('sidebarExpanded');
                }
            });   
        });
    },
    /* Function to set up the results display options popup.  */
    _setupResultsOptionsPopup: function(){
	var sel = $('.resultsOptionsActivator');
        if (sel.length) { //if the activator is present
            sel.click(function(){
		if (sel.hasClass("splIconicLinkDisabled")) {
		    return false;
		}
                var resultsOptionsPopup = new Splunk.Popup($('.resultsOptions'), {
                    inlineMode: true
                });
                // TODO - in inline mode you have to roll-your-own 'cancel' button
                // so thats what's going on below.
                $(".resultsOptions .splButton-primary").click( resultsOptionsPopup.destroyPopup.bind(resultsOptionsPopup) );
                return false;
            });
        }
                
    },
    
    hide: function() {
        $('.sidebar').hide();
    },
    
    show: function() {
        $('.sidebar').show();
    }
    
});








