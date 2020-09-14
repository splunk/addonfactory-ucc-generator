define([
    'underscore',
    'module',
    'views/Base',
    'views/clustering/master/IndexesGrid',
    'views/shared/CollectionPaginator',
    'views/clustering/master/components/Filter',
    'views/shared/controls/SyntheticSelectControl'
],
function(
    _,
    module,
    BaseView,
    IndexesGrid,
    Paginator,
    Filter,
    SyntheticSelectControl
){
    return BaseView.extend({
        moduleId: module.id,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.children.filter = new Filter({
                model: this.collection.masterIndexes.fetchData
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
                model: this.collection.masterIndexes.fetchData,
                modelAttribute: 'count',
                toggleClassName: 'btn-pill'
            });
            // update 'x per page' based on the parameter from URL.
            // Here we need to convert it to int, because later we need to use this value
            // in the findItem() when re-render the "x per page" module in the
            // views/shared/controls/SyntheticSelectControl.js, to make sure the default option is correctly updated.
            // Here we want to initialize the 'x per page' based on the parameter from url.
            // The reason we use 'listenToOnce' is that, the metadataModel is updated after we instantiated this view,
            // (line 94 in MasterNode.js)
            this.children.pageCount.listenToOnce(this.model.metadataModel, 'change:indexesrow', function (metadataModel) {
                var nRowPerPage = parseInt(metadataModel.get('indexesrow'), 10);
                if (nRowPerPage) {
                    this.setValue(nRowPerPage);
                }
            });
            // when user clicks on the dropdown list, the model of pageCount would be update, i.e., the '_value' and
            // the 'count' would be update. Here we use this listener to sync metadata with pageCount
            this.model.metadataModel.listenTo(this.children.pageCount, 'change', function (value) {
                // *this* refers to the model.metadataModel
                this.set({indexesrow: value});
            });

            this.children.paginator = new Paginator({
                collection: this.collection.masterIndexes
            });

            this.children.indexesGrid = new IndexesGrid({
                collection: this.collection,
                model: this.model
            });

            this.render();
        },
        render: function(){
            var html = this.compiledTemplate();
            this.$el.html(html);
            this.$el.find('.section-controls').append(this.children.filter.render().el);
            this.$el.find('.section-controls').append(this.children.pageCount.render().el);
            this.$el.find('.section-controls').append(this.children.paginator.render().el);
            this.$el.append(this.children.indexesGrid.el);
            return this;
        },
        template: '\
            <div class="clearfix section-controls">\
                <a class="btn bucket-details" href="./clustering_bucket_details"><%= _("Bucket Status").t() %></a>\
            </div>\
        '
    });
});
