
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ShowHideHeader = $.klass(Splunk.Module.AbstractSwitcher, {
    initialize: function($super,container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("ShowHideHeader.js");
        this.container.click(this.onClick.bind(this));
    },
    onLoadStatusChange: function($super, statusInt) {
        $super(statusInt);
        if (Splunk.util.normalizeBoolean(this._params["hideChildrenOnLoad"])) {
            this.setActiveChild(1);
        } 
    },
    setActiveChild: function($super, childIndex) {
        if (childIndex==0) {
            $("h2",this.container).removeClass("closed");
        } else if (childIndex==1) {
            $("h2",this.container).addClass("closed");
        }
        else {
            this.logger.error("Error. Since it is only for showing and hiding a single branch of the tree, ", this.moduleType, " can only have 2 switchable children.");
        }
        $super(childIndex);
    },
    onClick: function() {
        this.setActiveChild((this._activeChildIndex + 1) % 2);
	if (this._mode != "serializeAll") {
	    this.pushContextToChildren();
	}
    }
});
