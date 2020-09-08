define([
    'jquery',
    'underscore',
    'module',
    './DeleteAllDialog',
    'models/services/data/vix/IndexActions',
    'views/Base',
    'views/virtual_indexes/ArchiveGrid',
    'views/shared/CollectionPaginator',
    'views/shared/DropDownMenu',
    'views/shared/FindInput',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/controls/BooleanRadioControl',
    'views/shared/FlashMessages',
    'uri/route'

],
    function(
        $,
        _,
        module,
        DeleteAllDialog,
        IndexActions,
        BaseView,
        ArchiveGrid,
        Paginator,
        DropDownMenu,
        Filter,
        ControlGroup,
        SyntheticSelectControl,
        BooleanRadioControl,
        FlashMessagesView,
        route
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'section-padded',
            initialize: function(options){
                BaseView.prototype.initialize.call(this, options);

                this.selectedArchives = {};
                this.isAnyArchiveSelected = false;

                // TODO [JCS] Move pull-left into css instead of being inline
                this.children.filter = new Filter({
                    model: this.collection.archives.fetchData,
                    key: ['name', 'vix.provider']
                });
                // Select the number of results per page
                this.children.pageCount = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group",
                    items: [
                        {value: 10, label: _('10 per page').t()},
                        {value: 20, label: _('20 per page').t()},
                        {value: 50, label: _('50 per page').t()},
                        {value: 100, label: _('100 per page').t()}
                    ],
                    model: this.collection.archives.fetchData,
                    modelAttribute: 'count',
                    toggleClassName: 'btn-pill'
                });

                this.unifiedSearchControl = new BooleanRadioControl({
                    trueLabel: _('On').t(),
                    falseLabel: _('Off').t(),
                    model: this.model.limits.entry.content,
                    modelAttribute: 'unified_search'
                });
                this.children.unifiedSearch = new ControlGroup({
                    controls: [this.unifiedSearchControl],
                    label: _("Unified Search:").t()
                });
                this.unifiedSearchControl.on('change', function(){
                    this.model.limits.save();
                }.bind(this));

                this.children.paginator = new Paginator({
                    collection: this.collection.archives
                });
                this.children.archiveGrid = new ArchiveGrid({
                    collection: this.collection,
                    model: this.model
                });
                this.listenTo(this.children.archiveGrid, "selectedChange",this.onSelectedChange);

                // TODO [JCS] Move pull-left into css instead of being inline
                this.children.bulkEditButton = new DropDownMenu({
                    className: 'pull-left',
                    label:_("Bulk Actions").t(),
                    items: this.getBulkEditItems(),
                    dropdownClassName: 'dropdown-menu-narrow'});

                this.children.bulkEditButton.on("itemClicked", this.bulkEditButtonClickHandler, this);

                // Prepare a flashmessage box for a possible delete error message
                this.collection.archives.on('deleteRequest', function(victimModel) {
                    if (this.children.flashMessages) {
                        this.children.flashMessages.remove();
                    }
                    this.children.flashMessages = new FlashMessagesView({ model: victimModel });
                    this.$el.prepend(this.children.flashMessages.render().el);
                }, this);

                this.collection.archives.on('filterRequest', function(search) {
                    this.children.filter.$input.val(search);
                    this.children.filter.set(search);
                }, this);

                this.collection.archives.on('change reset', function(){
                    if (this.collection.archives.length == 0) {
                        this.children.filter.isEmpty() ? this.children.filter.$el.hide() : '';
                        this.children.paginator.$el.hide();
                        this.children.pageCount.$el.hide();
                        this.children.bulkEditButton.$el.hide();
                        this.$('.divider').hide();
                    } else {
                        // Use css("display,"") instead of show(). This might have been the cause of ERP-1314
                        this.children.filter.$el.css("display","");
                        this.children.paginator.$el.css("display","");
                        this.children.pageCount.$el.css("display","");
                        this.children.bulkEditButton.$el.css("display","");
                        this.$('.divider').css("display","");
                    }
                    // Clear the selectedArchives since selection doesn't persist
                    //console.log("archives change or reset");
                    this.selectedArchives = {};
                    this.updateBulkEditItems();
                }, this);

                this.collection.providers.on('change reset', function(){
                    if (this.collection.providers.length == 0) {
                        this.$('.buttons-placeholder').hide();
                    } else {
                        this.$('.buttons-placeholder').show();
                    }
                }, this);

            },

            onSelectedChange: function(archiveID, selected) {
                //console.log("ArchiveTab.onSelectedChange",archiveID,"selected",selected);
                if (selected) {
                    this.selectedArchives[archiveID] = true;
                } else {
                    delete this.selectedArchives[archiveID];
                }

                this.updateBulkEditItems();
            },

            updateBulkEditItems: function() {

                var anySelected = _(this.selectedArchives).size() > 0;

                if (anySelected != this.isAnyArchiveSelected) {
                    this.children.bulkEditButton.setItems(this.getBulkEditItems());
                }

                this.isAnyArchiveSelected = anySelected;
            },


            bulkEditButtonClickHandler: function(item) {
                // Handle bulk edit menu
                switch (item) {
                    case "enable":
                        this.bulkEdit(true);
                        break;
                    case "disable":
                        this.bulkEdit(false);
                        break;
                    case "delete":{
                        this.children.deleteAllDialog = new DeleteAllDialog();
                        this.listenTo(this.children.deleteAllDialog,"deleteConfirmed",this.onDeleteConfirmed);
                        $("body").append(this.children.deleteAllDialog.render().el);
                        this.children.deleteAllDialog.show();
                        break;
                    }
                    case 'search':
                        this.bulkSearch();
                        break;
                }
            },

            getBulkEditItems: function() {
                var enabled = _(this.selectedArchives).size() > 0;

                return [
                    {label:_("Enable").t(), value:"enable", enabled:enabled},
                    {label:_("Disable").t(), value:"disable", enabled:enabled},
                    {label:_("Delete").t(), value:"delete", enabled:enabled},
                    {label:_('Search').t(), value:'search', enabled:enabled}
                ];

            },


            /**
             * Edit all of the selectedFields
             *
             * @param propertyName {string} The name of the property to edit
             * @param value {object} The value of the property
             */
            bulkEdit: function(enable) {

                var saveDeferred = $.Deferred();
                var archiveCount = _(this.selectedArchives).size();

                //console.log("ArchiveTab.bulkEdit enable",enable,"count",archiveCount);
                _(this.selectedArchives).each(function(value, selectedArchive) {

                    var archiveModel = this.collection.archives.get(selectedArchive);
                    var links = archiveModel.entry.links;
                    var actionURL = links.get(enable ? 'enable' : 'disable');

                    //console.log("ArchiveTab.bulkEdit enable/disable archive",selectedArchive,"actionURL",actionURL);
                    if (actionURL) {
                        this.indexActions = new IndexActions();
                        this.indexActions.set('id',actionURL);
                        this.indexActions.save().then(_(function () {
                            //console.log("saved archive count",archiveCount);
                            archiveCount--;
                            if (archiveCount == 0)
                                saveDeferred.resolve();
                        }).bind(this));
                    } else {
                        archiveCount--;
                    }

                    $.when (saveDeferred).done(_(function() {
                        //console.log("saveDeferred done");
                        this.collection.archives.safeFetch();
                    }).bind(this));

                }, this);

            },

            onDeleteConfirmed: function() {
                var deleteDeferred = $.Deferred();

                var archiveCount = _(this.selectedArchives).size();

                _(this.selectedArchives).each(function(value, selectedArchive) {
                    //console.log("ArchiveTab.onDeleteConfirmed",selectedArchive);
                    var archiveModel = this.collection.archives.get(selectedArchive);
                    archiveModel.destroy().then(_(function() {
                        //console.log("deleted archive count",archiveCount);
                        archiveCount--;
                        if (archiveCount == 0)
                            deleteDeferred.resolve();
                    }).bind(this));
                }, this);

                $.when (deleteDeferred).done(_(function() {
                    //console.log("deleteDeferred done");
                    this.collection.archives.safeFetch();
                }).bind(this));
            },

            bulkSearch: function() {
                var query = _.map(this.selectedArchives, function(val, selectedArchive) {
                    var archiveModel = this.collection.archives.get(selectedArchive);
                    return 'index=' + archiveModel.entry.get('name');
                }, this).join(' OR ');
                
                var url = route.search(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'search',
                    {
                        data: {
                            q: query
                        }
                    }
                );
                window.open(url,'_blank');
            },

            render: function() {
                if (this.children.filter)
                    this.children.filter.detach();
                if (this.children.pageCount)
                    this.children.pageCount.detach();
                if (this.children.paginator)
                    this.children.paginator.detach();
                if (this.children.archiveGrid)
                    this.children.archiveGrid.detach();
                if (this.children.bulkEditButton)
                    this.children.bulkEditButton.detach();

                // TODO [JCS] Add this route to route.js in Ember?
                var dashboardURL = route.page(this.model.application.get("root"),
                                              this.model.application.get("locale"),
                                              "search",
                                              "splunk_archiver_dashboard");
                var html = this.compiledTemplate({dashboardURL:dashboardURL});
                this.$el.html(html);
                this.children.filter.render().replaceAll(this.$('.filter-placeholder'));
                this.children.bulkEditButton.render().replaceAll(this.$('.bulk-edit-button-placeholder'));
                this.children.pageCount.render().replaceAll(this.$('.page-count-placeholder'));
                this.children.paginator.render().replaceAll(this.$('.paginator-placeholder'));
                this.children.archiveGrid.replaceAll(this.$('.archiveGrid-placeholder'));
                this.children.unifiedSearch.render().appendTo(this.$('.unified-search-placeholder'));
                return this;
            },
            template: '\
                <div class="filter-placeholder"></div>\
                <div class="buttons-placeholder pull-right">\
                    <span class="unified-search-placeholder form-horizontal"></span>\
                    <a href="<%- dashboardURL %>" class="btn btn-primary "><%- _("View Dashboards").t()%></a>\
                    <a href="archive_new" class="btn btn-primary "><%- _("New Archived Index").t()%></a>\
                </div>\
                <div class="divider"></div>\
                <div class="bulk-edit-button-placeholder"></div>\
                <div class="page-count-placeholder"></div>\
                <div class="paginator-placeholder"></div>\
                <div class="archiveGrid-placeholder"></div>\
            '
        });
    });
