Splunk.Module.IndexSizes = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        // technically shouldnt have either but given some legacy views out there, 
        // asserting on the parent will do more harm than good
        //this.parentEnforcement = Splunk.Module.NEVER_ALLOW;
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        
        $(container).bind('click', this.onClick.bind(this));
        this.getResults();
    },
   
    getResultParams: function() {
        return {'showDetails': Splunk.util.normalizeBoolean(this.getParam('showDetails'))};
    },
    
    onClick: function(evt) {
        var originator = evt.target;
        if (originator.tagName.toUpperCase() != "A" ||
            !$(originator).hasClass('eventCountDetailOpener')) return false;
           
        $('.eventCountDetail', this.container).toggle();
        return false;
    }
   
});