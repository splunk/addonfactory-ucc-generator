/**
 * @author jszeto
 * @date 1/15/14
 *
 * A view for editing the lookup input of a Lookup calculation.
 *
 * Input:
 *      model {models/services/datamodel/private/LookupInput} - The lookup input to edit
 *      flashMessagesHelper {helpers/FlashMessagesHelper} - Used to register validating models
 *
 * @fires LookupInputFieldView#action:removeInputField
 */
define(
    [
        'underscore',
        'views/ValidatingView',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'module'
    ],
    function(
        _,
        ValidatingView,
        ControlGroup,
        SyntheticSelectControl,
        module
        )
    {

        return ValidatingView.extend({
            moduleId: module.id,
            className: 'lookup-input-attribute-controls',
            tagName: 'tr',

            events: {
                'click .remove-button': function(e) {
                    e.preventDefault();
                    /**
                     * Remove the input field
                     *
                     * @event LookupInputFieldView#action:removeInputField
                     * @param {string} - ID of the input field
                     */
                    this.trigger("action:removeInputField", this.model.cid);
                }
            },

            initialize: function(options) {
                ValidatingView.prototype.initialize.call(this, options);
                options = options || {};
                this.$el.addClass(options.className);

                this.collection.lookupFields.on("change add remove reset", this.applyItemsToSelectLookupField, this);

                this.children.selectInputField = new SyntheticSelectControl({model:this.model,
                                                                             modelAttribute:"inputField",
                                                                             items:options.fieldNames,
                                                                             toggleClassName: 'btn',
                                                                             menuWidth: 'narrow'});
                this.children.selectLookupField = new SyntheticSelectControl({model:this.model,
                                                                             modelAttribute:"lookupField",
                                                                             items: this.getLookupItems(),
                                                                             toggleClassName: 'btn',
                                                                             menuWidth: 'narrow'});
            },

            getLookupItems: function() {
                var items = [];
                this.collection.lookupFields.each(function(lookupField) {
                    items.push({label:lookupField.get("id"), value:lookupField.get("id")});
                }, this);
                return items;
            },

            applyItemsToSelectLookupField: function() {
                // Reset the lookupField select control with the new field values
                this.children.selectLookupField.setItems(this.getLookupItems());
            },

            render: function() {
                var html = _(this.template).template({ });
                this.$el.html(html);

                this.$(".select-input-field-placeholder").append(this.children.selectInputField.render().el);
                this.$(".select-lookup-field-placeholder").append(this.children.selectLookupField.render().el);

                return this;
            },

            template: '\
                <td class="select-lookup-field-placeholder"></td>\
                <td>=</td>\
                <td class="select-input-field-placeholder"></td>\
                <td><a href="#" class="remove-button"><%- _("Remove").t() %></a></td>\
            '

        });

    });
