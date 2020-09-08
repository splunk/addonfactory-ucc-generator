define([
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'collections/Base',
    'views/Base',
    'views/shared/SearchResultsPaginator',
    'views/shared/CollectionPaginator',
    'views/table/commandeditor/listpicker/AddItem',
    'module',
    './Master.pcss',
    'bootstrap.tooltip',
    'splunk.util',
    'util/dataset_utils'
],
function(
    $,
    _,
    Backbone,
    BaseModel,
    BaseCollection,
    BaseView,
    SearchResultsPaginator,
    CollectionPaginator,
    AddItemView,
    module,
    css,
    tooltip,
    splunkUtils,
    datasetUtils
) {
    /**
     * List Picker
     *
     * Displays a list of items. This items list can come from the following sources, and will be layered together.
     *   1.) options.items: An items array. If not using a paginator, these items will be included in the list always.
     *           Otherwise, they will be DISCARDED.
     *   2.) One (and only one) of the following groups of models/collections:
     *      2a.) collection.items: A SplunkD Collection which defines a getFieldPickerItems method that returns an items array.
     *           model.state: A State Model that keeps Pagination state
     *           A SplunkDCollection Paginator will be rendered.
     *      2b.) model.results: A Search Results Model. The associated .results Model on this Model defines a
     *               getFieldPickerItems method that returns an items array.
     *           model.searchJob: A Search Job Model that writes to the Search Results Model.
     *           model.state: A State Model that keeps Pagination state.
     *           A SearchResults Paginator will be rendered.
     *      2c.) model.fieldsSummary: A FieldsSummary Model. The associated .fields Model on this Model defines a
     *               getFieldPickerItems method that returns an items array.
     *           No Paginator will be rendered, as fields from the summary endpoint cannot be paginated.
     *   3.) model.ast: An AST that defines a getFieldPickerItems method that returns an items array.
     *
     *   For example, you can define options.items, model.fieldsSummary, and model.ast, and all three will show in the
     *   same list. However, defining options.items with collection.items would be impossible because the latter
     *   uses a Paginator.
     *
     *   Example of items array:
     *   var items = [
     *           {value: "item1", label: "Menu item with desc"},
     *           {value: "item2", label: "Menu item"},
     *           {value: "item5", label: "Another menu item"},
     *           {value: "item6"}
     *           {value: "item7", label: "More action"},
     *           {value: "item8", label: "Yet another action"}
     *   ];
     *
     * @param {Collection} (Optional) items A SplunkD Collection that is passed into a SplunkDCollection Paginator.
     *      It must define its own getFieldPickerItems() method that returns an items array.
     * @param {Model} (Optional) state A State Model that is passed into any Paginator to keep count and offset state.
     * @param {Model} (Optional) searchJob A SearchJob Model that is passed into a Search Results Paginator to update search job with the latest offset.
     * @param {Model} (Optional) results A Results Model that is passed into a Search Results Paginator to read latest search results
     * @param {Model} (Optional) fieldsSummary A FieldsSummary Model that defines fields found from a summary job.
     * @param {Object} options
     *     {Array} (Optional) items An array of objects where:
     *            {String} label (textual display - if none specified, will default to value),
     *            {Any} value (value to store in model - if none specified, element is considered a menu header instead of menu item)
     *     {Array} selectedValues As an array of strings (Optional) where each string is an item value.
     *     {Boolean} required (Optional) Whether the user must select an item. This primarily has an affect when it is placed in an overlay.
     *     {Boolean} multiselect (Optional) Allow the user to select more than one item.
     *     {Boolean} sort (Optional) Sort all the items in the list, except the static items.
     *     {String} selectMessage (Optional) The text at the top of the list when multiselect is enabled.
     *     {String} multiselectMessage (Optional) The text at the top of the list when multiselect is enabled.
     *     {String} additionalClassNames (Optional) Class attribute(s) to add to this.$el
     *     {String} selectedIcon (Optional) the icon shown beside selected items, also shown as the icon for select/deselect all. Likely 'check' or 'x'.
     *     {Object} deferred (Optional) A deferred or an array of deferreds.
     *         A 'loading...' message is displayed until all deferreds resolve, at which point the message is replaced with the list view.
     *     {String} fieldAttribute (Optional) A field attribute that you can pass into getFieldPickerItems() to specify a particular Model attribute to read.
     *     {Array} staticItems (Optional) An array of objects that each contains a {String} value and a {String} label to be added to the top of the list as items.
     *     {String} paginatorType (Optional) Either 'splunkDCollection' or 'searchResults'. Specifies type of paginator to display.
     */

    var SPLUNKD_COLLECTION = 'splunkDCollection',
        SEARCH_RESULTS = 'searchResults';

    return BaseView.extend({
        className: 'list-picker',
        moduleId: module.id,

        initialize: function(options) {
            var defaults = {
                selectedValues: [],
                required: true,
                multiselect: false,
                selectMessage: _('Select a value...').t(),
                multiselectMessage: _('Select values...').t(),
                selectedIcon: 'check',
                size: 'default',
                includeAddItem: false
            };
            _.defaults(this.options, defaults);

            this.selectedValues = this.options.selectedValues || [];
            this.saveSelectedValues();

            this.staticItems = this.options.staticItems;
            _.each(this.staticItems, function(item) {
                item.isStatic = true;
            }, this);

            this._filterListDebounced = _.debounce(this._filterList, 200);

            if (this._useSplunkDCollectionPaginator(this.options.paginatorType)) {
                this.children.paginatorView = new CollectionPaginator({
                    collection: this.collection.items,
                    model: this.model.state,
                    pageListMode: 'compact'
                });
                this.itemsCollection = this.collection.items;
            } else if (this._useSearchResultsPaginator(this.options.paginatorType)) {
                this.children.paginatorView = new SearchResultsPaginator({
                    mode: "results_preview",
                    model: {
                        state: this.model.state,
                        searchJob: this.model.searchJob,
                        results: this.model.results
                    },
                    pageListMode: 'compact'
                });

                this.itemsCollection = this.model.results.results;
                
            // Results from the summary endpoint or fields from the results can't be paginated
            } else if (this.model && this.model.ast) {
                if (!this.model.ast.isTransforming() && this.model.fieldsSummary) {
                    this.itemsCollection = this.model.fieldsSummary.fields;
                }
            }

            if (this.options.includeAddItem) {
                if (!this.collection.customAddedFieldPickerItems) {
                    this.collection.customAddedFieldPickerItems = new BaseCollection();
                }

                this.children.addItem = new AddItemView({
                    model: {
                        state: this.model.state
                    },
                    collection: {
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    }
                });
            }
            
            this._updateItems();

            BaseView.prototype.initialize.apply(this, arguments);
        },

        events: {
            'click .list-picker-list:not(.list-picker-list-multi) a:not(".disabled")': function(e) {
                e.preventDefault();
                this._selectItem($(e.currentTarget));
            },

            'click .list-picker-list-multi a:not(".disabled")': function(e) {
                e.preventDefault();
                this._toggleItem($(e.currentTarget));
            },

            'click .list-picker-list a': function(e) {
                e.preventDefault();
            },

            'click .list-picker-heading > .select-all': function(e) {
                e.preventDefault();

                if (this.selectedValues.length < this.items.length) {
                    this._selectAll();
                } else {
                    this._deselectAll();
                }
            },

            'click .list-picker-search': function(e) {
                e.preventDefault();
                this.$('.list-picker-filter, .list-picker-filter-hide').addClass('show').focus();
            },

            'keyup .list-picker-filter': function(e) {
                this._filterListDebounced();
            },

            'paste .list-picker-filter': function(e) {
                this._filterList();
            },

            'cut .list-picker-filter': function(e) {
                this._filterList();
            },

            'change .list-picker-filter': function(e) {
                this._filterList();
            },

            'click .list-picker-filter-hide': function(e) {
                e.preventDefault();
                this.$filterInput.val('');
                this.$('.list-picker-filter, .list-picker-filter-hide').removeClass('show').focus();
                this.$('.list-picker-search').focus();

                this._filterList();
            }
        },

        startListening: function() {
            BaseView.prototype.startListening.apply(this, arguments);
            if (this._useSplunkDCollectionPaginator(this.options.paginatorType)) {
                this.listenTo(this.collection.items, 'sync', this._renderList);
            } else if (this._useSearchResultsPaginator(this.options.paginatorType)) {
                this.listenTo(this.model.results, 'sync', this._renderList);
            }

            if (this.options.includeAddItem) {
                this.listenTo(this.model.state, 'attemptAddItem', this.addNewItem);
            }
        },

        // EXTERNAL ACCESSORS
        // Setting, getting, saving, and reverting selections

        // Change the selections initially defined in this.options.selectedValues
        setSelectedValues: function(values) {
            values = (values === undefined) ? [] : values;
            values = Array.isArray(values) ? values : [values];
            this.selectedValues = values.slice();
            this.saveSelectedValues();
            this._updateSelected();
            this._selectionDidReset();
        },

        // Request the list to remember to current set of selections in case of errors or cancellation
        saveSelectedValues: function() {
            this.savedValues = this.selectedValues.slice();
        },

        // Revert to the last saved set of selected values
        revertSelectedValues: function() {
            this.selectedValues = this.savedValues ? this.savedValues.slice() : [];
            this._updateSelected();
            this._selectionDidReset();
        },

        // get a single selected item (an item from this.items)
        getSelectedItem: function() {
            return _.find(this.items, function(item) {
                return this._isSelected(item.value);
            }.bind(this));
        },

        // get an array of selected items (a subset of this.items)
        getSelectedItems: function() {
            return _.filter(this.items, function(item) {
                return this._isSelected(item.value);
            }.bind(this));
        },

        // get the selected value (the selectedItems value property)
        getSelectedValue: function() {
            return _.first(this.selectedValues);
        },

        // get an array of all selected values (the selectedItems value properties)
        getSelectedValues: function() {
            return this.selectedValues;
        },

        // get the selected item's label (the selectedItem's label property)
        getSelectedLabel: function() {
            var sel = this.getSelectedItem();
            return sel.label || sel.value;
        },

        // get an array of all items' label (the selectedItems' label properties)
        getSelectedLabels: function() {
            return _.map(this.getSelectedItems(), function(item) {
                return item.label || item.value;
            }, this);
        },

        // get a boolean stating whether there is a selection
        hasSelection: function() {
            return this.selectedValues.length > 0;
        },

        // INTERNAL HANDLING OF EVENTS AND REQUESTS

        _useSearchResultsPaginator: function(paginatorType) {
            if (paginatorType === SEARCH_RESULTS) {
                if (!this.model.state) {
                    throw new Error('The Search Results Paginator requires that a State Model be passed in.');
                }
                if (!this.model.results) {
                    throw new Error('The Search Results Paginator requires that a Results Model be passed in.');
                }
                if (!this.model.searchJob) {
                    throw new Error('The Search Results Paginator requires that a Search Job Model be passed in.');
                }
                return true;
            } else {
                return false;
            }
        },

        _useSplunkDCollectionPaginator: function(paginatorType) {
            if (paginatorType === SPLUNKD_COLLECTION) {
                if ((!this.model || !this.model.state) && (!this.collection || (this.collection && !this.collection.fetchData))) {
                    throw new Error('The Collection Paginator requires that either a State Model or a FetchData Collection be passed in.');
                }
                if (!this.collection.items) {
                    throw new Error('The Collection Paginator requires that a SplunkD Collection be passed in as an "items" collection.');
                }
                return true;
            } else {
                return false;
            }
        },

        _selectionDidChange: function() {
            this.trigger('selectionDidChange');
        },

        _selectionDidNotChange: function() {
            this.trigger('selectionDidNotChange');
        },

        _selectionDidReset: function() {
            this.trigger('selectionDidReset');
        },

        _selectAll: function() {
            this.$interactableListItems.addClass('selected');
            this.selectedValues = _.pluck(this.items, 'value');
            this._selectionDidChange();
        },

        _deselectAll: function() {
            this.$interactableListItems.removeClass('selected');
            this.selectedValues = _.pluck(_.filter(this.items, function(item) {
                return item.isDisabled;
            }, this), 'value');
            this._selectionDidChange();
        },

        _toggleItem: function($el) {
            this[$el.hasClass('selected') ? '_deselectItem' : '_selectItem' ]($el);
        },

        _selectItem: function($el) {
            var val = this.items[$el.data('index')].value;

            if (this._isSelected(val)) {
                this._selectionDidNotChange();
                return false;
            }

            if (this.options.multiselect) {
                this.selectedValues.push(val);
            } else {
                this.$interactableListItems.removeClass('selected');
                this.selectedValues = [val];
            }
            $el.addClass('selected');

            this._selectionDidChange();
            return true;
        },

        _deselectItem: function($el) {
            var val = this.items[$el.data('index')].value,
                index = this._indexOfSelected(val);

            if (index === -1) {
                return false;
            }

            $el.removeClass('selected');
            this.selectedValues.splice(index, 1);

            this._selectionDidChange();
            return true;
        },

        _isSelected: function(val) {
            return this._indexOfSelected(val) >= 0;
        },

        _indexOfSelected: function(val) {
            return this.selectedValues.indexOf(val);
        },

        _updateSelected: function() {
            if (!this.$allListItems || this.$allListItems.length === 0) {
                return;
            }
            _.each(this.items, function(item, index) {
                this.$allListItems.eq(index)[this._isSelected(item.value) ? 'addClass' : 'removeClass']('selected');
            }, this);
        },

        _updateItems: function() {
            var usePaginator = this._useSplunkDCollectionPaginator(this.options.paginatorType) || this._useSearchResultsPaginator(this.options.paginatorType),
                customAddedFieldPickerItemsArray;

            if (!this.items) {
                this.items = [];
            }

            if (usePaginator) {
                // Pagination needs to clear the other items out first
                this.items = [];
            } else {
                // Otherwise, we can start with whatever items were passed into this view
                this.items = this.options.items;
            }

            if (this.itemsCollection) {
                this.items = this.items.concat(this.itemsCollection.getFieldPickerItems(this.options.fieldAttribute));
            }

            if (this.model && this.model.ast) {
                this.items = this.items.concat(this.model.ast.getFieldPickerItems());
            }

            if (this.options.sort) {
                // We'll sort every item by its "value" parameter, to lower case
                this.items = _.sortBy(this.items, function(item) {
                    return item.value.toLowerCase();
                }, this);
            }

            if ((!usePaginator || (this.model.state && (this.model.state.get('offset') === undefined ||
                    this.model.state.get('offset') === '0'))) && this.staticItems) {
                // Prepend static options to items list if on first page or there is no pagination
                this.items = this.staticItems.concat(this.items);
            }

            if (this.options.includeAddItem) {
                customAddedFieldPickerItemsArray = this.collection.customAddedFieldPickerItems.toJSON();

                // In order to ensure our custom added items stay at the bottom of the list, we must remove
                // them from our main list of items. Note that this isn't done in the call to uniq below because
                // uniq only keeps the first occurrence of a duplicate. Note that another way to do this is
                // reversing the items list, calling uniq and then reversing it again.
                this.items = _.reject(this.items, function(item) {
                    return _.find(customAddedFieldPickerItemsArray, function(addedItem) {
                        return addedItem.value === item.value;
                    }, this);
                }, this);
                this.items = this.items.concat(customAddedFieldPickerItemsArray);
            }

            // Deduplicate the items array, since there can be overlap.
            this.items = _.uniq(this.items, function(item) {
                return item.value;
            }, this);
        },

        _renderList: function() {
            this._updateItems();

            this.$('.list-picker-list').html(_(this.listTemplate).template({
                items: this.items,
                options: this.options
            }));
                
            this.$allListItems = this.$('.list-picker-list a');
            this.$interactableListItems = this.$allListItems.not('.disabled');
            this._updateSelected();
        },

        addNewItem: function() {
            var newItem = this.model.state.get('itemToAdd'),
                errorMessage = this.checkAlreadyExists(newItem) || (this.model.command && this.model.command.validateFieldName(newItem));

            if (errorMessage) {
                this.children.addItem.addError(errorMessage);
            } else {
                this.collection.customAddedFieldPickerItems.push({ value: newItem });
                this._updateItems();
                this.$('.list-picker-list').html(_(this.listTemplate).template({
                    items: this.items,
                    options: this.options
                }));
                this.$allListItems = this.$('.list-picker-list a');
                this.$interactableListItems = this.$allListItems.not('.disabled');
                this._updateSelected();
                this._selectItem($(this.$('li', '.list-picker-list').last().children()[0]));
            }
        },

        // FILTER
        // Filter the list based on text from the filter box.
        // Supports multiple keywords and quoted strings.
        _filterList: function() {
            var val = this.$filterInput.val(),
            // Split by spaces not in quotes, trim quote.
                words = _.map(val.match(/(?:[^\s"]+|"[^"]*")+/g), function(word){
                    return word.replace(/^"(.*)"$/, '$1').toLowerCase();
                });

            // If there are no words, just show everything.
            if (words.length === 0 ) {
                this.$allListItems.show();
            }

            // Iterate over each list item
            this.$allListItems.each(function(index, el){
                var $el = $(el),
                    text = $el.text().toLowerCase(), // We could grab the display label from the itmem, but this works.
                    matchCount = 0;

                // Iterate over each word
                _.each(words, function(word, index) {
                    // If there was already a miss, exit.
                    if (matchCount < index) {
                        return;
                    }

                    matchCount = text.includes(word) ? matchCount + 1 : matchCount;
                }.bind(this));

                // Hide or show the list item
                $el.css('display', [matchCount === words.length ? '' : 'none']);
            });
        },

        visibility: function() {
            var $loadingMessage = this.$('.loading-message'),
                $emptyMessage = this.$('.empty-items-message'),
                $paginator = this.$('.pagination'),
                normalizedDeferreds,
                allDeferredsDone,
                modelsReadyCallback;

            if (this.options.deferred) {
                // The caller could pass in one deferred or an array of deferreds. Normalize here.
                normalizedDeferreds = _.isArray(this.options.deferred) ? this.options.deferred : [ this.options.deferred ];
                // If all the deferreds are done, then we won't have to show any loading states.
                allDeferredsDone = _.all(normalizedDeferreds, function(deferred) {
                    return deferred.state === 'resolved';
                }, this);
                // We'll run this function when we know all the models are ready.
                modelsReadyCallback = function() {
                    $loadingMessage.hide();
                    // We need to update items to know if we have no items to show
                    if (this.children.addItem) {
                        this.children.addItem.activate({ deep:true }).render().appendTo(this.$('.list-picker-scroll'));
                    }
                    this._updateItems();

                    if (this.items.length === 0) {
                        $emptyMessage.show();
                    } else {
                        this.showAndRenderList();
                    }
                }.bind(this);

                if (!allDeferredsDone) {
                    // Make sure we tell the user we're loading here.
                    $loadingMessage.css('display', '');
                    $paginator.hide();

                    // Using apply will pass the array normalizedDeferreds as separate arguments to $.when,
                    // which is what $.when can handle. It will run the function when all are resolved.
                    $.when.apply($, normalizedDeferreds).then(function() {
                        modelsReadyCallback();
                    }.bind(this));
                } else {
                    modelsReadyCallback();
                }
            } else {
                if (this.items.length === 0) {
                    $emptyMessage.show();
                } else {
                    this.showAndRenderList();
                }

                if (this.children.addItem) {
                    this.children.addItem.activate({ deep:true }).render().appendTo(this.$('.list-picker-scroll'));
                }
            }
        },

        showAndRenderList: function() {
            var $listPicker = this.$('.list-picker-list'),
                $paginator = this.$('.pagination');

            $listPicker.css('display', '');
            $paginator.css('display', '');
            this._renderList();
        },

        //this function is to specifically check if the item is already in the picker or not
        checkAlreadyExists: function(itemName) {
            if ( _.findWhere(this.items, { value: itemName })) {
                return splunkUtils.sprintf(_('\"%s\" already exists.').t(), itemName);
            }
        },

        // RENDER
        render: function() {
            if (!this.el.innerHTML) {
                var template = this.compiledTemplate({
                    options: this.options,
                    hasValue: this.hasSelection()
                });

                this.$el.html(template);
            }

            this.$el.addClass('list-picker-' + this.options.size);
            if (this.options.additionalClassNames) {
                this.$el.addClass(this.options.additionalClassNames);
            }

            if (this.children.paginatorView) {
                this.children.paginatorView.activate({deep:true}).render().appendTo(this.$el);
            }

            this.visibility();

            this.$filterInput = this.$('.list-picker-filter');
            this._updateSelected();

            return this;
        },

        template: '\
            <div class="list-picker-heading <%= options.multiselect ? "list-picker-heading-multi" : "" %>">\
                <input type="text" class="list-picker-filter" placeholder="<%- _("find...").t() %>">\
                <a class="list-picker-filter-hide"><i class="icon-x"></i></a>\
                <a class="list-picker-search"><i class="icon-search"></i></a>\
                <% if (options.allowAdd) { %><a class="list-picker-addvalue"><i class="icon-plus"></i></a><% } %>\
                <% if (options.multiselect) { %><i class="select-all icon-<%- options.selectedIcon %>"></i></i><% } %>\
                <span class="select-message"><%- options.multiselect ? options.multiselectMessage : options.selectMessage %></span>\
            </div>\
            <div class="empty-items-message" style="display: none"><%- _(options.emptyItemsMessage || "You have no items to select from.").t() %></div>\
            <div class="list-picker-scroll">\
                <ul class="nav list-picker-list <%= options.multiselect ? "list-picker-list-multi" : "" %>" style="display: none;"></ul>\
                <div class="loading-message" style="display: none"><%- _(options.loadingMessage || "Loading...").t() %></div>\
            </div>\
        ',

        listTemplate: '\
            <% _.each(items, function(item, index, list) { %>\
                <li>\
                    <a href="#" class="<%= item.isDisabled ? "disabled" : "" %> <%= item.isItalics ? "italicize" : "" %>" data-value="<%- item.value %>" data-index="<%- index %>">\
                        <i class="icon-<%- options.selectedIcon %>"></i><%- item.label || item.value %>\
                    </a>\
                </li>\
            <% }); %>\
        '
    }, {
        PAGINATOR_TYPES: {
            SEARCH_RESULTS: SEARCH_RESULTS,
            SPLUNKD_COLLECTION: SPLUNKD_COLLECTION
        }
    });
});
