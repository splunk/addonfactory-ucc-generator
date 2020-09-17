/**
 * @author jszeto
 * @date 11/20/12
 *
 * A view that manages a list of sub-views that is synced to the output fields of a calculation.
 *
 * Inputs:
 *
 *     model {models/services/datamodel/private/LookupCalculation} - Lookup Calculation model
 *     flashMessagesHelper {helpers/FlashMessagesHelper} - Used to register validating models
 *
 * Child Views:
 *
 *     fieldViews {array} {views/data_model_editor/form_components/LookupOutputFieldView} a list of sub-views, one for each output field
 *
 */

define(
    [
        'jquery',
        'underscore',
        'views/Base',
        './LookupOutputFieldView',
        'module',
        'util/console'
    ],
    function(
        $,
        _,
        BaseView,
        LookupOutputFieldView,
        module,
        console
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            className: 'lookup-fields-view',

            fieldViews: null,

            events: {
                'click .add-new-button': function(e) {
                    e.preventDefault();
                    this.trigger("action:addOutputField");
                }
            },
            /**
             * Proxy the action:removeField event from the LookupOutputFieldView up to our parent View
             *
             * @param cid
             */
            removeFieldHandler: function(cid) {
                this.trigger("action:removeOutputField", cid);
            },

            /**
             * Called by the collection when a Field model has been added
             *
             * @param model - the added Field model
             * @param collection - the collection of outputFields
             * @param options - contains the index property where the Field was added
             */
            addOutputFieldsHandler: function(model, collection, options) {
                this._addFieldView(model);
            },

            /**
             * Called by the collection when a Field model has been removed
             *
             * @param model - the removed Field model
             * @param collection - the collection of outputFields
             * @param options - contains the index property where the Field was removed
             */
            removeOutputFieldsHandler: function(model, collection, options) {
                this.$(".fields-container").children().eq(options.index).remove();
                this.fieldViews.splice(options.index, 1);
            },

            /**
             * Called by the collection when a reset is performed upon it
             *
             * @param collection - the collection of outputFields
             * @param options - options used to reset the collection
             */
            resetOutputFieldsHandler: function(collection, options) {
                this._rebuildFieldViews();
            },

            /**
             * Helper function to add a View based on a Field model
             *
             * @param model - the Field model used to create the View
             */
            _addFieldView: function(model) {
                var fieldView = new LookupOutputFieldView({
                    model: model,
                    flashMessagesHelper: this.flashMessagesHelper
                });

                this.$(".fields-container").append(fieldView.render().el);

                this.fieldViews.push(fieldView);
                fieldView.on("action:removeOutputField", this.removeFieldHandler, this);
            },

            /**
             * Remove all previous Views and regenerate new Views from the model
             */
            _rebuildFieldViews: function() {
                _(this.fieldViews).each(function(view) { view.remove(); });
                this.fieldViews = [];

                this.collection.each(function(field, i) {
                    this._addFieldView(field);
                }, this);
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.fieldViews = [];
                this.flashMessagesHelper = options.flashMessagesHelper;
                this.collection.on("add", this.addOutputFieldsHandler, this);
                this.collection.on("remove", this.removeOutputFieldsHandler, this);
                this.collection.on("reset", this.resetOutputFieldsHandler, this);
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
                                <td><%- _("Field in Dataset:").t() %></td>\
                                <td><%- _("Display Name:").t() %></td>\
                                <td><%- _("Type:").t() %></td>\
                                <td><%- _("Flags:").t() %></td>\
                                <td></td>\
                            </tr>\
                        </thead>\
                        <tbody class="fields-container"></tbody>\
                    </table>\
                '
        });
    });
