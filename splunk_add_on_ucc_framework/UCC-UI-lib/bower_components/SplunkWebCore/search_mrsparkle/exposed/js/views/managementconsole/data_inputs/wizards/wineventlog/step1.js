/**
 * Created by rtran on 5/26/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup'
], function($, _, Backbone, module, BaseView, ControlGroup) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'modal-step form-horizontal',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.logs = this.model.getEventLogTypes();

            var availableItems = [],
                selectedItems = [];
            _.each(this.logs, function (name) {
                availableItems.push({label: name, value: name});
            });

            this.children.eventLogs = new ControlGroup({
                className: 'evt-logs control-group',
                controlType: 'Accumulator',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.model.entry,
                    save: false,
                    availableItems: availableItems,
                    selectedItems: selectedItems
                },
                label: this.model.getLabel('eventLogs'),
                help: this.model.getHelpText('eventLogs'),
                tooltip: this.model.getTooltip('eventLogs')
            });
        },

        render: function() {
            this.$el.append(this.children.eventLogs.render().el);
        }
    });
});