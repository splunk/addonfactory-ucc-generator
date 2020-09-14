/**
 * @author jszeto
 * @date 2/20/13
 *
 * Subclass of SelectMultipleItems. This is a specialized subclass for dealing with Data Model Objects.
 *
 */
define(
    [
        'underscore',
        'models/services/datamodel/DataModel',
        'views/data_model_editor/form_components/SelectMultipleItems',
        'module'
    ],
    function(
        _,
        DataModel,
        SelectMultipleItems,
        module
        )
    {

        return SelectMultipleItems.extend({
            moduleId: module.id,
            className: 'select-multiple-objects',

            /**
             * @constructor
             * }
             */

            initialize: function(options) {
                SelectMultipleItems.prototype.initialize.call(this, options);
            },

            // Update the selectableItemsCollection based on the selected items
            updateSelectableItemsCollection: function() {
                // Don't call the super class updateSelectableItemsCollection

                var fields = [];
                var showAddButton = true;

                if (this.collection.selectedItemsCollection.length > 0) {
                    // Check the type of the first item. If it is a BaseEvent, then only add BaseEvents
                    // If it is a BaseTransaction or BaseSearch, then disable the + button
                    var objectRootParent = this.collection.selectedItemsCollection.at(0).get("rootParent");

                    if (objectRootParent == DataModel.BASE_EVENT) {
                        // Remove the selectedFields from the field collection
                        fields = this.collection.itemsCollection.reject(function(field) {
                            return this.collection.selectedItemsCollection.find(function(item) {
                                return item.get(this.valueAttribute) == field.get(this.valueAttribute);
                            }, this) || field.get("rootParent") != DataModel.BASE_EVENT;
                        }, this);
                    }
                    else {
                        showAddButton = false;
                    }
                }
                else {
                    fields = this.collection.itemsCollection.models;
                }

                if (showAddButton) {
                    this.selectableItemsCollection.reset(fields);
                    this.$(".add-button").show();
                }
                else {
                    this.$(".add-button").hide();
                }
            }
        });
    });


