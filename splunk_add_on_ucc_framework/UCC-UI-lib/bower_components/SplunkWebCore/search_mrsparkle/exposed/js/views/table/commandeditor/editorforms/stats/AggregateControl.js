define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/editorforms/stats/FunctionsControl',
        'views/shared/controls/ControlGroup',
        'views/table/commandeditor/listpicker/Control'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        FunctionsControlView,
        ControlGroup,
        ListOverlayControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-section-padded aggregate-control',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.fieldControl = new ControlGroup({
                    label: _('Aggregate field').t(),
                    controlType: 'ListOverlay',
                    controlTypes: { 'ListOverlay': ListOverlayControl },
                    size: 'small',
                    controlOptions: {
                        model: this.model.aggregate,
                        modelAttribute: 'columnGuid',
                        toggleClassName: 'btn-overlay-toggle',
                        listOptions: {
                            items: this.options.fieldPickerItems,
                            selectMessage: _('Select a field...').t(),
                            selectedValues: this.model.command.aggregates.pluck('columnGuid')
                        }
                    }
                });

                this.children.functionsControl = new FunctionsControlView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        aggregate: this.model.aggregate
                    }
                });
            },

            startListening: function(options) {
                // If the column guid changes, we're just gonna blow away any functions that were there.
                this.listenTo(this.model.aggregate, 'change:columnGuid', function() {
                    this.model.aggregate.functions.reset();
                });
            },

            openFunctionsPicker: function() {
                this.children.functionsControl && this.children.functionsControl.openFunctionsPicker();
            },

            events: {
                'click .delete-aggregate-control': function(e) {
                    e.preventDefault();
                    this.trigger('removeAggregate', this);
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({}));

                    this.children.fieldControl.activate({ deep: true }).render().appendTo(this.$el);
                    this.children.functionsControl.activate({ deep: true }).render().appendTo(this.$el);
                }

                return this;
            },

            template: '\
                <a class="delete-aggregate-control commandeditor-group-remove">\
                    <i class="icon-x"></i>\
                </a>\
            '
        });
    }
);