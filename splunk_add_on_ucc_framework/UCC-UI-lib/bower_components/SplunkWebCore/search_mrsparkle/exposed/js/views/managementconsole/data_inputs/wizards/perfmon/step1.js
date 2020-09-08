/**
 * Created by rtran on 5/26/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/MultiInputControl'
], function($, _, Backbone, module, BaseView, ControlGroup, MultiInputControl) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'modal-step form-horizontal',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.fwdObjects = this.model.getObjects();

            this.children.name = new ControlGroup({
                className: 'name control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.model.entry,
                    save: false
                },
                label: this.model.getLabel('name'),
                help: this.model.getHelpText('name'),
                enabled: this.model.isNew()
            });

            this.children.availableObjects = new ControlGroup({
                className: 'available-objects control-group',
                controlType: 'SyntheticSelect',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'object',
                    model: this.model.entry.content,
                    items: this.getAvailableObjectsList(),
                    className: 'btn-group view-count',
                    toggleClassName: 'btn',
                    popdownOptions: {detachDialog: true}
                },
                label: this.model.getLabel('object'),
                help: this.model.getHelpText('object'),
                tooltip: this.model.getTooltip('object')
            });

            this.children.instances = new ControlGroup({
                className: 'instances control-group',
                controlType: 'MultiInput',
                controlClass: 'controls-block',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'instances',
                    placeholder: _('optional').t()
                },
                tooltip: this.model.getTooltip('instances'),
                label: this.model.getLabel('instances')
            });

            this.children.interval = new ControlGroup({
                className: 'interval control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'interval',
                    model: this.model.entry.content,
                    save: false
                },
                label: this.model.getLabel('interval'),
                help: this.model.getHelpText('interval'),
                tooltip: this.model.getTooltip('interval')
            });

            this.updateCounters();
            this.listenTo(this.model.entry.content, 'change:object', function() {
                this.model.entry.content.unset('counters');
                this.updateCounters();
                this.reflowCountersControl();
            });
        },

        updateCounters: function() {
            var availableCounters = _.map(this.model.getCountersForObject(this.model.entry.content.get('object')), function (item) {
                return {label: item, value: item};
            });

            this.children.counters = new ControlGroup({
                className: 'counters control-group',
                controlType: 'Accumulator',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'counters',
                    model: this.model.entry.content,
                    save: false,
                    availableItems: availableCounters,
                    itemName: _('counter(s)').t(),
                    selectedItems: this.model.entry.content.get('counters')
                },
                label: this.model.getLabel('counters'),
                help: this.model.getHelpText('counters'),
                tooltip: this.model.getTooltip('counters')
            });
        },

        reflowCountersControl: function() {
            this.$('.counters-placeholder').html(this.children.counters.render().el);
        },

        getAvailableObjectsList: function() {
            var availableObjectsList = [];
            availableObjectsList.push({label: _('-- Select object --').t(), value: ''});
            _.each(this.fwdObjects, function (item) {
                availableObjectsList.push({label: item, value: item});
            }.bind(this));

            return availableObjectsList;
        },

        render: function() {
            this.$el.html(this.compiledTemplate());
            this.$('.collection-name-placeholder').html(this.children.name.render().el);
            this.$('.available-objects-placeholder').html(this.children.availableObjects.render().el);
            this.$('.counters-placeholder').html(this.children.counters.render().el);
            this.$('.instances-placeholder').html(this.children.instances.render().el);
            this.$('.polling-interval-placeholder').html(this.children.interval.render().el);
        },

        template: ' \
        <div class="collection-name-placeholder"></div> \
        <div class="available-objects-placeholder"></div> \
        <div class="counters-placeholder"></div> \
        <div class="instances-placeholder"></div> \
        <div class="polling-interval-placeholder"></div> \
        '
    });
});