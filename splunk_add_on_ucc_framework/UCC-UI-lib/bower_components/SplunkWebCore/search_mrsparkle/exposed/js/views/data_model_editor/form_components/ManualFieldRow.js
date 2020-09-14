/**
 * @author usaha 
 * @date 12/10/13
 *
 * Displays a row for entering a manually extracted  field. 
 *
 * Input:
 *
 *     model {models/datamodel/ExtractedField} - The extracted field to edit
 */

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/delegates/RowExpandCollapse',
    'views/shared/controls/TextControl',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/data_model_editor/form_components/SelectFieldFlags',
    'views/data_model_editor/form_components/SelectFieldType'

],
    function(
        $,
        _,
        module,
        Base,
        RowExpandCollapse,
        TextControl,
        SyntheticCheckboxControl,
        SelectFieldFlags,
        SelectFieldType
        ) {

        return Base.extend({
            tagName: 'tr',

            moduleId: module.id,
            events: {
                'click .removeField': function(e) {
                    e.preventDefault();
                    this.trigger('action:removeField', this.model); 
                }
            }, 
            initialize: function(options) {
                Base.prototype.initialize.call(this, options);


                this.children.textFieldName = new TextControl({model:this.model,
                                                                 modelAttribute:"fieldName"});

                this.children.textDisplayName = new TextControl({model:this.model,
                                                                 modelAttribute:"displayName"});

                this.children.selectFieldType = new SelectFieldType({
                        model:this.model,
                        className: "dropdown",
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal .modal-body:visible'
                        }
                    });
                this.children.selectFieldFlags= new SelectFieldFlags({
                        model:this.model,
                        className: "dropdown",
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal .modal-body:visible'
                        }
                    });
            },
            render: function() {
                this.children.textFieldName.detach();
                this.children.textDisplayName.detach();
                this.children.selectFieldType.detach();
                this.children.selectFieldFlags.detach();

                var html = this.compiledTemplate();

                this.$el.html(html);


                this.$el.find(".manual-col-description").append(this.children.textFieldName.render().el);
                this.$el.find(".col-rename").append(this.children.textDisplayName.render().el);
                this.$el.find(".col-type").append(this.children.selectFieldType.render().el);
                this.$el.find(".col-type").append(this.children.selectFieldFlags.render().el);
                this.$el.find(".col-type").append('<a href="#" class="removeField"><i class="icon-cancel"></i></a>'); 

                return this;
            },
            template: '\
                    <td></td>\
                    <td class="col-checkbox"></td>\
                    <td class="manual-col-description"></td>\
                    <td class="col-rename">\
                    </td>\
                    <td class="col-type">\
                    </td>\
            '

        });

    });
