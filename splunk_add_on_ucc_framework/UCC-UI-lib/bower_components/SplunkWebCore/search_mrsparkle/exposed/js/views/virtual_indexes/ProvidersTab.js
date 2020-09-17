define([
    'underscore',
    'module',
    'views/Base',
    'views/virtual_indexes/ProvidersGrid',
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
        ProvidersGrid,
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
                    model: this.collection.providers.fetchData
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
                    model: this.collection.providers.fetchData,
                    modelAttribute: 'count',
                    toggleClassName: 'btn-pill'
                });

                this.children.paginator = new Paginator({
                    collection: this.collection.providers
                });
                this.children.providersGrid = new ProvidersGrid({
                    collection: this.collection,
                    model: this.model,
                    showVixTab: this.options.showVixTab
                });

                // Prepare a flashmessage box for a possible delete error message
                this.collection.providers.on('deleteRequest', function(victimModel) {
                    if (this.children.flashMessages) {
                        this.children.flashMessages.remove();
                    }
                    this.children.flashMessages = new FlashMessagesView({ model: victimModel });
                    this.$el.prepend(this.children.flashMessages.render().el);
                }, this);

                this.collection.providers.on('change reset', function(){
                    if (this.collection.providers.length == 0) {
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
                if (this.children.providersGrid)
                    this.children.providersGrid.detach();

                var html = this.compiledTemplate({
                    exploreDataUrl:exploreDataUrl,
                    showVixTab: this.options.showVixTab
                });
                this.$el.html(html);
                this.children.filter.render().replaceAll(this.$('.filter-placeholder'));
                this.children.pageCount.render().replaceAll(this.$('.page-count-placeholder'));
                this.children.paginator.render().replaceAll(this.$('.paginator-placeholder'));
                this.children.providersGrid.replaceAll(this.$('.providersGrid-placeholder'));

                return this;
            },

            template: '\
                <div class="filter-placeholder"></div>\
                <div class="buttons-plaecholder pull-right">\
                    <a href="vix_provider_new" class="btn btn-primary "><%- _("New Provider").t()%></a>\
                    <% if (showVixTab) { %>\
                        <a href="<%= exploreDataUrl %>" class="btn btn-primary"><%- _("Explore Data").t()%></a>\
                    <% } %>\
                </div>\
                <div class="divider"></div>\
                <div class="page-count-placeholder"></div>\
                <div class="paginator-placeholder"></div>\
                <div class="providersGrid-placeholder"></div>\
            '
        });
    });
