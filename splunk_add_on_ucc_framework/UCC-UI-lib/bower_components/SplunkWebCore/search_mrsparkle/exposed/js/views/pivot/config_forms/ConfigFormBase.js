/**
 * @author sfishel
 *
 * An abstract base view for the form controls required to edit a pivot report element.
 *
 * Custom Events:
 *
 * "action:enterKey", triggered by the view to alert any listeners that the user hit the enter key while
 *      the form had focus
 *
 * "changeContents", triggered by the view to alert any listeners that the contents have changed in a way that
 *      might alter the size of the form element
 */

define([
            'jquery',
            'underscore',
            'views/pivot/VisualizationConfigSubpanel',
            'helpers/pivot/PivotVisualizationManager'
        ],
        function(
            $,
            _,
            VisualizationConfigSubpanel,
            pivotVizManager
        ) {

    var ENTER_KEY = 13;

    return VisualizationConfigSubpanel.extend({

        events: $.extend({}, VisualizationConfigSubpanel.prototype.events, {
            'keypress': function(e) {
                // emit a custom event when the enter key is pressed
                if(e.which === ENTER_KEY) {
                    e.preventDefault();
                    // blur the target element to make sure any pending changes go through
                    $(e.target).blur();
                    this.trigger('action:enterKey');
                }
            }
        }),

        initialize: function() {
            this.$el.addClass('pivot-element-form');
            this.options.hideFieldPicker = true;
            this.options.panel = _.extend({}, this.options.panel, {
                pivotFormElements: _(this.options.panel.pivotFormElements).reject(function(pivotFormElement) {
                    return pivotFormElement.type === pivotVizManager.REPORT_CONTROL;
                }, this)
            });
            VisualizationConfigSubpanel.prototype.initialize.call(this, this.options);
        },

        stopListening: function() {
            VisualizationConfigSubpanel.prototype.stopListening.call(this);
            this.children = {};
        }

    });

});
