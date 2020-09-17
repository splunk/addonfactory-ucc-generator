
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.LinkSwitcher = $.klass(Splunk.Module.TabSwitcher, {
    initialize: function($super,container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("link_switcher.js");
    },
    /* 
     * pulled out this little method so that ButtonSwitcher can reuse TabSwitcher.addChild.
     * this is the only thing it needed to do differently - use the title as a classname
     * rather than as the text of the link.
     */
    createTabElement: function(childTitle) {
        return $("<a/>").text(childTitle);
    },
    onLoadStatusChange: function($super,statusInt) {
        $super(statusInt);
        // add a pipe between the links.
        // AbstractSwitcher creates its links/tabs/options by overriding addChild. 
        // although generally this makes a lot of stuff easier, it makes details
        // like this look a little silly.
        if (!this.isPageLoadComplete() && statusInt == Splunk.util.moduleLoadStates.HAS_CONTEXT) {
            $("ul li:not(:last-child)", this.container).append("<span class='linkSwitcherPipe'> | </span>");
            $("ul li", this.container).append("<span class='linkSwitcherSelectedIcon'></span>");
        }
    }
});
