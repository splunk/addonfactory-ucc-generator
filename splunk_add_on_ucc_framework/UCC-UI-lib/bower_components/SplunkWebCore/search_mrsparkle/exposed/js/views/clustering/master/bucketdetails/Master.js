/**
 * Created by ykou on 5/14/14.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/classicurl',
    'views/Base',
    'views/clustering/master/bucketdetails/FixupBuckets',
    'views/clustering/master/bucketdetails/ExcessBuckets',
    'views/clustering/master/bucketdetails/AllBuckets',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/tabcontrols/TabbedViewStack',
    'uri/route',
    'contrib/text!views/clustering/master/bucketdetails/Master.html',
    './Master.pcss'
],
function(
    $,
    _,
    Backbone,
    module,
    classicurl,
    BaseView,
    FixupBucketsTab,
    ExcessBucketsTab,
    AllBucketsTab,
    SyntheticSelectControl,
    TabbedViewStack,
    route,
    Template,
    css
    ){
    var MAPPING_TABNAME_TABINDEX = {
        'all-buckets-tab': 0,
        'fixup-buckets-tab': 1,
        'excess-buckets-tab': 2
    };

    return BaseView.extend({
        moduleId: module.id,
        template: Template,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            // this mediator is used to store index name and current tab
            this.bucketDetailsMediator = new Backbone.Model();
            // in order to get an array of index names, we need to wait until the collection has been fetched.
            this.indexCollectionDfd = $.Deferred();

            this.children.fixupTab = new FixupBucketsTab({
                label: _('Fixup Tasks - Pending (0)').t(),
                tabClassName: 'fixup-buckets-tab',
                classicurlDfd: this.options.classicurlDfd,
                collection: {
                    fixupSearchFactorCollection: this.collection.fixupSearchFactorCollection,
                    fixupReplicationFactorCollection: this.collection.fixupReplicationFactorCollection,
                    fixupGenerationCollection: this.collection.fixupGenerationCollection
                }
            });
            this.children.excessTab = new ExcessBucketsTab({
                label: _('Indexes With Excess Buckets (0)').t(),
                tabClassName: 'excess-buckets-tab',
                collection: this.collection.indexCollection
            });
            this.children.allbucketsTab = new AllBucketsTab({
                label: _('Fixup Tasks - In Progress (0)').t(),
                tabClassName: 'all-buckets-tab',
                collection: this.collection.bucketCollection
            });

            this.tabbedViewStack = new TabbedViewStack({
                panes: [
                    this.children.allbucketsTab,
                    this.children.fixupTab,
                    this.children.excessTab
                ],
                selectedIndex: 0
            });

            // change tab
            $.when(this.options.tabDfd, this.options.classicurlDfd).done(function() {
                var tabName = this.bucketDetailsMediator.get('tab');
                if (tabName) {
                    this.tabbedViewStack.setTabSelectedIndex(MAPPING_TABNAME_TABINDEX[tabName]);
//                    this.tabbedViewStack.children.tabBar.setSelectedIndex(MAPPING_TABNAME_TABINDEX[tabName]);
                }
            }.bind(this));

            // since we use classicurl to control the index dropdown, we need to save url when user choose a dropdown option.
            // fetch() will also cause a 'change' event, which means save() is alawys called when fetch() is called.
            // But in our case it is OK, because save() won't cause a 'change' event (no new attributes appear when calling save()).
            this.listenTo(this.tabbedViewStack.children.tabBar, "tabClick", this.updateMediatorTab);
            this.listenTo(this.bucketDetailsMediator, 'change', this._mediatorChangeHandler);

            this.listenTo(this.collection.indexCollectionForMainDropdown, 'change reset', this._renderIndexDropdown);
        },

        events: {
            'click .fixup-buckets-tab': 'updateMediatorTabFixup',
            'click .excess-buckets-tab': 'updateMediatorTabExcess',
            'click .all-buckets-tab': 'updateMediatorTabAllBuckets'
        },

        updateMediatorTabFixup: function() {
            this.bucketDetailsMediator.set('tab', 'fixup-buckets-tab');
        },

        updateMediatorTabExcess: function() {
            this.bucketDetailsMediator.set('tab', 'excess-buckets-tab');
        },

        updateMediatorTabAllBuckets: function() {
            this.bucketDetailsMediator.set('tab', 'all-buckets-tab');
        },

        _renderIndexDropdown: function() {
            var dropdownItems = [{label: 'all', value: '*'}].concat(this.collection.indexCollectionForMainDropdown.map(function(model) {
                var label = model.entry.get('name');
                var value = label;
                return {label: label, value: value};
            }));

            this.children.indexDropdown = new SyntheticSelectControl({
                toggleClassName: 'btn-group btn-pill',
                menuWidth: 'narrow',
                model: this.bucketDetailsMediator,
                modelAttribute: 'index',
                items: dropdownItems
            });

            this.indexCollectionDfd.resolve();
        },

        _mediatorChangeHandler: function(model) {
            this.updateClassicUrlFromParams();

            // /indexes endpoint: use fetchData.search to filter by index name
            var indexCollectionSearch = this.collection.indexCollection.fetchData.get('search');
            var indexSearch = model.get('index') || '*';
            indexCollectionSearch = indexCollectionSearch ? indexCollectionSearch.replace(/name=[^\s]*/, 'name=' + indexSearch) : 'name=' + indexSearch;
            this.collection.indexCollection.fetchData.set({
                'search': indexCollectionSearch,
                'offset': 0 // needs to reset offset in case that user has paginated to other pages. SPL-90922
            });

            var index = model.get('index');
            // /buckets endpoint: use filter=index=indexName to filter
            // /fixup endpoint: supports index parameter, which is easier to handle
            if (index) {
                // NOTE: here we must CLONE the filter object, otherwise changing filter.index won't trigger 'change'
                // event on the fetchData model, thus the bucketCollection won't fetch!
                var bucketFilter = _.clone(this.collection.bucketCollection.fetchData.get('filter'));
                if (index == '*') {
                    delete bucketFilter.index;
                    // also update the count collections
                    this.collection.fixupReplicationFactorCollection.fetchData.unset('index');
                    this.collection.fixupSearchFactorCollection.fetchData.unset('index');
                    this.collection.fixupGenerationCollection.fetchData.unset('index');
                }
                else {
                    bucketFilter.index = index;
                    // also update the count collections
                    this.collection.fixupReplicationFactorCollection.fetchData.set('index', index);
                    this.collection.fixupSearchFactorCollection.fetchData.set('index', index);
                    this.collection.fixupGenerationCollection.fetchData.set('index', index);
                }
                this.collection.bucketCollection.fetchData.set('filter', bucketFilter);
            }
        },

        /**
         * Copy metadataModel attributes to the classicUrl model
         */
        updateClassicUrlFromParams: function() {
            _.debounce(function() {
                classicurl.save(this.bucketDetailsMediator.attributes);
            }.bind(this), 0)();
        },

        /**
         * Copy classicUrl attributes to the metadataModel model
         */
        updateParamsFromClassicUrl: function() {
            var attrs = _(classicurl.attributes).defaults(this.bucketDetailsMediator.attributes);
            this.bucketDetailsMediator.set(attrs);
        },

        render: function() {
            // TODO: update doc link
            var root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                learnMoreLink = route.docHelp(root, locale, 'learnmore.clustering.bucketDetails');

            this.$el.html(this.compiledTemplate({
                learnMoreLink: learnMoreLink,
                countFixingBuckets: 0,
                countFixup: 0,
                countIndex: 0
            }));

            this.tabbedViewStack.render().$el.appendTo(this.$el.find('.bucket-details-tabbed-view-stack'));

            this.children.allbucketsTab.updateTabCount(this.tabbedViewStack.$el);
            this.children.fixupTab.updateTabCount(this.tabbedViewStack.$el);
            this.children.excessTab.updateTabCount(this.tabbedViewStack.$el);

            // render dropdown only when indexCollection is ready
            $.when(this.indexCollectionDfd).done(function() {
                this.$el.find('.index-dropdown').append(this.children.indexDropdown.render().$el);
            }.bind(this));

            return this;
        }
    });
});
