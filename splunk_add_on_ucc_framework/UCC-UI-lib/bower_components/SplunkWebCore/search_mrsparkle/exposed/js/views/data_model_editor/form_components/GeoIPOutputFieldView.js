/**
 * @author jszeto
 * @date 11/27/12
 *
 * A view for editing the output field of a GeoIP calculation.
 *
 * Inputs:
 *
 *     model {models/services/datamodel/private/Field} - The output field of the GeoIPCalculation
 *     className {string} (optional) a class name to add to the view's root element
 *     flashMessagesHelper {helpers/FlashMessagesHelper} - Used to register validating models
 */
define(
    [
        'underscore',
        'views/Base',
        'views/shared/controls/TextControl',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticCheckboxControl',
        'module'
    ],
    function(
        _,
        BaseView,
        TextControl,
        ControlGroup,
        SyntheticCheckboxControl,
        module
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'field-view-row',

            /**
             * Handle changes on the check box.
             *
             * @param newValue
             * @param oldValue
             */
            checkBoxHiddenChangeHandler: function(newValue, oldValue) {
                this.updateEnabledState(newValue);
            },

            updateEnabledState: function(enabled) {

                // TODO [JCS] Figure out how to disable the field name
                if (enabled)
                {
                    this.$(".col-lookup-output-field-name-label").removeClass("disabled");
                    this.textDisplayNameControl.disable();
                }
                else
                {
                    this.$("col-lookup-output-field-name-label").addClass("disabled");
                    this.textDisplayNameControl.enable();
                }
            },
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                options = options || {};
                this.$el.addClass(options.className);

                this.textDisplayNameControl = new TextControl({modelAttribute: 'displayName',
                                                             model: this.model});

                this.children.textDisplayName = new ControlGroup({controls: this.textDisplayNameControl});

                this.children.checkBoxHidden = new SyntheticCheckboxControl({model:this.model,
                                                                             modelAttribute:"hidden",
                                                                             invertValue: true});
                this.children.checkBoxHidden.on("change", this.checkBoxHiddenChangeHandler, this);

                options.flashMessagesHelper.register(this.model);
            },

            render: function() {
                var html = _(this.template).template({lookupOutputFieldName:this.model.get("lookupOutputFieldName") });
                this.$el.html(html);

                this.$(".col-checkBox-hidden").append(this.children.checkBoxHidden.render().el);
                this.$(".col-display-name").append(this.children.textDisplayName.render().el);

                this.updateEnabledState(this.model.get("hidden"));

                return this;
            },

            template: '\
                    <td class="col-checkBox-hidden"></td>\
                    <td class="col-lookup-output-field-name-label"><%- lookupOutputFieldName %></td>\
                    <td class="col-display-name"></td>\
            '

        });

    });
