
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.PulldownSwitcher = $.klass(Splunk.Module.AbstractSwitcher, {
    initialize: function($super,container) {
        $super(container);
        var label = this._params["label"];
        if (label) {
            $("<label/>")
                .text(label)
                .attr("style","padding-right:10px;")
                .appendTo(this.container);
        }
        this.logger = Splunk.Logger.getLogger("pulldown_switcher.js");
        var switcherInstance = this;
        this._pulldown = $("<select/>")
            .change(function() {
                if (switcherInstance.isDisabled()) return false;
                switcherInstance.setActiveChild($(this).val());
                switcherInstance.pushContextToChildren();
            })
            .appendTo(container);
    },
    addChild: function($super, child) {
        $super(child);
       
        var childIndex = this._children.length - 1;
        var childTitle = this._titles[childIndex];
        this.logger.debug(this.container.attr('id') + ' - adding option "' + childTitle + '"');
       
        var optionElement = $("<option>")
            .attr("value", childIndex)
            .text(childTitle)
            .appendTo(this._pulldown);
        var activeChildTitle = this._params["selected"] || null;
        if (childTitle == activeChildTitle) {
            optionElement.attr("selected","selected");
        }
    },
    makeLastChildAlwaysVisible: function($super) {
        $("option[value='" + (this._children.length-1) + "']", this._pulldown).remove();
        $super();
    },
    removeChild: function() {
        this.logger.error(this.moduleType, "removeChild not implemented");
    },
    _getActiveChild: function($super) {
        var selectedIndex = (this._mode == "serializeAll")  ? 0: this._pulldown.val();
        if (selectedIndex != this._activeChildIndex) {
            this.logger.error( this.moduleType + " Assertion failed in getActiveChild - pulldown state (" + selectedIndex + ") does not match internal state (" + this._activeChildIndex + ")");
        }
        return this._children[selectedIndex];
    }, 
    setActiveChild: function($super, childIndex) {
        this._pulldown.val(childIndex);
        $super(childIndex);
        if (this._pulldown.val() != this._activeChildIndex) {
            this.logger.error( this.moduleType , " Assertion failed in getActiveChild - pulldown state (" , this._pulldown.val(), ") does not match internal state (" , this._activeChildIndex , ")");
        }
    },
    isChildLocked: function(childIndex) {
        return ($("option[value='" + (childIndex) + "']", this._pulldown).prop("disabled") == true);
    },
    lockChild: function(childIndex) {
        var childOption = $("option[value='" + (childIndex) + "']", this._pulldown)
            .attr("disabled", "true");
    },
    unlockChild: function(childIndex) {
        var childOption = $("option[value='" + (childIndex) + "']", this._pulldown)
            .attr("disabled", "false");
    }
});