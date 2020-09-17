/**
 * @author sfishel
 *
 * A popup dialog view for inspecting/editing pivot elements in place
 *
 * Child Views:
 *
 * previewPane <views/pivot/config_popups/InspectElementPane or views/pivot/config_popups/InspectTimeFilterPane>
 *             the view that renders form controls for manipulating the element
 *
 * Custom Events:
 *
 * action:removeElement - triggered when the active element should be removed from the report
 * action:cancel - triggered when the dialog should be closed and the user's changes discarded
 * action:update - triggered when the dialog should be closed and user's changes applied
 */

define([
            'module',
            'collections/services/data/ui/Times',
            'models/shared/Application',
            'models/shared/User',
            'models/services/AppLocal',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            './InspectTimeFilterPane'
        ],
        function(
            module,
            Times,
            Application,
            User,
            AppLocal,
            DeclarativeDependencies,
            BaseView,
            InspectTimeFilterPane
        ) {

    var TimeRangeInspector = BaseView.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         element <sub-class of models.pivot.elements.BaseElement> the pivot element to inspect/edit
         *         appLocal <models.services.AppLocal> the local splunk app
         *         user <models.services/admin.User> the current user
         *         application: <models/shared/Application> the application state model
         *     }
         *     collection: {
         *         timePresets <collections.services.data.ui.Times> the user-specific preset time preferences
         *     }
         * }
         */

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            options = options || {};
            this.elementType = options.elementType;
        },

        render: function() {
            if(this.children.previewPane) {
                this.children.previewPane.remove();
            }
            this.children.previewPane = new InspectTimeFilterPane({
                model: {
                    element: this.model.element,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    application: this.model.application
                },
                collection: {
                    timePresets: this.collection.timePresets
                }
            });
            this.$el.append(this.children.previewPane.render().el);

            this.children.previewPane.on('action:update', function() {
                this.trigger('action:update', 'filter', this.model.element);
            }, this);

            return this;
        },

        onShown: function() {
            this.children.previewPane.onShown();
        }

    },
    {
        apiDependencies: {
            appLocal: AppLocal,
            user: User,
            application: Application,
            timePresets: Times
        }
    });

    return DeclarativeDependencies(TimeRangeInspector);

});