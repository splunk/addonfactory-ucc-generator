
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.TabSwitcher = $.klass(Splunk.Module.AbstractSwitcher, {
    initialize: function($super,container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("TabSwitcher.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this._lockMessages = [];
        
        /* in serializeAll mode, the last child is always visible, and is thus not 
           represented by a visible label.  To prevent the system from even briefly 
           showing a nonsense label, we hide the entire ul until the module is LOADED  */
        if (this._mode == "serializeAll") {
            $("ul", this.container).hide();
        }
    },
    onLoadStatusChange: function($super,statusInt) {
        $super(statusInt);
        if (!this._alreadyDealtWithTabs && !this.isPageLoadComplete() && statusInt >= Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT) {
            if (this._mode == "serializeAll") {
                $("ul li:last-child", this.container).remove();
                $("ul", this.container).show();
            }
            this._alreadyDealtWithTabs =true;
        }
    },
    addChild: function($super, child) {
        $super(child);
       
        var childIndex = this._children.length - 1;
        var childTitle = this._titles[childIndex];
        var childAltTitle = this._altTitles[childIndex];

        this.logger.debug(this.container.attr('id') + ' - adding option "' + childTitle + '"');
        
        var liElement = $("<li/>")
            .click(function(evt) {
                this.onTabClick(childIndex);
            }.bind(this))
            .append(this.createTabElement(childTitle, childAltTitle))
            .appendTo($("ul", this.container));

        var activeChildTitle = this._params["selected"] || this._titles[0];
        if (childTitle == activeChildTitle) {
            liElement.addClass("selected");
            this._activeChildIndex = childIndex;
        }
    },
    createTabElement: function(childTitle, childAltTitle) {
        var child = $("<a/>").text(childTitle);
        if (childAltTitle) {
            child.attr("title", childAltTitle);
        }
        return child;
    }, 
    onTabClick: function(childIndex) {
        if (this.isDisabled()) return false;
        if (this.isChildLocked(childIndex)) {
            if (this._lockMessages[childIndex]) {
                var message = this._lockMessages[childIndex].message;
                var messageTarget = this._lockMessages[childIndex].messageTarget;
                this.messenger.send('info', messageTarget, message);
            } 
            return false;
        } else {
            // here is where we would call the clear()  method but unfortunately it wont work to fix SPL-20653 because the Message module doesnt have filter=*
            //this.messenger.clear();
            delete this._lockMessages[childIndex];
        }
        this.setActiveChild(childIndex);
        if (this._mode != "serializeAll") {
            this.pushContextToChildren();
        }
    },
    getChildTab : function(childIndex) {
        var tabNodes = $("li", this.container);
        return $(tabNodes[childIndex]);
    },
    setActiveChild: function($super, childIndex) {
        $("li.selected", this.container).removeClass("selected");
        this.getChildTab(childIndex).addClass("selected");
        $super(childIndex);
    },
    makeLastChildAlwaysVisible: function($super) {
        this.getChildTab(this._children.length-1).remove();
        $super();
    },
    isChildLocked: function(childIndex) {
        return this.getChildTab(childIndex).hasClass("disabled");
    },
    lockChild: function(childIndex, message, messageTarget) {
        this.getChildTab(childIndex).addClass("disabled");
        this._lockMessages[childIndex] = {message: message, messageTarget: messageTarget};
    },
    unlockChild: function(childIndex) {
        this.getChildTab(childIndex).removeClass("disabled");
    }
});

