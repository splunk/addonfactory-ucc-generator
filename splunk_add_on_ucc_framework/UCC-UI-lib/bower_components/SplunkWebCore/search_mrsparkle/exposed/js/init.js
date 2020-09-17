/**
 * Initializes JS environment
 */

// Simple place to store globals
Splunk.Globals = {};

if (Splunk.PageStatus) {
    Splunk.Globals['PageStatus'] = Splunk.PageStatus.getInstance();
}

if (Splunk.Jobber) {
    Splunk.Globals['Jobber'] = new Splunk.Jobber();
}

//Splunk.LayoutEngine
if(Splunk.LayoutEngine) {
    Splunk.Globals['LayoutEngine'] = new Splunk.LayoutEngine();
}
// you cant initialize DashboardManager only in document.ready
// because the jobResurrected events get triggered while module HTML is still loading.
// but it doesnt rely on any page elements so we just fire it up here.
if (Splunk.DashboardManager) {
    Splunk.Globals['DashboardManager'] = new Splunk.DashboardManager();
}
$(document).ready(function() {
    // instantiate a singleton ModuleLoader object for this document.
    Splunk.Globals["timeZone"] = new Splunk.TimeZone(Splunk.util.getConfigValue('SERVER_ZONEINFO'));

    if (Splunk.ModuleLoader) {
        if (!Splunk.Module && window.console && console.log) {
            console.log('Splunk.Module not present; skipping module loading');
        } else {
            Splunk.Globals['ModuleLoader'] = new Splunk.ModuleLoader();
        }
    }

    if (Splunk.Session) {
        // Splunk.Session has a more singleton-like interface so this
        // is kind of unnecessary, but for consistency's sake...
        Splunk.Globals['Session'] = Splunk.Session.getInstance();
    }

    if (Splunk.Print) {
        Splunk.Globals['Print'] = Splunk.Print.getInstance();
    }

    if (Splunk.Viewmaster) {
        Splunk.Globals['Viewmaster'] = new Splunk.Viewmaster();
    }

    // Moved out of jobber
    $("#loading").hide(); //ajaxStart(function(){ $(this).show(); }).ajaxStop(function(){ $(this).hide(); });

    if (Splunk.initPrintHandler) {
        Splunk.initPrintHandler();
    }

    if (Splunk.PageStatus) {
        Splunk.Globals['PageStatus'].setupComplete();
    }

    // add optional messaging
    if (Splunk.Globals['DashboardManager']) {
        Splunk.Globals['DashboardManager'].showDashboardPrompts();
    }

    // debug
    if (Splunk.Dev) {
        Splunk.Dev.init();
    }

    // Stripped messaging module for Manager pages
    if (Splunk.Message) {
        Splunk.Globals['Message'] = new Splunk.Message();
    }
    if (Splunk.init508){
        Splunk.init508();
    }
});

// Enable jQuery's traditional encoding of ajax parameters, see http://jquery14.com/day-01/jquery-14
jQuery.ajaxSettings.traditional = true;

// currently this only works on firefox.
// It could be made to work on IE if we removed SplunkPatchWindowUnload or reworked it somehow.
// and I cannot find a way to get this working on safari.
$(window).unload(function() {
    if(Splunk.Globals.Jobber && Splunk.util.normalizeBoolean($(document.body).attr("s:onunloadcanceljobs") || false)){
        Splunk.Globals.Jobber.listJobs(function(job){
            return (job.canBeAutoCancelled());
        }).cancel();

    }
    $(document).unbind();
    $(this).unbind();
});

// patch for jquery onunload interfering with our ajax CSRF protection see: js/contrib/jquery-1.3.2.js.patch
// bump the order of execution to last
jQuery( window ).unbind( 'unload', jQuery.fn.SplunkPatchWindowUnload );
jQuery( window ).bind( 'unload', jQuery.fn.SplunkPatchWindowUnload );

/**
 * Fix for IE6 image flickering issues.
 *  Quck explanation: IE6 likes to check to make sure that there isn't a newer version of an image on the server
 *  before applying any css rule.  When we have hovers on an element (usually an <a> tag), it triggers flickering of the
 *  image as IE6, disregarding your browser settings, tells you to hang on a sec while it goes and checks.  Talk about OCD.
 *  The fix will trigger background image caching regardless of browser settings.
 */
if ( $.browser.msie && parseInt($.browser.version,10) < 7 ) {
    try {
     document.execCommand('BackgroundImageCache', false, true);
    } catch(e) {}
}

// SPL-72235 - ghetto IE7 fix for nav caret timing issue
if ( $.browser.msie && parseInt($.browser.version,10) < 8 ) {
    var $nav = $('.appHeader > div');
    setTimeout(function(){
        $nav.removeClass('splunk-components');
    }, 1000);
    setTimeout(function(){
        $nav.addClass('splunk-components');
    }, 1200);
}

Splunk.init508 = function(){
	var navLink = '<a class="navSkip" href="#navSkip" tabIndex="1">' + _("Screen reader users, click here to skip the navigation bar") + '</a>';
	var navAnchor = '<a name="navSkip" />';
	if($('.appHeaderWrapper')){
        $(navLink).insertBefore('.appHeaderWrapper');

        if($('.adminContent').length==1){
            $(navAnchor).insertBefore('.adminContent');
        } else {
            $(navAnchor).insertAfter('.appHeaderWrapper');
        }
    }
};
Splunk.initPrintHandler = function() {
    if ($.cookie('autoprint')) {
        $(document).bind(Splunk.Globals.PageStatus.READY, function() {
            window.print();
        });
    }
};
