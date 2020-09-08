/**
 * A wrapper around SyntheticSelect simplifying its usage with collections
 * Adds a search bar at the top and info message in the bottom
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/controls/SyntheticSelectControl',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        SyntheticSelectControl,
        splunkUtil
    ) {
        var MAX_COUNT = 30;
        
        /**
         * param Object options {
         *      model: <Backbone.Model>,
         *      collection: <Collection>,
         *      label: <String>,
         *      maxCount: <Int> - max number of items to fetch, 30 by default,
         *      convertCollectionToItems: <Callback> - function that reads collection and returns array of {label,value} objects
         *      attachToModal: <Boolean> - if true, attaches the popdown to the Modal instead of body
         * }
         */
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'collection-popdown',
            initialize: function() {
                this.maxCount = this.options.maxCount || MAX_COUNT;

                // models
                this.stateModel = new Backbone.Model();

                // flag to keep drop down open when entering a search
                this.alreadyShown = false;

                var popdownOptions = {
                    ignoreClasses: ['input-container',
                        'shared-tablecaption-input',
                        'search-query'],
                    ignoreEscape: true
                };
                if (this.options.attachToModal) {
                    popdownOptions.attachDialogTo = '.modal:visible';
                    popdownOptions.scrollContainer = '.modal:visible .modal-body:visible';
                }
                var opts = {
                    defaultValue: 'default',
                    toggleClassName: 'btn',
                    menuClassName: 'dropdown-menu-collection',
                    popdownOptions: popdownOptions,
                    maxLabelLength: 50,
                    stateModel: this.stateModel,
                    rawSearch: this.stateModel,
                    model: this.model,
                    modelAttribute: this.options.modelAttribute
                };

                _.defaults(this.options, opts);

                this.listenTo(this.collection, 'sync', function() { this.setItems(); });
                this.listenTo(this.stateModel, 'change:search', _.debounce(this.onChangeSearch, 250));

                SyntheticSelectControl.prototype.initialize.apply(this, arguments);
            },

            onChangeSearch: function() {
                this.alreadyShown = true;
                var search = this.stateModel.get('search') || '';
                var rawsearch = this.stateModel.get('rawSearch') || '';
                var data = {search: search, count: this.maxCount};
                if (this.options.getData) {
                    data = this.options.getData.call(this, rawsearch, this.maxCount);
                }
                this.collection.safeFetch({
                    data: data,
                    success: function () {
                        this.setItems();
                    }.bind(this),
                    error: this.handleFetchFailures
                });
            },

            handleFetchFailures: function () {
                SyntheticSelectControl.prototype.setItems.call(this, []);
            },
            
            setItems: function(items) {
                SyntheticSelectControl.prototype.setItems.call(this, this.buildItems(items), {alreadyShown: this.alreadyShown});
            },

            /**
             * Prepares array of objects for SyntheticSelect
             * @param _items If present, process it, otherwise read from collection
             * @returns {*} array
             */
            buildItems: function(_items){
                var items = [];
                if (_items) {
                    items = _items;
                } else {
                    items = this.options.convertCollectionToItems ? this.options.convertCollectionToItems(this.collection ) : this.convertCollectionToItems(this.collection);
                }

                if (items.length === 0) {
                    items.push({label: _('No Results').t()});
                }
                return items;
            },

            /**
             * Callback that converts collection to array of item objects
             * @param collection
             * @returns {Array}
             */
            convertCollectionToItems: function(collection) {
                var items = [];
                collection.each(function(model){
                    var name = model.entry.get('name');
                    // item must have a name value to be considered
                    if (!name) {
                        return;
                    }
                    items.push({
                        value: name
                    });
                });
                return items;
            },

            render: function() {
                SyntheticSelectControl.prototype.render.apply(this, arguments);
                var total = this.collection.paging ? this.collection.paging.get('total') : 0;
                var perPage = this.collection.paging ? this.collection.paging.get('perPage') : this.maxCount;
                if (total > perPage) {
                    var html = _.template(this.footerTemplate, {
                        splunkUtil: splunkUtil,
                        cnt: perPage,
                        total: total
                    });
                    $('.dropdown-menu-collection .dropdown-footer').html(html);
                }
            },

            footerTemplate: '\
            <div class="footer-counter"><%- splunkUtil.sprintf(_("%s out of %s results shown").t(), cnt, total) %></div>'
        });
    }
);