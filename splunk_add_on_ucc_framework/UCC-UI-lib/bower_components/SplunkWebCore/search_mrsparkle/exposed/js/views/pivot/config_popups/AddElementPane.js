/**
 * @author sfishel
 *
 * A view for adding a new pivot report element.
 * 
 * This view used for all element types except timestamp filter, which must be handled a special case.
 * 
 * Child Views:
 * 
 * (see views/pivot/config_popups/BasePreviewPane for inherited child views)
 *
 * Custom Events:
 *
 * (see views/pivot/config_popups/BasePreviewPane for inherited custom events)
 * action:cancel - triggered when the the current add flow should be canceled and any changes discarded
 * action:addElement - triggered when an element should be added to the report
 *     @param <sub-class of models/pivot/elements/BaseElement> the model to add
 */

define(['jquery', 'module', './BasePreviewPane'], function($, module, BasePreviewPane) {

    return BasePreviewPane.extend({

        moduleId: module.id,

        events: $.extend({}, BasePreviewPane.prototype.events, {
            'click .submit-button': function(e) {
                e.preventDefault();
                this.trigger('action:addElement', this.model.element);
            }
        }),

        /**
         * @constructor not overridden
         * (see views/pivot/config_popups/BasePreviewPane for constructor documentation)
         */

        renderFormView: function() {
            BasePreviewPane.prototype.renderFormView.call(this);
            this.children.formView.on('action:enterKey', function() {
                this.trigger('action:addElement', this.model.element);
            }, this);
        },

        buttonsTemplate: '\
            <a href="#" class="btn btn-primary submit-button"><%- _("Add To Table").t() %></a>\
        '

    });

});