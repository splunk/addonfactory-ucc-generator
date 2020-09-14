/**
 * @author jszeto
 * @date 1/14/14
 *
 * A view that manages a list of sub-views that is synced to the input fields of a lookup calculation.
 *
 * Inputs:
 *
 *     model {models/services/datamodel/private/LookupCalculation} - Lookup Calculation model
 *     flashMessagesHelper {helpers/FlashMessagesHelper} - Used to register validating models
 */

define(
    [
        'jquery',
        'underscore',
        'views/Base',
        './LookupInputFieldView',
        'module',
        'util/console'
    ],
    function(
        $,
        _,
        BaseView,
        LookupInputFieldView,
        module,
        console
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            className: 'lookup-input-fields-view',

            fieldViews: null,

            events: {
                'click .add-new-button': function(e) {
                    e.preventDefault();
                    this.trigger("action:addInputField");
                }
            },
            /**
             * Proxy the action:removeField event from the LookupInputFieldView up to our parent View
             *
             * @param cid
             */
            removeFieldHandler: function(cid) {
                this.trigger("action:removeInputField", cid);
            },

            /**
             * Called by the collection when a Field model has been added
             *
             * @param model - the added Field model
             * @param collection - the collection of outputFields
             * @param options - contains the index property where the Field was added
             */
            addInputFieldsHandler: function(model, collection, options) {
                this._addFieldView(model);
            },

            /**
             * Called by the collection when a Field model has been removed
             *
             * @param model - the removed Field model
             * @param collection - the collection of outputFields
             * @param options - contains the index property where the Field was removed
             */
            removeInputFieldsHandler: function(model, collection, options) {
                this.$(".fields-container").children().eq(options.index).remove();
                this.fieldViews.splice(options.index, 1);
            },

            /**
             * Called by the collection when a reset is performed upon it
             *
             * @param collection - the collection of outputFields
             * @param options - options used to reset the collection
             */
            resetInputFieldsHandler: function(collection, options) {
                this._rebuildFieldViews();
            },

            /**
             * Helper function to add a View based on a Field model
             *
             * @param model - the Field model used to create the View
             */
            _addFieldView: function(lookupInput) {
                var fieldView = new LookupInputFieldView({
                    model: lookupInput,
                    collection: {lookupFields: this.collection.lookupFields},
                    fieldNames: this.options.fieldNames
                });

                this.$(".fields-container").append(fieldView.render().el);

                this.fieldViews.push(fieldView);
                fieldView.on("action:removeInputField", this.removeFieldHandler, this);
            },

            /**
             * Remove all previous Views and regenerate new Views from the model
             */
            _rebuildFieldViews: function() {
                _(this.fieldViews).each(function(view) { view.remove(); });
                this.fieldViews = [];

                this.collection.lookupInputs.each(function(lookupInput) {
                    this._addFieldView(lookupInput);
                }, this);
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.fieldViews = [];
                this.flashMessagesHelper = options.flashMessagesHelper;
                this.collection.lookupInputs.on("add", this.addInputFieldsHandler, this);
                this.collection.lookupInputs.on("remove", this.removeInputFieldsHandler, this);
                this.collection.lookupInputs.on("reset", this.resetInputFieldsHandler, this);
            },

            render: function() {
                this.$el.empty();

                var html = _(this.template).template({ });
                this.$el.html(html);

                this._rebuildFieldViews();
                return this;
            },

            template: '\
                    <table class="output-fields-table">\
                        <thead>\
                            <tr>\
                                <td><%- _("Field in Lookup:").t() %></td>\
                                <td></td>\
                                <td><%- _("Field in Dataset:").t() %></td>\
                                <td></td>\
                            </tr>\
                        </thead>\
                        <tbody class="fields-container"></tbody>\
                    </table>\
                    <a href="#" class="add-new-button"><%- _("Add New").t() %></a>\
                '
        });
    });
