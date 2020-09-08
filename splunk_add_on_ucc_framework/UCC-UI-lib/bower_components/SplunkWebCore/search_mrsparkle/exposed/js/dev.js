Splunk.Dev = {
    
    init: function() {
        if ($.cookie('devToolbar')) {
            Splunk.Dev.enable();
            Splunk.Dev.logger = Splunk.Logger.getLogger("dev.js");
        }
    },
    
    enable: function() {
        
        var toolbar = $('<div id="splunkDevToolbar"><div id="devOpener">Dev</div></div>');
        toolbar.appendTo(document.body);
        $('#devOpener', toolbar).css('left', $(window).width()/2);
        
        var menu = [
            {   
                label : 'Toggle module info',
                callback: function() { Splunk.Dev.toggleModuleOverlay(); }
            },
            /*
            {   
                label : 'Toggle module ancestry',
                callback: function() { Splunk.Dev.toggleTreeLines(); }
            },
            */
            {   
                label : 'Show view source',
                callback: function() { 
                    window.open(Splunk.util.make_url( sprintf('/app/%s/%s?showsource=1', Splunk.util.getCurrentApp(), Splunk.util.getCurrentView())));
                }
            },
            {   
                label : 'Commit snapshot',
                callback: function() { Splunk.Dev.commitCurrentSnapshot(); }
            }
        ];
        var activator = $('#devOpener');
        if (activator) {
            var menuObject = new Splunk.MenuBuilder({
                containerDiv: $('#splunkDevToolbar'),
                menuDict: menu,
                activator: $('#devOpener'),
                menuClasses: 'whiteSplunkMenu'
            });
        } else {
            Splunk.Dev.logger.error("Splunk.Dev tried to enable, but failed for lack of an #devOpener element");
        }
        $.cookie('devToolbar', 'on', {expires: 1000});
        
    },
    
    disable: function() {
        $.cookie('devToolbar', null);
        $('#splunkDevToolbar').remove();
        Splunk.Dev.toggleModuleOverlay(true);
    },
    
    toggleModuleOverlay: function(kill) {
        
        if (kill || $('.devModuleOverlay', document.body).size() > 0) {
            $('.devModuleOverlay').remove();
            return;
        }
        
        $('.SplunkModule').each(function() {
            
            $(this).css('position', 'relative');
            
            var context = Splunk.Globals.ModuleLoader.getModuleInstanceById($(this).attr('id')).getContext();
            var contextOutput = [];
            var contextHash = context.getAll();
            for (var k in contextHash) {
                if (contextHash.hasOwnProperty(k)) {
                    contextOutput.push(k + '=' + contextHash[k]);
                }
            }
            
            var moduleId = $(this).attr('id');
            var overlay = $('<div class="devModuleOverlay"><span class="devModuleLabel">' + moduleId + '</span><div class="devModuleSettings">' + contextOutput.join('<br />') + '</div></div>');
            overlay.css('width', $(this).outerWidth());
            overlay.css('height', $(this).outerHeight());
            overlay.hover(
                function() { 
                    $(this).css('opacity', 0.9).css('background-color', '#486573');
                },
                function() { 
                    $(this).css('opacity', null).css('background-color', null); 
                }
            );
            overlay.click( function() { 
                window.console.log('getContext() for module: ' + moduleId);
                window.console.dir(context || '(none)'); 
            });
            overlay.appendTo($(this));
        });
        
        $(document).keypress(function(evt) { if (evt.keyCode == 27) Splunk.Dev.toggleModuleOverlay(true); });
    },
    
    toggleTreeLines: function() {
        
    },
    
    commitCurrentSnapshot: function() {
        var messenger = Splunk.Messenger.System.getInstance();

        var vs_id = Splunk.Globals.ModuleLoader.commitViewParams();
        var uri = Splunk.util.make_url('app', Splunk.util.getCurrentApp(), Splunk.util.getCurrentView()) + '?vs=' + encodeURIComponent(vs_id);

        messenger.send('info', 'Splunk.Dev', 'Viewstate created - ' + vs_id + ' - ' + uri);

        return vs_id;
    }
    
};