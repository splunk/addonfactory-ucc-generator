/**
 * @author jszeto
 * @date 10/26/12
 *
 * Dialog to show the values from an attribute
 *
 * Inputs:
 *
 *     model: {
 *         fieldModel {models/services/datamodel/private/Field} - display the values for this Field
 *         application {models/Application}
 *         objectModel {models/services/datamodel/private/Object}
 *     }
 */

define(
    [
        'jquery',
        'underscore',
        'views/shared/dialogs/DialogBase',
        'module'
    ],
    function(
        $,
        _,
        DialogBase,
        module
    )
{
        return DialogBase.extend({
            moduleId: module.id,
            initialize: function(options) {
                DialogBase.prototype.initialize.call(this, options);
                this.settings.set("titleLabel","View Values for " + _(this.model.fieldModel.get("displayName")).escape());

                this.initializeSampleValues();
            },

            initializeSampleValues: function() {

                this.model.sampleValues = this.model.objectModel.getSampleValuesModel(
                    this.model.fieldModel.get('fieldName'),
                    this.model.fieldModel.get('owner'),
                    {
                        data: {
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner'),
                            provenance: 'UI:DataModel'
                        }
                    }
                );

                this.debouncedRender();

                this.model.sampleValues.on('change:values', this.debouncedRender, this);
            },

            /**
             * Render the dialog body. Subclasses should override this function
             *
             * @param $el The jQuery DOM object of the body
             */
            renderBody: function($el) {
                $el.html(_(this.bodyTemplate).template({values: this.model.sampleValues.get('values')}));
            },
            renderFooter: function($el) {
                // No op. We don't want a footer
            },

            bodyTemplate: '\
                <div class="content">\
                    <div class="sample-values">\
                        <% if (values) { %>\
                            <% if(values.length > 0) { %>\
                                <% _(values).each(function(value) { %>\
                                    <div class="sample-value"><%- value %></div>\
                                <% }); %>\
                            <% } else { %>\
                                <div class="alert alert-info">\
                                    <i class="icon-alert"></i>\
                                    No Sample Values found.\
                                </div>\
                             <% } %>\
                        <% } else { %>\
                            <div class="alert alert-info">\
                                <i class="icon-alert"></i>\
                                Loading sample values...\
                            </div>\
                        <% } %>\
                    </div>\
                </div>\
            '
        });
    }
);

