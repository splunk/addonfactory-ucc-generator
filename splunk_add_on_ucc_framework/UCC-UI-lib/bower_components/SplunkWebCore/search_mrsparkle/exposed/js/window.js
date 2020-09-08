///////////////////////////////////////////////////////////////////////////////
// Provides common popup window/dialogs
///////////////////////////////////////////////////////////////////////////////


Splunk.window = {
    
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
    open: function(uri, name, options) {

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
    },
    
    /**
     * Opens the job manager as a popup window
     */
    openJobManager: function(getArgs) {
        var app = Splunk.util.getCurrentApp();
        if (app == "UNKNOWN_APP") app = "search";
        var url = Splunk.util.make_url('app', app, 'job_manager');
        if (getArgs) url += "?" + Splunk.util.propToQueryString(getArgs);
        var spawnedWindow = this.open(
            url, 
            'splunk_job_manager',
            {
                width: 900,
                height: 600,
                'menubar': false
            }
        );
        return spawnedWindow;
    },
    
    openAerts: function(href) {
        return this.open(href, 'splunk_alerts', {width: 900, height: 600, 'menubar': false});
    },
    
    openJobInspector: function(sid) {
        var app = (Splunk.util.getCurrentApp() === 'UNKNOWN_APP') ? 'system' : Splunk.util.getCurrentApp(),
            url = Splunk.util.make_url('manager', encodeURIComponent(app), 'job_inspector');
        
        if (!sid) {
            alert(_('Cannot open job inspector; no search job ID provided!'));
            return false;
        }
        
        var getArgs = {
            sid: sid
        };
        url += "?" + Splunk.util.propToQueryString(getArgs);
        //set width and height slightly less than openJobManager so when open on top of job manager the window can be easily identified
        var spawnedWindow = this.open(
            url, 
            'splunk_job_inspector',
            {
                width: 870, 
                height: 560,
                'menubar': false
            }
        );
        return spawnedWindow;
    }
    
};