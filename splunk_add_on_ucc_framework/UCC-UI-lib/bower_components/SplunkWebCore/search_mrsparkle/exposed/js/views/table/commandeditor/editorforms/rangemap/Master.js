define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/rangemap/RangeRow',
        'views/table/commandeditor/editorforms/rangemap/FieldControls'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        RangeRowView,
        FieldControls
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-rangemap',
            initializeEmptyRequiredColumn: true,
            
            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.fieldControls = new FieldControls({
                    model: this.model,
                    fieldPickerItems: this.getFieldPickerItems()
                });

                this.children.rows = {};

                this.model.command.editorValues.each(function(editorValue) {
                    this.createRangeRow(editorValue);
                }, this);
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .add-range': function(e) {
                    e.preventDefault();
                    this.addNewRow();
                }
            }),

            startListening: function() {
                BaseEditorView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.model.command.editorValues, 'change:upperLimit', this.updateLowerLimit);
            },

            createRangeRow: function(editorValue) {
                var rowView = this.children.rows[editorValue.cid] = new RangeRowView({
                    model: {
                        command: {
                            editorValue: editorValue
                        }
                    },
                    value: this.model.command.getFieldNameFromGuid(editorValue.cid)
                });
                this.listenTo(rowView, 'removeRow', function(options) {
                    this.removeRow(options.cid);
                });
                return rowView;
            },

            addNewRow: function() {
                var newRowView;
                this.model.command.editorValues.add({
                    value: '',
                    lowerLimit: this.model.command.editorValues.last().get('upperLimit') // get previous editorValues's upperLimit
                });
                newRowView = this.createRangeRow(this.model.command.editorValues.last());
                newRowView.activate({ deep: true }).render().appendTo(this.getRowsContainer());
            },

            removeRow: function(cid) {
                var modelToRemove = this.model.command.editorValues.get(cid),
                    modelToRemoveIndex = this.model.command.editorValues.indexOf(modelToRemove),
                    previousModel = this.model.command.editorValues.at(modelToRemoveIndex - 1);
                this.model.command.editorValues.remove(modelToRemove);
                this.children.rows[cid].remove();
                delete this.children.rows[cid];

                this.updateLowerLimit(previousModel);
            },

            updateLowerLimit: function(editorValue) {
                var changedModelIndex = this.model.command.editorValues.indexOf(editorValue),
                    nextModel = this.model.command.editorValues.at(changedModelIndex + 1);
                if (nextModel) {
                    nextModel.set('lowerLimit', editorValue.get('upperLimit'));
                }
            },

            getRowsContainer: function() {
                return this.$('.range-rows-section');
            },

            handleApply: function(options) {
                this.addNewField();
                BaseEditorView.prototype.handleApply.call(this, options);
            },

            render: function() {
                var rowsContainer;
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    this.children.fieldControls.render().appendTo(this.$('.field-controls-section'));

                    rowsContainer = this.getRowsContainer();
                    _.each(this.children.rows, function (rowView) {
                        rowView.render().appendTo(rowsContainer);
                    }, this);

                    this.appendButtons(this.$('.commandeditor-section-apply'));
                }
                return this;
            },

            template: '\
                <div class="commandeditor-section commandeditor-section-padded field-controls-section"></div>\
                <div class="commandeditor-section commandeditor-section-scrolling range-rows-section"></div>\
                <div class="commandeditor-section commandeditor-section-padded">\
                    <a class="add-range"><i class="icon-plus"></i> <%- _("Add range...").t() %></a>\
                </div>\
                <div class="commandeditor-section-apply"></div>\
            '
        });
    }
);
