
Splunk.Module.DistributedSearchServerChooser = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        this._select = $('select', this.container);
        // someday this module probably wants to have a searchWhenChanged param like TimeRangePicker, and like the listers.
        //this._select.change(function(event){this.pushContextToChildren();}.bind(this));
        $super(container);
    },

    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");
        
        var selectedServers = this._select.val();
        if (selectedServers) {
            search.abandonJob();
            search.setDistributedServerList(selectedServers);
            context.set("search", search);
        }
        return context;
    },

    applyContext: function(context) {
        var search = context.get("search");
        var serverList = search.getDistributedServerList();
        //alert(serverList.join(" "))

        $("option", this.container).each(function(i, elt) {
            if (serverList.indexOf($(elt).val()) != -1) {
                $(elt).prop('selected', true);
            } else {
                $(elt).prop('selected', false);
            }
        });
    }

});
