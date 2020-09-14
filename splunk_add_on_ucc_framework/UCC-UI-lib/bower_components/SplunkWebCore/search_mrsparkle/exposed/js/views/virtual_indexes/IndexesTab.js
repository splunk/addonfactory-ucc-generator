define([
    'underscore',
    'module',
    'views/Base',
    'views/virtual_indexes/IndexesGrid',
    'views/shared/CollectionPaginator',
    'views/shared/FindInput',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/FlashMessages',
    'uri/route'

],
    function(
        _,
        module,
        BaseView,
        IndexesGrid,
        Paginator,
        Filter,
        SyntheticSelectControl,
        FlashMessagesView,
        route
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'section-padded',
            initialize: function(options){
                BaseView.prototype.initialize.call(this, options);

                this.children.filter = new Filter({
                    model: this.collection.indexes.fetchData,
                    key: ['name', 'vix.provider']
                });
                // Select the number of results per page
                this.children.pageCount = new SyntheticSelectControl({
                    menuWidth: "narrow",
                    className: "btn-group pull-left",
                    items: [
                        {value: 10, label: _('10 per page').t()},
                        {value: 20, label: _('20 per page').t()},
                        {value: 50, label: _('50 per page').t()},
                        {value: 100, label: _('100 per page').t()}
                    ],
                    model: this.collection.indexes.fetchData,
                    modelAttribute: 'count',
                    toggleClassName: 'btn-pill'
                });

                this.children.paginator = new Paginator({
                    collection: this.collection.indexes
                });
                this.children.indexesGrid = new IndexesGrid({
                    collection: this.collection,
                    model: this.model
                });

                // Prepare a flashmessage box for a possible delete error message
                this.collection.indexes.on('deleteRequest', function(victimModel) {
                    if (this.children.flashMessages) {
                        this.children.flashMessages.remove();
                    }
                    this.children.flashMessages = new FlashMessagesView({ model: victimModel });
                    this.$el.prepend(this.children.flashMessages.render().el);
                }, this);

                this.collection.indexes.on('filterRequest', function(search) {
                    this.children.filter.$input.val(search);
                }, this);

                this.collection.indexes.on('change reset', function(){
                    if (this.collection.indexes.length == 0) {
                        this.children.filter.isEmpty() ? this.children.filter.$el.hide() : '';
                        this.children.paginator.$el.hide();
                        this.children.pageCount.$el.hide();
                        this.$('.divider').hide();
                    } else {
                        this.children.filter.$el.show();
                        this.children.paginator.$el.show();
                        this.children.pageCount.$el.show();
                        this.$('.divider').show();
                    }
                }, this);

                this.collection.providers.on('change reset', function(){
                    if (this.collection.providers.length == 0) {
                        this.$('a[href=vix_index_new]').hide();
                    } else {
                        this.$('a[href=vix_index_new]').show();
                    }
                }, this);

            },
            render: function() {
                var exploreDataUrl = route.exploreData(
                    this.model.application.get('root'),
                    this.model.application.get('locale'));

                if (this.children.filter)
                    this.children.filter.detach();
                if (this.children.pageCount)
                    this.children.pageCount.detach();
                if (this.children.paginator)
                    this.children.paginator.detach();
                if (this.children.indexesGrid)
                    this.children.indexesGrid.detach();

                var html = this.compiledTemplate({exploreDataUrl:exploreDataUrl});
                this.$el.html(html);
                this.children.filter.render().replaceAll(this.$('.filter-placeholder'));
                this.children.pageCount.render().replaceAll(this.$('.page-count-placeholder'));
                this.children.paginator.render().replaceAll(this.$('.paginator-placeholder'));
                this.children.indexesGrid.replaceAll(this.$('.indexesGrid-placeholder'));
                return this;
            },
            template: '\
                <div class="filter-placeholder"></div>\
                <div class="buttons-plaecholder pull-right">\
                    <a href="vix_index_new" class="btn btn-primary "><%- _("New Virtual Index").t()%></a>\
                    <a href="<%= exploreDataUrl %>" class="btn btn-primary"><%- _("Explore Data").t()%></a>\
                </div>\
                <div class="divider"></div>\
                <div class="page-count-placeholder"></div>\
                <div class="paginator-placeholder"></div>\
                <div class="indexesGrid-placeholder"></div>\
            '
        });
    });
