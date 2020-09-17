Splunk.Module.SearchMode = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container){
        $super(container);
        this.setLabel(this.getParam('searchModeLevel'));
        this.menuInit();
    },
    changeSynthetic: function(type) { 
        if (type == this.getParam('searchModeLevel')) return;
        var context = this.getContext(),
            search = context.get('search');
        this.setParam('searchModeLevel', type);
        this.setLabel(type);
        if (search && search.job && search.job.getSID() && !search.job.isDone()) {
            this.getRootAncestor().pushContextToChildren();
        }
    },
    setLabel: function(type) {
        var label;
        switch(type){
            case 'smart' : 
                label = _('Smart Mode');
            break;
            case 'fast' : 
                label = _('Fast Mode');
            break;
            case 'verbose' :
                label = _('Verbose Mode');
            break;
            default :
                label = _('Search Mode');
            break;
        }
        $('.search-mode-activator .search-mode-label', this.container).html(label).show();
        $('.search-mode-activator .icon', this.container).attr('class', 'icon icon-' + type);  
    },
    onBeforeJobDispatched: function(search) {
        search._searchModeLevel = this.getParam('searchModeLevel');
    },
    menuInit: function() {
        var data = [
            {
                menuType: 'htmlBlock', 
                style: 'search-mode-smart',
                element: '<a href="#" class="item smart" data-type="smart" tabindex="-1"> \
                    <i class="icon icon-smart"></i> \
                    <strong>' + _('Smart') + '</strong> \
                    <span>&bull; ' + _('Field discovery on for event searches') + '<br/> \
                    &bull; ' + _('No event or field data for reporting') + '</span></a>',
                callback: function(e) {
                    var $item = $(e.target).closest('a');
                    this.changeSynthetic($item.attr('data-type'));
                }.bind(this)
            },
            {
                divider: 'splDivider'
            },
            {
                menuType: 'htmlBlock',
                style: 'search-mode-fast',
                element: '<a href="#" class="item fast" data-type="fast" tabindex="-1"> \
                    <i class="icon icon-fast"></i> \
                    <strong>' + _('Fast') + '</strong> \
                    <span>&bull; ' + _('Field discovery off for event searches') + '<br/> \
                    &bull; ' + _('No event or field data for reporting') + '</span></a>',
                callback: function(e) {
                    var $item = $(e.target).closest('a');
                    this.changeSynthetic($item.attr('data-type'));
                }.bind(this)
            },
            {
                divider: 'splDivider'
            },
            {
                menuType: 'htmlBlock', 
                style: 'search-mode-verbose',
                element: '<a href="#" class="item verbose" data-type="verbose" tabindex="-1"> \
                    <i class="icon icon-verbose"></i> \
                    <strong>' + _('Verbose') + '</strong> \
                    <span>&bull; ' + _('All field &amp; event data') + '</span></a>',
                callback: function(e) {
                    var $item = $(e.target).closest('a');
                    this.changeSynthetic($item.attr('data-type'));
                }.bind(this)
            }
        ];
        var m = new Splunk.MenuBuilder({
            menuDict: data,
            activator: $('.search-mode-activator', this.container),
            menuClasses: 'splMenu-primary search-mode-select' // note: adding menu class removes splMenu-primary
        });
    }
});
