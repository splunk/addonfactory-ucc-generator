/**
 * @author jszeto
 * @date 12/10/12
 *
 * A view that manages a list of sub-views that is synced to the output fields of a calculation.
 *
 * Inputs:
 *
 *     model {models/services/datamodel/private/RexCalculation} - Rex Calculation model
 *     flashMessagesHelper {helpers/FlashMessagesHelper} - Used to register validating models
 *
 * Child Views:
 *
 *     fieldViews {array} {views/data_model_editor/form_components/RexOutputFieldView} a list of sub-views, one for each output field
 */

define(
    [
        'jquery',
        'underscore',
        'views/Base',
        './RexOutputFieldView',
        'module'
    ],
    function(
        $,
        _,
        BaseView,
        RexOutputFieldView,
        module
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            className: 'rex-output-fields-body',

            fieldViews: null,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.fieldViews = [];
                this.model.outputFields.on('add remove reset', this.debouncedRender, this);
            },

            render: function() {
                _(this.fieldViews).each(function(view) { view.remove(); });
                this.fieldViews = [];
                this.$el.empty();

                var html = _(this.template).template({
                    hasAttributes: this.model.outputFields.length
                });
                this.$el.html(html);

                this.model.withEachField(function(field, i) {
                    var fieldView = new RexOutputFieldView({
                        model: field
                    });
                    this.$(".output-fields-body").append(fieldView.render().el);
                    this.fieldViews.push(fieldView);
                }, this);

                return this;
            },

            template: '\
                <% if (hasAttributes) { %>\
                    <table class="output-fields-table">\
                        <thead>\
                            <tr>\
                                <td><%- _("Field Name:").t() %></td>\
                                <td><%- _("Display Name:").t() %></td>\
                                <td><%- _("Type:").t() %></td>\
                                <td><%- _("Flags:").t() %></td>\
                            </tr>\
                        </thead>\
                        <tbody class="output-fields-body"></tbody>\
                    </table>\
                <% } else { %>\
                    <span><%- _("Fields will be defined from the regular expression.").t() %></span>\
                <% } %>\
                '
        });
    });
