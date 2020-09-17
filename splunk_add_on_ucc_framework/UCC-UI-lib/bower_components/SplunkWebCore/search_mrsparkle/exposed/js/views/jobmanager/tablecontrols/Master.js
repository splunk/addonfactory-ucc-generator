define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/jobmanager/tablecontrols/bulkactions/Master',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl',
        'views/shared/CollectionCount',
        'views/shared/DropDownMenu',
        'views/shared/CollectionPaginator',
        'views/shared/delegates/Dock',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        Base,
        BulkActionsView,
        SyntheticSelectControl,
        TextControl,
        CollectionCount,
        DropDownMenu,
        CollectionPaginator,
        Dock,
        splunkUtil
    )
    {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                // App filter
                var staticAppItems = [{label:_('All').t(), value: ''}];
                var dynamicAppItems = this.collection.apps.map(function(model, key, list){
                    return {
                        label: splunkUtil.sprintf('%s (%s)', model.entry.content.get('label'), model.entry.get("name")),
                        value: model.entry.get('name')
                    };
                });
                var appItems = [staticAppItems, dynamicAppItems];
                
                this.children.totalCount = new CollectionCount({
                    countLabel: _('Jobs').t(),
                    collection: this.collection.jobs,
                    tagName: 'span'
                });
                
                this.children.selectAppFilter = new SyntheticSelectControl({
                    toggleClassName: 'btn-pill',
                    model: this.model.state,
                    modelAttribute: 'app',
                    items: appItems,
                    additionalClassNames: 'app-filter',
                    useLabelAsTitle: true,
                    label: _('App: ').t()
                });
                
                // Owner filter
                var staticUserItems = [ {label:_('All').t(), value:'*'}];
                var dynamicUserItems = this.collection.users.map(function(model, key, list){
                    return {
                        label: splunkUtil.sprintf('%s (%s)',
                                                    model.entry.content.get('realname') || model.entry.get('name'),
                                                    model.entry.get('name')),
                        value: model.entry.get('name')
                    };
                });
                var userItems = [staticUserItems, dynamicUserItems];
                
                this.children.selectOwnerFilter = new SyntheticSelectControl({
                    toggleClassName: 'btn-pill',
                    model: this.model.state,
                    modelAttribute: 'owner',
                    items: userItems,
                    additionalClassNames: 'owner-filter',
                    useLabelAsTitle: true,
                    label: _('Owner: ').t()
                });
                
                // Status Filter
                var statusItems = [ {label:_('All').t(), value:'*'},
                                    {label:_('Queued').t(), value:'queued'},
                                    {label:_('Parsing').t(), value:'parsing'},
                                    {label:_('Running').t(), value:'running'},
                                    {label:_('Backgrounded').t(), value:'background'},
                                    {label:_('Paused').t(), value:'paused'},
                                    {label:_('Finalizing').t(), value:'finalizing'},
                                    {label:_('Done').t(), value:'done'},
                                    {label:_('Finalized').t(), value:'finalized'},
                                    {label:_('Failed').t(), value:'failed'}
                                ];
                
                this.children.selectJobStatusFilter = new SyntheticSelectControl({
                    toggleClassName: 'btn-pill',
                    menuWidth: 'narrow',
                    model: this.model.state,
                    modelAttribute: 'jobStatus',
                    items: statusItems,
                    label: _('Status: ').t()
                });
                
                // Text Filter
                this.children.textFilter = new TextControl({
                    model: this.model.state,
                    modelAttribute: "filter",
                    inputClassName: 'search-query',
                    placeholder: _("filter").t(),
                    canClear: true,
                    updateOnKeyUp: true
                });
                
                this.children.count = new SyntheticSelectControl({
                    model: this.model.state,
                    modelAttribute: 'countPerPage',
                    items: [
                        { value: '10',  label: _('10 Per Page').t()  },
                        { value: '20',  label: _('20 Per Page').t()  },
                        { value: '50',  label: _('50 Per Page').t()  }
                    ],
                    menuWidth: "narrow",
                    toggleClassName: 'btn-pill',
                    nearestValue: true,
                    additionalClassNames: 'count-per-page'
                });
                
                this.children.bulkAction = new BulkActionsView({
                    model: {
                        application: this.model.application
                    },
                    collection: {
                        selectedJobs: this.collection.selectedJobs
                    }
                });
                
                this.children.collectionPaginator = new CollectionPaginator({
                    collection: this.collection.jobs,
                    model: this.model.state,
                    countAttr: 'countPerPage'
                });
                
                this.activate();
            },
            
            startListening: function() {
                this.listenTo(this.model.state, 'change:app change:owner change:filter change:jobStatus', function() {
                    this.model.state.set('offset', 0);
                });
            },
            
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate());
                    var $filtersContainer = this.$('.filters-container'),
                        $selectedContainer = this.$('.selected-container');
                    this.children.totalCount.render().appendTo($filtersContainer);
                    if (this.model.user.canUseApps()) {
                        this.children.selectAppFilter.render().appendTo($filtersContainer);
                    }
                    this.children.selectOwnerFilter.render().appendTo($filtersContainer);
                    this.children.selectJobStatusFilter.render().appendTo($filtersContainer);
                    this.children.textFilter.render().appendTo($filtersContainer);
                    this.children.count.render().appendTo($filtersContainer);
                    this.children.bulkAction.render().appendTo($selectedContainer);
                    this.children.collectionPaginator.render().appendTo($selectedContainer);

                    this.children.tableDock = new Dock({ el: this.el, affix: '.filters-container, .selected-container' });
                }
                
                return this;
            },

            template: '\
                <div class="filters-container"></div>\
                <div class="selected-container"></div>\
            '
        });
    }
);