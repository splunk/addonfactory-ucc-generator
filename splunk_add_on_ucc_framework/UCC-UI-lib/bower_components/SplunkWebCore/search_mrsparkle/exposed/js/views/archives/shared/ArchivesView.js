/**
 * @author jszeto
 * @date 3/18/15
 * Displays a table of Archives. Each row of the table contains links to perform operations on the given archive.
 * The user can expand the row to see more details about the archive
 *
 * INPUTS:
 *
 * model: {
 *     application {models/Application}
 * },
 * collection: {
 *     archives {collections/services/data/Archives} - set of filtered, sorted and paginated archives
 * }
 */
define([
        'underscore',
        'module',
        'views/Base',
        'views/shared/CollectionPaginator',
        'views/shared/FlashMessages',
        'views/shared/controls/TextControl',
        'views/shared/dataenrichment/preview/components/SelectPageCount',
        'views/shared/CollectionCount',
        './ArchivesGrid',
        'splunk.util',
        'uri/route',
        'contrib/text!views/archives/shared/ArchivesView.html'
    ],
    function(
        _,
        module,
        BaseView,
        CollectionPaginator,
        FlashMessages,
        TextControl,
        SelectPageCount,
        Count,
        ArchivesGrid,
        splunkUtil,
        route,
        template
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            className: 'archives-view',

            events: {
                ///////////////////////
                //  Object Actions
                ///////////////////////
                'click .new-archive-button': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger("createArchive");
                }
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.archivesGrid = new ArchivesGrid({model: {application: this.model.application,
                                                                       controller: this.model.controller},
                                                               collection: this.collection});

                this.children.flashMessages = new FlashMessages(
                    {model: {application: this.model.application,
                             user: this.model.user},
                     collection: {archives: this.collection.archives,
                                  apps: this.collection.apps}});

                this.children.textNameFilter = new TextControl({model: this.collection.archives.fetchData,
                    modelAttribute: "nameFilter",
                    inputClassName: 'search-query',
                    canClear: true,
                    placeholder: _("filter").t()});

                this.children.collectionPaginator = new CollectionPaginator({
                    collection: this.collection.archives,
                    model: this.collection.archives.fetchData
                });

                this.children.selectPageCount = new SelectPageCount({model:this.collection.archives.fetchData});

                this.children.collectionCount = new Count({collection:this.collection.archives, model: this.model.controller, countLabel:_("archives").t(), tagName: 'h3'});
            },

            render: function() {

                if (this.children.flashMessages)
                    this.children.flashMessages.detach();

                if (this.children.archivesGrid)
                    this.children.archivesGrid.detach();

                if (this.children.textNameFilter)
                    this.children.textNameFilter.detach();

                if (this.children.collectionPaginator)
                    this.children.collectionPaginator.detach();

                if (this.children.selectPageCount)
                    this.children.selectPageCount.detach();

                if (this.children.collectionCount)
                    this.children.collectionCount.detach();

                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.cloud.archives'
                );

                var html = this.compiledTemplate({
                    docUrl: docUrl,
                    splunkUtil: splunkUtil
                });

                this.$el.html(html);

                this.children.flashMessages.render().appendTo(this.$(".flash-messages"));
                this.children.archivesGrid.render().appendTo(this.$(".archives-grid"));
                this.children.textNameFilter.render().appendTo(this.$(".text-name-filter"));
                this.children.collectionPaginator.render().appendTo(this.$(".paginator-container"));
                this.children.selectPageCount.render().appendTo(this.$(".select-page-count"));
                this.children.collectionCount.render().appendTo(this.$(".collection-count"));
                return this;
            }
        });
    });
