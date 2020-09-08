/**
 * @author lbudchenko
 * @date 5/5/15
 *
 * Entry point for manager page
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/CollectionPaginator',
    'views/shared/dataenrichment/preview/components/SelectPageCount',
    'views/shared/CollectionCount',
    './SearchableDropdown/Master',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/controls/TextControl',
    'views/shared/breadcrumb/Master',
    './NewButtons',
    './BulkEditButton',
    './Grid',
    'contrib/text!./Master.html',
    'uri/route',
    'splunk.util'

],
    function(
        $,
        _,
        module,
        BaseView,
        CollectionPaginator,
        SelectPageCount,
        CollectionCount,
        SearchableDropdown,
        SyntheticSelectControl,
        TextControl,
        BreadcrumbView,
        NewButtons,
        BulkEditButton,
        Grid,
        template,
        route,
        splunkUtil
        ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                this.canUseApps = this.model.user.canUseApps();
                this.options.header = this.options.header || {};
                _(this.options.header).defaults({
                    pageTitle: this.options.entitiesPlural,
                    pageDesc: '',
                    breadcrumb: ''
                });
                this.options.grid = this.options.grid || {};
                _(this.options.grid).defaults({
                    showAppFilter: true,
                    showAllApps: false,
                    showOwnerFilter: true,
                    showSharingColumn: true,
                    sharingColumnSortKey: 'sharing',
                    showStatusColumn: true,
                    statusColumnSortKey: 'status'
                });

                this.pageTitle = this.options.header.pageTitle;
                this.pageDesc = this.options.header.pageDesc;

                this.showAppFilter = this.options.grid.showAppFilter;
                this.showAllApps = this.options.grid.showAllApps;
                this.showOwnerFilter = this.options.grid.showOwnerFilter;

                var _BulkEditButton = this.options.customViews.BulkEditButton || BulkEditButton;
                if (this.options.bulkedit.enable === true) {
                    this.children.bulkEditButton = new _BulkEditButton($.extend({}, this.options, {
                        model: this.model,
                        collection: this.collection
                    }));
                }

                var _Grid = this.options.customViews.Grid || Grid;
                this.children.grid = new _Grid($.extend({}, this.options, {
                    model: this.model,
                    collection: this.collection,
                    templates: this.options.templates
                }));

                this.children.textNameFilter = new TextControl({
                    model: this.model.metadata,
                    modelAttribute: "nameFilter",
                    inputClassName: 'search-query',
                    canClear: true,
                    placeholder: _("filter").t()
                });

                if (this.showAppFilter) {
                    this.children.selectAppFilter = new SyntheticSelectControl({
                        label: _('App').t() + ': ',
                        model: this.model.metadata,
                        modelAttribute: this.options.grid.appFilterModelAttribute || 'appSearch',
                        toggleClassName: 'btn-pill',
                        menuWidth: 'wide',
                        items: [],
                        popdownOptions: {
                            detachDialog: true
                        }
                    });
                    this.setAppItems();
                }

                if (this.showOwnerFilter) {
                    if (!this.collection.users || !this.collection.usersSearch) {
                        throw new Error('this.collection.users && this.collection.usersSearch collection needs to be passed in to display user filter');
                    } else {
                        var modelAttribute = this.options.grid.ownerFilterModelAttribute || 'ownerSearch';
                        this.children.selectOwnerFilter = new SearchableDropdown({
                            prompt: _('Filter by Owner').t(),
                            searchPrompt: _('Lookup an owner').t(),
                            multiSelect: false,
                            label: _('Owner').t()+': ',
                            model: this.model.metadata,
                            modelAttribute: modelAttribute,
                            staticOptions: [
                                {
                                    label: _('All').t(),
                                    value: ''
                                },
                                {
                                    label: _('Nobody').t(),
                                    value: 'nobody'
                                }
                            ],
                            collection: {search: this.collection.usersSearch, listing: this.collection.users},
                            toggleClassName: 'btn-pill'
                        });
                    }

                }
                this.children.collectionPaginator = new CollectionPaginator({
                    collection: this.collection.entities,
                    model: this.model.metadata
                });

                this.children.selectPageCount = new SelectPageCount({
                    model: this.model.metadata
                });

                this.children.collectionCount = new CollectionCount({
                    model: this.model.stateModel,
                    collection: this.collection.entities,
                    countLabel: this.options.entitiesPlural
                });

                if (this.options.customViews.Filters) {
                    this.children.filters = new this.options.customViews.Filters({
                        collection: this.collection,
                        model: this.model,
                        canUseApps: this.canUseApps
                    });
                }

                var _NewButtons = this.options.customViews.NewButtons || NewButtons;
                this.children.newButtons = new _NewButtons($.extend(true, this.options, {
                    collection: this.collection,
                    model: this.model,
                    entitySingular: this.options.entitySingular
                }));

                this.children.breadcrumb = new BreadcrumbView({
                    breadcrumb: this.options.header.breadcrumb,
                    model: {
                        application: this.model.application,
                        serverInfo: this.model.serverInfo
                    },
                    entitiesPlural: this.options.entitiesPlural
                });

                this.listenTo(this.model.metadata, "change:nameFilter", this.onNameFilterChanged);
            },

            setAppItems: function(){
                var staticAppItems = [{label:_('All').t(), value: ''}, {label:_('System default').t(), value: 'system'}];
                var collection = this.showAllApps ? this.collection.appLocalsUnfilteredAll :  this.collection.appLocals;
                var dynamicAppItems = collection.map(function(model, key, list){
                    return {
                        label: splunkUtil.sprintf(_('%s (%s)').t(), model.entry.content.get('label'), model.entry.get("name")),
                        value: model.entry.get('name')
                    };
                });
                this.children.selectAppFilter.setItems([staticAppItems, dynamicAppItems]);
            },

            onNameFilterChanged: function(model, value, options) {
                // If our search filter changes, then reset the offset to 0
                model.set("offset", 0);
            },

            render: function() {
                if (this.children.breadcrumb)
                    this.children.breadcrumb.detach();
                if (this.children.newButtons)
                    this.children.newButtons.detach();
                if (this.children.textNameFilter)
                    this.children.textNameFilter.detach();
                if (this.showAppFilter && this.children.selectAppFilter)
                    this.children.selectAppFilter.detach();
                if (this.showOwnerFilter && this.children.selectOwnerFilter) {
                    this.children.selectOwnerFilter.detach();
                }
                if (this.children.collectionCount)
                    this.children.collectionCount.detach();
                if (this.children.collectionPaginator)
                    this.children.collectionPaginator.detach();
                if (this.children.selectPageCount)
                    this.children.selectPageCount.detach();
                if (this.children.filters)
                    this.children.filters.detach();
                if (this.children.grid)
                    this.children.grid.detach();

                var docUrl = this.options.header.learnMoreLink ? route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    this.options.header.learnMoreLink) : undefined;

                var html = this.compiledTemplate({
                    docUrl: docUrl,
                    pageTitle: this.pageTitle,
                    pageDesc: this.pageDesc
                });
                this.$el.html(html);

                this.children.breadcrumb.render().appendTo(this.$(".breadcrumb-placeholder"));
                if(!this.options.hideNewButton) {
                    this.children.newButtons.render().appendTo(this.$(".buttons-wrapper"));
                }
                this.children.textNameFilter.render().appendTo(this.$(".text-name-filter-placeholder"));
                if (this.showAppFilter) {
                    this.children.selectAppFilter.render().appendTo(this.$(".app-filter-placeholder"));
                }
                if (this.showOwnerFilter) {
                    this.children.selectOwnerFilter.render().appendTo(this.$(".owner-filter-placeholder"));
                }
                if (this.children.bulkEditButton) {
                    this.children.bulkEditButton.render().appendTo(this.$(".bulk-edit-menu-placeholder"));
                }
                this.children.collectionCount.render().appendTo(this.$(".collection-count"));
                this.children.collectionPaginator.render().appendTo(this.$(".paginator-container"));
                this.children.selectPageCount.render().appendTo(this.$(".select-page-count"));
                if (this.children.filters) {
                    this.children.filters.render().appendTo(this.$(".custom-filter-placeholder"));
                }
                this.children.grid.render().appendTo(this.$(".grid-placeholder"));

                return this;
            }
        });
    });


