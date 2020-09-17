define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/table/commandeditor/editorforms/stats/SplitByRow',
        'views/table/commandeditor/listpicker/Overlay',
        'jquery.ui.sortable'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        SplitByRowView,
        ListPickerOverlay,
        undefined // jquery.ui.sortable
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'split-by-container',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.splitByRows = {};

                this.model.command.editorValues.each(function(splitBy) {
                    this.createSplitByRow(splitBy);
                }, this);
            },

            events: {
                'click .add-split-by-field': function(e) {
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
                    selectedValues: this.model.command.editorValues.pluck('columnGuid'),
                    multiselect: false,
                    required: true
                });

                this.children.fieldPickerOverlay.render().appendTo(this.$el);
                this.children.fieldPickerOverlay.slideIn();

                this.listenTo(this.children.fieldPickerOverlay, 'selectionDidChange', function() {
                    var columnGuids = this.model.command.editorValues.pluck('columnGuid'),
                        newColumnGuid = _.difference(this.children.fieldPickerOverlay.getSelectedValues(), columnGuids)[0];

                    this.model.command.editorValues.add({ columnGuid: newColumnGuid });
                    var newSplitByRow = this.createSplitByRow(this.model.command.editorValues.last());
                    newSplitByRow.activate({ deep: true }).render().appendTo(this.$('.split-by-rows-container'));
                });
            },

            createSplitByRow: function(splitBy) {
                var splitByRow = new SplitByRowView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        splitBy: splitBy
                    },
                    fieldPickerItems: this.options.fieldPickerItems
                });
                this.children.splitByRows[splitByRow.cid] = splitByRow;

                this.listenTo(splitByRow, 'removeSplitBy', function(view) {
                    this.model.command.editorValues.remove(view.model.splitBy);
                    view.deactivate({ deep: true }).remove();
                    delete this.children.splitByRows[view.cid];
                });

                return splitByRow;
            },

            setSortingOnContainer: function() {
                this.$('.split-by-rows-container').sortable(
                    {
                        axis: 'y',
                        stop: _.bind(function(e, ui) {
                            this.updateFieldOrder(e, ui);
                        }, this)
                    }
                );
            },

            updateFieldOrder: function(e, ui) {
                var idArray = this.$('.split-by-rows-container').sortable('toArray'),
                    guid = ui.item.length > 0 && ui.item[0].id,
                    newIndex = idArray.indexOf(guid),
                    modelToMove = this.model.command.editorValues.findWhere({ columnGuid: guid });

                this.model.command.editorValues.remove(modelToMove);
                this.model.command.editorValues.add(modelToMove, { at: newIndex });
            },

            render: function() {
                var splitByRows = this.children.splitByRows,
                    splitByRowGuid;

                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));

                    for (splitByRowGuid in splitByRows) {
                        if (splitByRows.hasOwnProperty(splitByRowGuid)) {
                            splitByRows[splitByRowGuid].activate({ deep: true }).render().appendTo(this.$('.split-by-rows-container'));
                        }
                    }

                    this.setSortingOnContainer();
                }

                return this;
            },

            template: '\
                <div class="split-by-rows-container commandeditor-section-sortable"></div>\
                <div class="commandeditor-section-padded add-split-by-container">\
                    <a href="#" class="add-split-by-field">\
                        <i class="icon-plus"></i>\
                        <%- _("Add a split by field...").t() %>\
                    </a>\
                </div>\
            '
        });
    }
);