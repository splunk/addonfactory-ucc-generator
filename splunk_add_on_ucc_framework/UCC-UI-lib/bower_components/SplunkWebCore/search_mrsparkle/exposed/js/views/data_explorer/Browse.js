/**
 * @author jszeto
 * @date 5/23/14
 *
 * Allows the user to browse through a provider's file system. Displays breadcrumbs and directory contents.
 * Clicking on a subdirectory will display the contents of that subdirectory
 * Clicking on a file will display that file in the Data Preview page
 *
 * TODO [JCS]
 *  - filtering support
 *  - search support
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'collections/services/data/vix_indexes/DirectoryItems',
    'models/services/data/vix_indexes/DirectoryItem',
    'views/Base',
    'views/shared/FlashMessages',
    'views/shared/CollectionPaginator',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    './components/DirectoryItemsTable',
    './DirectoryBreadcrumb',
    'splunk.util',
    'uri/route'
],
    function (
        $,
        _,
        Backbone,
        module,
        DirectoryItems,
        DirectoryItem,
        BaseView,
        FlashMessagesView,
        CollectionPaginator,
        ControlGroup,
        SyntheticSelectControl,
        DirectoryItemsTable,
        DirectoryBreadcrumb,
        splunkUtil,
        route
        ) {

        return BaseView.extend({
            moduleId: module.id,
            className: 'section-padded',

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                // TODO [JCS] Need to add dropdown for root paths

                this.children.directoryItemsTable = new DirectoryItemsTable({collection: this.collection.directoryItems,
                                                                             model: {metadata: this.model.metadata}});
                this.children.directoryItemsTable.on("pathClicked", this.pathClickedHandler, this);
                this.children.directoryBreadcrumb = new DirectoryBreadcrumb({model:this.model.state,
                                                                             directoryModelAttribute: this.options.directoryModelAttribute,
                                                                             rootPathModelAttribute: this.options.rootPathModelAttribute,
                                                                             selectedSourceAttribute: this.options.fileModelAttribute});
                this.children.directoryBreadcrumb.on("pathClicked", this.pathClickedFromBreadcrumbHandler, this);

                this.children.selectRootPath = new SyntheticSelectControl({model:this.model.state,
                                                                            modelAttribute: this.options.rootPathModelAttribute,
                                                                            toggleClassName: 'btn'});

                this.children.selectRootPathGroup = new ControlGroup({controls:[this.children.selectRootPath], label: _("Select Directory").t()});

                this.children.collectionPaginator = new CollectionPaginator({
                    collection: this.collection.directoryItems,
                    model: this.model.metadata
                });

                this.children.flashMessagesView = new FlashMessagesView({collection: this.collection.directoryItems});

                this.listenTo(this.model.state, "change:" + this.options.rootPathsModelAttribute, this.updateSelectRootPath);

                this.updateSelectRootPath();
            },

            /**
             * Change directories when a breadcrumb is clicked
             * @param type
             * @param fullPath
             */
            pathClickedHandler: function(type, fullPath) {
                this.trigger("pathClicked", type, fullPath);
//                console.log("Path clicked",fullPath);
            },

            pathClickedFromBreadcrumbHandler: function(type, fullPath) {
                if (type == "dir")
                    this.children.directoryItemsTable.updateActiveRow(-1); // Clear the active row in case we clicked on a breadcrumb
                this.pathClickedHandler(type, fullPath);
            },

            updateSelectRootPath: function() {
                if (this.showSelectRootPaths()) {
                    var rootPaths = this.model.state.get(this.options.rootPathsModelAttribute);

                    var rootPathItems = _(rootPaths).map(function(rootPath) {
                        return {value: rootPath, label: rootPath};
                    }, this);

                    this.children.selectRootPath.setItems(rootPathItems);
                }
                this.debouncedRender();
            },

            showSelectRootPaths: function() {
                var rootPaths = this.model.state.get(this.options.rootPathsModelAttribute);
                return _(rootPaths).isArray() && rootPaths.length > 1;
            },

            render: function() {
                // Detach children
                if (this.children.selectRootPathGroup)
                    this.children.selectRootPathGroup.detach();

                if (this.children.directoryBreadcrumb)
                    this.children.directoryBreadcrumb.detach();

                if (this.children.directoryItemsTable)
                    this.children.directoryItemsTable.detach();

                if (this.children.collectionPaginator)
                    this.children.collectionPaginator.detach();

                var helpUrl = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.exploredata.browse');

                // Use template
                this.$el.html(this.compiledTemplate({helpUrl:helpUrl}));

                // Attach children and render them
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-placeholder"));

                if (this.showSelectRootPaths()) {
                    this.children.selectRootPathGroup.show();
                    this.children.selectRootPathGroup.render().appendTo(this.$(".select-root-path-placeholder"));
                } else {
                    this.children.selectRootPathGroup.hide();
                }

                this.children.directoryBreadcrumb.render().appendTo(this.$(".breadcrumb-placeholder"));
                this.children.directoryItemsTable.render().appendTo(this.$(".directory-items-table-placeholder"));
                this.children.collectionPaginator.render().appendTo(this.$('.collection-paginator-placeholder'));

                return this;
            },

            template: '\
            <div class="section-padded section-header">\
                <h2 class="section-title"><%- _("2. Select a File").t() %></h2>\
                <div class="main-container">\
                    <div class="label-instructions">\
                        <%- _("Click on a file or directory and drill down to the file you want to view and configure.").t() %>\
                        <a href="<%= helpUrl %>" target="_blank"> <%- _("Learn more.").t()%><i class="icon-external"></i></a>\
                    </div>\
                    <div class="flash-messages-placeholder"></div>\
                        <div class="pull-left">\
                            <div class="select-root-path-placeholder"></div>\
                            <div class="breadcrumb-placeholder"></div>\
                            <div class="post-breadcrumb-placeholder"></div>\
                        </div>\
                        <div class="pull-right collection-paginator-placeholder"></div>\
                    <div class="directory-items-table-wrapper">\
                    <div class="directory-items-table-placeholder"></div>\
                </div>\
            </div>\
            '
        });

    });

