define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/editorforms/stats/AggregateControl',
        'views/table/commandeditor/listpicker/Overlay'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        AggregateControlView,
        ListPickerOverlay
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'aggregates-container',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.aggregateControls = {};

                this.model.command.aggregates.each(function(aggregate) {
                    this.createAggregateControl(aggregate);
                }, this);
            },

            events: {
                'click .add-aggregate-field': function(e) {
                    e.preventDefault();
                    this.openFieldPicker();
                }
            },

            openFieldPicker: function() {
                if (this.children.fieldPickerOverlay) {
                    this.children.fieldPickerOverlay.deactivate({ deep: true }).remove();
                }

                this.children.fieldPickerOverlay = new ListPickerOverlay({
                    items: this.options.fieldPickerItems,
                    selectMessage: _('Select a field...').t(),
                    selectedValues: this.model.command.aggregates.pluck('columnGuid'),
                    multiselect: false,
                    required: true
                });

                this.children.fieldPickerOverlay.render().appendTo(this.$el);
                this.children.fieldPickerOverlay.slideIn();

                this.listenTo(this.children.fieldPickerOverlay, 'selectionDidChange', function() {
                    var columnGuids = this.model.command.aggregates.pluck('columnGuid'),
                        newColumnGuid = _.difference(this.children.fieldPickerOverlay.getSelectedValues(), columnGuids)[0],
                        newAggregateControl,
                        addedAggregate;

                    this.model.command.aggregates.add({ columnGuid: newColumnGuid });
                    addedAggregate = this.model.command.aggregates.last();

                    newAggregateControl = this.createAggregateControl(addedAggregate);
                    newAggregateControl.activate({ deep: true }).render().insertBefore(this.$('.add-field-container'));
                    newAggregateControl.openFunctionsPicker();
                });
            },

            createAggregateControl: function(aggregate) {
                var aggregateControl = new AggregateControlView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        aggregate: aggregate
                    },
                    fieldPickerItems: this.options.fieldPickerItems
                });
                this.children.aggregateControls[aggregateControl.cid] = aggregateControl;

                this.listenTo(aggregateControl, 'removeAggregate', function(view) {
                    this.model.command.aggregates.remove(view.model.aggregate);
                    view.deactivate({ deep: true }).remove();
                    delete this.children.aggregateControls[view.cid];
                });

                this.listenTo(aggregate.functions, 'add remove reset change', function() {
                    this.model.command.trigger('functionsChange');
                });

                return aggregateControl;
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));

                    _.each(this.children.aggregateControls, function(aggregateControlView) {
                        aggregateControlView.activate({ deep: true }).render().insertBefore(this.$('.add-field-container'));
                    }, this);
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded add-field-container">\
                    <a href="#" class="add-aggregate-field">\
                        <i class="icon-plus"></i>\
                        <%- _("Add a field to aggregate...").t() %>\
                    </a>\
                </div>\
            '
        });
    }
);