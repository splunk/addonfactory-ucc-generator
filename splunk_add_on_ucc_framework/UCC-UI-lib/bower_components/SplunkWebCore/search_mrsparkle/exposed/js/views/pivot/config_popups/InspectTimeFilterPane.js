/**
 * @author sfishel
 *
 * A view for inspecting/editing a timestamp filter element.
 *
 * Child Views:
 *
 * formView <views/pivot/config_forms/filters/TimestampFilter> the view with form controls for the editing the element
 *
 * Custom Events:
 *
 * action:removeElement - triggered when the active element should be removed from the report
 * action:update - triggered when the current edit flow should be completed and any changes applied
 */

define([
            'underscore',
            'backbone',
            'module',
            'views/Base',
            'views/pivot/config_forms/filters/TimestampFilterForm'
        ],
        function(
            _,
            Backbone,
            module,
            BaseView,
            TimestampFilterForm
        ) {

    return BaseView.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         element: <models.pivot.elements.filters.TimestampFilter> the model to operate on
         *         appLocal <models.services.AppLocal> the local splunk app
         *         user <models.services.admin.User> the current user
         *         application: <models.Application> the application state model
         *     }
         *     collection: {
         *         timePresets (optional) <collections.services.data.ui.Times> the user-specific preset time preferences
         *     }
         * }
         */

        // ------ constructor not overridden ---- //

        render: function() {
            if(this.children.formView) {
                this.children.formView.remove();
            }
            this.children.formView = new TimestampFilterForm({
                model: {
                    element: this.model.element,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    application: this.model.application
                },
                collection: {
                    // the entire collection object is an optional parameter to the constructor, handle that here
                    timePresets: (this.collection && this.collection.timePresets) || new Backbone.Collection()
                }
            });

            var html = _(this.template).template({ model: this.model.element });
            this.$el.html(html);
            this.$('.form-view-placeholder').replaceWith(this.children.formView.render().el);

            this.children.formView.on('action:timeRangeSelected', function() {
                this.trigger('action:update');
            }, this);

            return this;
        },

        remove: function() {
            if(this.children.formView) {
                this.children.formView.remove();
            }
            BaseView.prototype.remove.call(this);
            return this;
        },

        onShown: function() {
            this.children.formView.onShown();
        },

        template: '\
            <div class="form-view-placeholder"></div>\
        '

    });

});