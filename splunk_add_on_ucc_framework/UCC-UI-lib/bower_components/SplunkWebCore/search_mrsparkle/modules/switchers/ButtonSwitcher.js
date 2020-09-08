
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ButtonSwitcher = $.klass(Splunk.Module.TabSwitcher, {
    initialize: function($super,container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("button_switcher.js");

        var label = this._params["label"];
        if (label) {
            $("<label/>")
                .text(label)
                .prependTo(this.container);
        }
    },
    /* 
     * pulled out this little method so that ButtonSwitcher can reuse TabSwitcher.addChild.
     * this is the only thing it needed to do differently - use the title as a classname
     * rather than as the text of the link.
     */
    createTabElement: function(childTitle, childAltTitle) {
	var child = $("<a/>").addClass(childTitle);
	if (childAltTitle) {
	    child.attr("title", childAltTitle);
	}
	return child;
    },
    setActiveChild: function($super, childIndex) {
        $super(childIndex);
	this._params["selected"] = this._titles[childIndex];
    }
});

