/**
 * @author sfishel
 * 
 * A view for inspecting/editing a pivot report element.
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
 * action:removeElement - triggered when the active element should be removed from the report
 * action:cancel - triggered when the current edit flow should be canceled and any changes discarded
 * action:update - triggered when the current edit flow should be completed and any changes applied
 */

define(['jquery', 'module', './BasePreviewPane'], function($, module, BasePreviewPane) {

    return BasePreviewPane.extend({

        moduleId: module.id,

        events: $.extend({}, BasePreviewPane.prototype.events, {
            'click .remove-button': function(e) {
                e.preventDefault();
                this.trigger('action:removeElement');
            },
            'click .update-button': function(e) {
                e.preventDefault();
                this.trigger('action:update', this.model.element);
            }
        }),

        /**
         * @constructor not overriden
         * (see views/pivot/config_popups/BasePreviewPane for constructor documentation)
         */

        renderFormView: function() {
            BasePreviewPane.prototype.renderFormView.call(this);
            this.children.formView.on('action:enterKey', function() {
                if(this.model.element.isValid(true)) {
                    this.trigger('action:update', this.model.element);
                }
            }, this);
        },

        buttonsTemplate: '\
            <a href="#" class="btn remove-button"><%- _("Remove").t() %></a>\
            <a href="#" class="btn btn-primary update-button"><%- _("Update").t() %></a>\
        '

    });

});