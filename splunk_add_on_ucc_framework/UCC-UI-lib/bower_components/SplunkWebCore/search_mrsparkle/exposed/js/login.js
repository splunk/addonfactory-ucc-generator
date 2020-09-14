///////////////////////////////////////////////////////////////////////////////
//
//  Splunk update/notification system
//
//  This works in conjunction with a banner system hosted on
//  quickdraw.splunk.com that delivers a JSON object which describes
//  content or additional instructions for displaying dynamic content.
//
//  Request:
//      http://quickdraw.splunk.com/js/<license_type>/<product_version>/
//          <install_type>/<content_location>/<skin>?locale=<locale>
//
//  Response:
//
//      var spotParams = { 
// 	        url: 'http://quickdraw.splunk.com/free/3.2.3/home/unknown/basic',
// 	        height: 95,
//  	    hasNewVersion: true,
//  	    newVersionLabel: '3.3'
//      };
//      displaySpot(spotParams);
//
///////////////////////////////////////////////////////////////////////////////


// define the time to wait for a response from splunk.com (in milliseconds)
var REMOTE_SCRIPT_LOAD_TIMEOUT = 10000;

// define time to show tips content messages (in milliseconds)
var MESSAGE_DISPLAY_DELAY = 5000;

// define time to show empty content messages (in milliseconds)
var NON_MESSAGE_DISPLAY_DELAY = 1000;

// define time for free users to wait to be able to see checking for updates message
var UPDATE_CHECKER_DISPLAY_DELAY = 1500;

var D = {
    debug: function(msg) { this.msg(msg); },
    info: function(msg) { this.msg(msg); },
    warn: function(msg) { this.msg(msg); },
    error: function(msg) { this.msg(msg); },
    msg: function(msg) { if (window.console) window.console.log(msg); }
    
};

// TODO: wire up to real method and then delete me
function getLicenseType() {
    return CONFIG.licenseType;
}


function getTipsOffset() {
	var count = $.cookie("tipsOffset") || 0;
	return parseInt(count, 10);
}

function incrementTipsOffset() {
	var count = getTipsOffset();
	$.cookie("tipsOffset", count+1, {'expires': 1000});
}

function goHome(timeOutInMilliseconds, allowRedirect) {
    var location = "/";
    if (allowRedirect && CONFIG.return_to) {
        location = CONFIG.return_to;
    }
    
	if (timeOutInMilliseconds) {
	    setTimeout('document.location = "'+location+'"', timeOutInMilliseconds);
    } else {
	    document.location = location;
	}
}


/**
 * Constructs the URI to get content
 *
 * @param {string} checkerLocation the name of the content provider
 *      to pull data from, ex: 'login', 'tips'
 *
 */
function getUpdateCheckerURL(checkerLocation) {
	
	var segments = [
            getLicenseType(),
	    CONFIG.versionNumber,
	    checkerLocation,
	    CONFIG.installType,
	    CONFIG.skin
	];
	
	var uidParam = encodeURIComponent($.cookie('splunkweb_uid') || null);
	
	var url = CONFIG.updateCheckerBaseURL; 
    url += segments.join("/");
    url += '?locale=' + CONFIG.locale;
    url += '&cpu_arch=' + encodeURIComponent(CONFIG.cpu_arch);
    url += '&os_name=' + encodeURIComponent(CONFIG.os_name);
    url += '&guid=' + CONFIG.guid;
    url += '&uid=' + uidParam;
    url += '&license_desc=' + encodeURIComponent(CONFIG.license_desc);
    url += '&django=' + encodeURIComponent(CONFIG.django);
    url += '&product=' + encodeURIComponent(CONFIG.product_type);
	if (checkerLocation == "tips") {
		url += "&offset=" + getTipsOffset();
	}

	return url;
}


/** 
 * The actual logic for the updateChecker, the upgrade-banner, the tips content, 
 * cannot-connect content, timeouts etc..
 * It's convoluted.  
 * It has a checkered past.  
 * There is a flow chart.  
 * Do not pass GO until you understand the flow chart.
 * GO
 */
function initUpdateChecker(){

    D.debug('initUpdateChecker - START');

    if (getLicenseType() == "free") {
    	//free users don't login.  hide the login form.
    	$('.loginForm').hide();
        
        // tell the user why they're about to wait for the connection to 
        // splunkd,  which could take a second two for high latency users.
        $('#freeMessageContainer').html('<div class="checkingForUpdatesWrapper"><div class="checkingForUpdates">' + _('Checking for updates...') + '</div></div>').show();
        D.debug('checking for updates');
        
        var spinOptions = {
            lines: 8, // The number of lines to draw
            length: 2, // The length of each line
            width: 2, // The line thickness
            radius: 3, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: 'white', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 0, // The z-index (defaults to 2000000000)
            top: '0', // Top position relative to parent in px
            left: '0' // Left position relative to parent in px
        };   
        var spinner = new Spinner(spinOptions).spin();
        $("#freeMessageContainer .checkingForUpdatesWrapper").prepend(spinner.el);

        // wait 1.5 secs so they can read the 'checking for updates message
        var nullTimeout = setTimeout(fireInitialSplunkDotComRequest, UPDATE_CHECKER_DISPLAY_DELAY);        
        
    } else {
    	fireInitialSplunkDotComRequest();
    }
    
}

/**
 *	fires off initial splunk.com request
 */
function fireInitialSplunkDotComRequest () {
	sendSplunkDotComRequest("login");
    
    // wait for a bit for request to come back; fire next request if no response
    window.cannotConnectTimeout = setTimeout(handleInitUpdateTimeout, REMOTE_SCRIPT_LOAD_TIMEOUT);
}

/**
 * Handles case when client cannot connect to external internet; will trigger
 * logic to display tip content
 *
 */
function handleInitUpdateTimeout(timerId) {
	
	// although the respnses themselves will clear the timeout that leads to 
    // this function running, we are careful to check here,  and if either of 
    // the two systems has displayed content, we bail out.
	if ($("#updateCheckerContainer").hasClass("updatesActive") || $("#tipsCheckerContainer").hasClass("tipsActive") || $("#freeUpdateCheckerContainer").hasClass("updatesActive")) {
		    return false;
		
	} else {
		D.debug("The request to splunk.com is taking so long that we assume we cannot connect.");

		if (getLicenseType() == "free" && !CONFIG.hasErrorMessage) {
			displayFallbackTipsContent();
			$("#freeMessageContainer").html(_("<a href='/' class='splButton-primary connectErrorContinue'><span>Continue &raquo;</span></a>")).show();
		} else {				
            D.debug("handleInitUpdateTimeout - license not free or there is error");
			displayBannerFrame('connectError');
		}
	}
}


function sendSplunkDotComRequest(checkerLocation) {
    D.debug('sendSplunkDotComRequest - trying: ' + getUpdateCheckerURL(checkerLocation));

    $.ajax({
        dataType: 'script',
        type: 'GET',
        url: getUpdateCheckerURL(checkerLocation)
    });
}


/**
 * Renders the login banners.  Is called by scriptlets from splunk.com.
 * If no internet is available, the fallback will be displayed on timeout.
 *
 *
 */
function displaySpot(spotParams) {
    
	// if we get back either one of the 2 answers, we dont do any cannot-connect fallbacks
	if (window.cannotConnectTimeout) clearTimeout(window.cannotConnectTimeout);

	var allBetsAreOff = false;
	var spotLocation = spotParams["location"] || false; 
	if (!spotLocation) {
		D.error("displaySpot - response did not contain a 'location' key. This should never happen.");
		spotLocation = "login";
		allBetsAreOff = true;
	}

	var url = spotParams["url"] || false;

	D.debug("displaySpot - splunk.com responded for location=" + spotLocation + " and is sending us to url=" + url);

	var product = getLicenseType();
	
	// if this was a request for tips then update the counter.
	if (spotLocation == "tips") {
		incrementTipsOffset();
	}

	// handle free product upgrade messaging, which does NOT use the banner system. 
	// instead the free product shows a link asking the user if they want to 
    // upgrade to <latest version number on splunk.com>
	if ((product == "free") && (spotLocation == "login")) {

        D.debug('displaySpot - rendering free update');

		var message = '';

        // show download link and a skip update link
		if (spotParams['hasNewVersion']) {
            message = '<div class="freeMessageUpdate"><a href="http://www.splunk.com/r/download" class="splButton-primary"><span>Download</span></a>';
            message += '<a class="skipUpdate" href="javascript:sendSplunkDotComRequest(\'tips\');">' + _('Skip update') + '</a></div>';

        // if quickdraw returned no URL, this means the user already has the 
        // latest version.  skip messaging if an error is displayed
		} else if (!CONFIG.hasErrorMessage) {
            message = "<div class='checkingForUpdatesWrapper'><div class='noUpdatesFound'><i class='icon-check'></i>" +  _('No updates found.') + "</div></div>";

			// kickoff part 2 - the 'tips' content.
			if (allBetsAreOff) {
				goHome(MESSAGE_DISPLAY_DELAY, true);
			} else {
				sendSplunkDotComRequest('tips');
			}
	    }

        if (url) {
            D.debug('displaySpot - rendering URL: ' + url);
    		displayBannerFrame(url);
        }
        
        $('.loginForm').hide();
	    $("#freeMessageContainer").html(message).show();
		
	} else {

		// handle any banner displays
		if (url) {

            D.debug('displaySpot - rendering URL: ' + url);

			if (spotLocation == "login") {
				displayBannerFrame(url);
			} else if (spotLocation == "tips") {
				displayTipsFrame(url);	
			} else{
                D.error('Update checker got unrecognized location: ' + spotLocation);
            }

		} else if ((product == "free") && (spotLocation == "tips")) {
			// A strange case that can happen in development. 
			// A tips request for the free server returned NO tips. 
			// This usually means that this version of the product is too new to exist
			// in the splunk.com database.
            D.debug('displaySpot - no URL when requesting free/tips');
    	    $("#freeMessageContainer").html(_('Loading...')).show();
            goHome(NON_MESSAGE_DISPLAY_DELAY, true);
		
        } 

	}
}

function displayBannerFrame(url, spotParams) {

	spotParams = spotParams || {};
    
    D.debug('displayBannerFrame - spotParams=' + spotParams);
    
    if (url == 'connectError') {
        $('#connectError').show();
    } else {
        var product = getLicenseType();
        var iframe;
        if (product == "free") {
            $("#freeUpdateCheckerContainer").addClass("updatesActive").show();
        	iframe = $("#freeUpdateChecker");
        } else {
            $("#updateCheckerContainer").addClass("updatesActive").show();
        	iframe = $("#updateChecker");
        }

        iframe.attr('src', url);
            
        if (spotParams.hasOwnProperty('height')) {
            iframe.height(spotParams["height"]);
        }
        
        if (spotParams.hasOwnProperty("failsafeCSSText")) {
            iframe.css("" + spotParams["failsafeCSSText"]);
        }
    }
}


function displayTipsFrame(url) {
    $("#updateCheckerContainer").hide();
    if (url == 'connectError') {
        $('#connectError').show();
    } else {
    	$("#userMessaging, #authWrapper, #freeMessageContainer, #updateCheckerContainer, #connectError").hide();
    	$("#tipsCheckerContainer").addClass('tipsActive').show();
        $("#tipsChecker").attr('src', url);
    }
    
}



function displayFallbackTipsContent() {
	var fallbackURL = CONFIG.tipsCheckerCannotConnectBannerPath;
	D.debug("displayFallbackTipsContent - START");
	displayTipsFrame('connectError');
}

function passwordHintClick() {
    if ( $('#passwordHint').is(':visible') ) {
        $('#passwordHint').hide();
    } else {
        $('#passwordHint').slideDown({duration: '200', easing: 'linear'});   
    }
    return false;   
}

function hidePasswordHint() {
    $('#passwordHint').hide();   
}

function initializePlaceholder() {
    $(".input-wrapper").each(function(index, el) {
        var $placeholder = $(el).find(".placeholder-text");
        var $input = $(el).find("input");
        var updatePlaceholder = function() {
            $placeholder[$input.val() === '' ? 'show' : 'hide']();
        };

        $placeholder.click(function() {
            $input.focus();
        });
        $input.focus(function() {
            $placeholder.addClass("focus");
        });
        $input.blur(function() {
            $placeholder.removeClass("focus");
        });
        $input.bind('keyup mouseup change', function() {
            updatePlaceholder();
        });
        // clears out placeholder if user has autofill enabled 
        setTimeout(updatePlaceholder, 250);
    });
}


