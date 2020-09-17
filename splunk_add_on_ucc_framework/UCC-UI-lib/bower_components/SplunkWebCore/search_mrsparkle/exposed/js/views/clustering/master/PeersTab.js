define([
    'underscore',
    'module',
    'views/Base',
    'views/clustering/master/PeerGrid',
    'views/shared/CollectionPaginator',
    'views/clustering/master/components/Filter',
    'views/shared/controls/SyntheticSelectControl'
],
function(
    _,
    module,
    BaseView,
    PeersGrid,
    Paginator,
    Filter,
    SyntheticSelectControl
){
    return BaseView.extend({
        moduleId: module.id,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.children.filter = new Filter({
                model: this.collection.peers.fetchData,
                key: ['name', 'label', 'site']
            });

            // Select the number of results per page
            // SyntheticSelectControl.js is based on Control.js, which has setValue() and getValue() methods
            // that could help us set or get "x per page" property.
            // When setting the 'value', the 'value' is from 'data-value' attribute of the <a> tag in html
            // pageCount.model.set("count", nRowPerPage) also works, because 'count' is the 'real'
            // parameter which is encoded in url and sent to the server to decide 'x per page'.
            this.children.pageCount = new SyntheticSelectControl({
                menuWidth: "narrow",
                className: "btn-group",
                items: [
                    {value: 10, label: _('10 per page').t()},
                    {value: 20, label: _('20 per page').t()},
                    {value: 50, label: _('50 per page').t()},
                    {value: 100, label: _('100 per page').t()}
                ],
                model: this.collection.peers.fetchData,
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
            this.children.pageCount.listenToOnce(this.model.metadataModel, 'change:peersrow', function (metadataModel) {
                var nRowPerPage = parseInt(metadataModel.get('peersrow'), 10);
                if (nRowPerPage) {
                    this.setValue(nRowPerPage);
                }
            });
            // when user clicks on the dropdown list, the model of pageCount would be update, i.e., the '_value' and
            // the 'count' would be update. Here we use this listener to sync metadata with pageCount
            this.model.metadataModel.listenTo(this.children.pageCount, 'change', function (value) {
                // *this* refers to the model.metadataModel
                this.set({peersrow: value});
            });

            this.children.paginator = new Paginator({
                collection: this.collection.peers
            });
            this.children.peersGrid = new PeersGrid({
                // the collection is the date of all the rows, such as "label", "site", "bucket count"
                // the data would fit into the PeerGrid.html template
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
            this.$el.append(this.children.peersGrid.el);
            return this;
        },
        template: '\
            <div class="clearfix section-controls"></div>\
        '
    });
});
