/**
 * @author jszeto
 * @date 11/20/2012
 *
 * A view for editing the output field of a Rex calculation.
 *
 * Input:
 *      model {models/services/datamodel/private/Field} - The output field to edit
 *
 */
define(
    [
        'underscore',
        'views/Base',
        'views/shared/controls/TextControl',
        'views/data_model_editor/form_components/SelectFieldType',
        'views/data_model_editor/form_components/SelectFieldFlags',
        'module'
    ],
    function(
        _,
        BaseView,
        TextControl,
        SelectFieldType,
        SelectFieldFlags,
        module
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                options = options || {};
                this.$el.addClass(options.className);

                this.children.textDisplayName = new TextControl({model:this.model, modelAttribute:"displayName"});

                this.children.selectFieldType = new SelectFieldType({model:this.model});
                this.children.selectFieldFlags= new SelectFieldFlags({model:this.model});
            },

            render: function() {
                var html = _(this.template).template({fieldName:this.model.get("fieldName")});
                this.$el.html(html);

                this.$(".display-name-placeholder").append(this.children.textDisplayName.render().el);
                this.$(".field-type").append(this.children.selectFieldType.render().el);
                this.$(".field-flags").append(this.children.selectFieldFlags.render().el);

                return this;
            },

            template: '\
                        <td class="field-name"><%- fieldName %></td>\
                        <td class="display-name-placeholder"/></td>\
                        <td class="field-type"></td>\
                        <td class="field-flags"></td>\
            '

        });

    });
