/**
 * @author sfishel
 *
 * The view for editing a timestamp filter pivot report element.
 */

define(
    [
        'underscore',
        'backbone',
        'module',
        'models/shared/TimeRange',
        'views/Base',
        'views/shared/timerangepicker/dialog/Master'
    ],
    function(_, Backbone, module, TimeRange, BaseView, TimeRangeDialog) {
        
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

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                // the entire collection object is an optional parameter to the constructor, handle that here
                this.collection = this.collection || {};
                this.timeRangeDialog = new TimeRangeDialog({
                    model: {
                        timeRange: this.model.element.timeRange,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        application: this.model.application
                    },
                    collection: this.model.element.timePresets
                });

                this.model.element.on('change', function() {
                    this.trigger('action:timeRangeSelected');
                }, this);
            },

            render: function() {
                this.$el.append(this.timeRangeDialog.render().el);
                this.model.element.timeRange.trigger("prepopulate");
                return this;
            },

            remove: function() {
                this.model.element.timeRange.off(null, null, this);
            },

            onShown: function() {
                this.timeRangeDialog.onShown();
            }

        });
    }
);