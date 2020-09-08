/**
 * @author jszeto
 * @date 2/19/13
 *
 * A specialized view that allows a user to select multiple items from a dropdown. It consists of an Add Button which
 * displays a dropdown showing the list of selectable items. It also displays a set of buttons for each selected item.
 * Pressing on a button's X icon will unselect the item.
 *
 * Inputs:
 *      collection {
 *          itemsCollection {Collection} - The set of items to select from
 *          selectedItemsCollection {Collection} - The set of currently selected items
 *      }
 *      labelAttribute {String} - The name of the attribute to use as the label for the dropdown list and the
 *                                  selected item buttons (Default is "label")
 *      valueAttribute {String} - The name of the attribute to use as the value for the dropdown list and the
 *                                  selected item buttons (Default is "value")
 *      allowSorting {Boolean} - If true, then the selected fields can be reordered using drag and drop. (Default is false)
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/shared/delegates/Popdown',
        'views/data_model_editor/form_components/SelectItemPopdown',
        'views/data_model_editor/form_components/RemovableItem',
        'jquery.ui.sortable',
        'module'
    ],
    function(
        $,
        _,
        Backbone,
        BaseView,
        Popdown,
        SelectItemPopdown,
        RemovableItem,
        JQSortable,
        module
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            className: 'select-multiple-items',
            // Array of select item views
            selectedItemsViews: [],
            // Collection of itemsCollection minus the items in selectedItemsCollection. Used by selectItemDialog
            selectableItemsCollection: undefined,

            /**
             * @constructor
             * }
             */

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                options = options || {};
                _(options).defaults({valueAttribute:"value", labelAttribute:"label", allowSorting:false});

                this.$el.addClass(options.className);

                this.allowSorting = options.allowSorting;
                this.valueAttribute = options.valueAttribute;
                this.labelAttribute = options.labelAttribute;
                this.selectableItemsCollection = new Backbone.Collection();

                // Setup the dropdown that displays the list of selectable items
                this.children.selectItemDialog = new SelectItemPopdown({collection: this.selectableItemsCollection,
                                                                        valueAttribute: this.valueAttribute,
                                                                        labelAttribute: this.labelAttribute});
                this.children.selectItemDialog.on("itemSelected", this.itemSelectedHandler, this);

                this.children.popdown = new Popdown({
                    el: this.el,
                    toggle: '.add-button',
                    dialog: '.select-item-popdown'
                });

                // Listen for changes to both collections
                this.collection.selectedItemsCollection.on("add remove reset", this.selectedItemsChangeHandler, this);
                this.collection.itemsCollection.on("add remove reset", this.updateSelectableItemsCollection, this);

                // Run this once on initialization to update the selectableItemsCollection. Run this on defer since
                // it also performs some rendering changes
                _.defer(_.bind(this.updateSelectableItemsCollection, this));
            },

            /**
             * If the selectedItems has changed, then update the selectable items and re-render
             */
            selectedItemsChangeHandler: function() {
                this.updateSelectableItemsCollection();
                this.renderSelectedItems();
            },
            /**
             * Called when we get an itemSelected event from the selectItemDialog
             * @param itemValue {object} value of the selected item
             */
            itemSelectedHandler: function(itemValue) {
                // Find the item in the itemsCollection and add it to the selectedItemsCollection
                this.collection.selectedItemsCollection.add(this.collection.itemsCollection.find(function(item) {
                    return item.get(this.valueAttribute) == itemValue;
                }, this));
            },
            /**
             * Called when we get a removeItem event from a selected item
             * @param itemValue {object} value of the removed item
             */
            removeItemHandler: function(itemValue) {
                // Remove the item from the selectedItemsCollection
                this.collection.selectedItemsCollection.remove(this.collection.selectedItemsCollection.find(function(item) {
                    return item.get(this.valueAttribute) == itemValue;
                }, this));
            },

            // Update the selectableItemsCollection based on the selected items
            updateSelectableItemsCollection: function(event) {
                var fields = [];
                if (this.collection.selectedItemsCollection.length > 0) {
                    // Remove the selectedFields from the field collection
                    fields = this.collection.itemsCollection.reject(function(field) {
                        return this.collection.selectedItemsCollection.find(function(item) {
                            return item.get(this.valueAttribute) == field.get(this.valueAttribute);
                        }, this);
                    }, this);
                }
                else {
                    fields = this.collection.itemsCollection.models;
                }

                this.selectableItemsCollection.reset(fields);

                // If we have no selectable items, then hide the add button
                if (this.selectableItemsCollection.length > 0) {
                    this.$(".add-button").show();
                } else {
                    this.$(".add-button").hide();
                }
            },

            /**
             * Sets up the configuration options for the jQuery UI sortable plugin used to manage the drag-and-drop resorting
             * of the objects calculations.
             *
             * For documentation, see:  http://jqueryui.com/sortable/ or http://api.jqueryui.com/sortable/
             */

            configureSortable: function() {
                var that = this;
                this.$('.custom-item-list').sortable({
                    items: '.removable-item',
                    //placeholder: 'ui-sortabale-placeholder',
                    //forcePlaceholderSize: true,
                    //opacity: 0.7,
                    //tolerance: 'pointer',
                    stop: function(event, ui) {
                        that.onSortStop();
                    }
                });
            },

            /**
             * Called when the user has dropped the sort drag
             */
            onSortStop: function() {
                // Get the new item order from the DOM elements
                var newOrder = _(this.$('.removable-item')).map(function(elem) {
                    return $(elem).find(RemovableItem.VALUE_SELECTOR).attr(RemovableItem.VALUE_ATTR);
                }, this);

                // Reorder the selectedItems collection based on the DOM element order
                var reorderedCollection = this.collection.selectedItemsCollection.sortBy(function(item, index) {
                    return _(newOrder).indexOf(item.get(this.valueAttribute));
                }, this);

                this.collection.selectedItemsCollection.reset(reorderedCollection);
            },

            /**
             * Create a RemovableItem control for each selected item
             */
            renderSelectedItems: function() {
                // Cleanup the existing RemovableItems
                _(this.selectedItemsViews).each(function(label) { label.remove(); });
                this.selectedItemsViews = [];

                // Iterate over the selected items and render a RemovableItem for each one
                this.collection.selectedItemsCollection.each(function(item, i) {
                    var selectedItem = new RemovableItem({
                        item: {value: item.get(this.valueAttribute), label: item.get(this.labelAttribute)},
                        allowSorting: this.allowSorting
                    });

                    selectedItem.on("removeItem", this.removeItemHandler, this);
                    this.$(".custom-item-list").append(selectedItem.render().el);
                    this.selectedItemsViews.push(selectedItem);
                }, this);

                if (this.allowSorting)
                    this.configureSortable();

            },

            render: function() {

                var html = _(this.template).template({});
                this.$el.html(html);

                this.children.selectItemDialog.render().replaceAll(this.$('.select-item-popdown-placeholder'));

                this.renderSelectedItems();

                return this;
            },

            template: '\
                    <div class="custom-item-list"></div>\
                    <a href="#" class="btn add-button">+</a>\
                    <div class="select-item-popdown-placeholder"></div>\
                '

        });

    });

