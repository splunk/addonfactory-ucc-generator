/**
 * Splunk.Module.Sorter:
 *
 * The sorting mastermind.
 *
 */
Splunk.Module.Sorter = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        $('a', this.container).bind('click', this.handleClick.bind(this));
        
        var sortKey = this.getParam('sortKey');
        if (!sortKey) {
            var field = this.getParam('fields')[0];
            if (field['value']) {
                sortKey = field['value'];
            } else {
                sortKey = field['label'];
            }
            this.setParam('sortKey', sortKey);
        }
    },
    
    getModifiedContext: function() {
        var context = this.getContext();
        context.set("results.sortKey", this.getParam('sortKey'));
        context.set("results.sortDir", this.getParam('sortDir'));
        return context;
    },
    
    setSort: function(clicked_sortKey) {
        this.setParam('sortKey', clicked_sortKey);
        var sortDir = this.getParam('sortDir');
        if (sortDir == 'desc')
            this.setParam('sortDir', 'asc');
        else if (sortDir == 'asc')
            this.setParam('sortDir', 'desc');
    },
    
    showSortSpan: function(sortKey) {
        var moduleId = '#' + this.moduleId;
        var sortDirTrans = this.getParam('sortDir')=='asc' ? _('asc') : _('desc');
        $(moduleId + ' span.sortDir')
            .text('(' + sortDirTrans + ')')
            .appendTo(moduleId + ' span.' + sortKey);
    },
    
    handleClick: function(event) {
        var eventClass = $(event.target).attr('class');
        this.setSort(eventClass);
        this.showSortSpan(eventClass);
        this.pushContextToChildren();
        event.preventDefault();
    }
});
