define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/commands/Base',
        'views/shared/datasettable/shared/TableCell'
    ],
    function(
        _,
        $,
        module,
        CommandModel,
        BaseTableCell
        ) {
        return BaseTableCell.extend({
            moduleId: module.id,
            className: 'top-results-cell',

            attributes: function() {
                return {
                    'data-field': this.options.result.name,
                    'data-col-index': this.options.colIndex
                };
            },

            initialize: function() {
                BaseTableCell.prototype.initialize.apply(this, arguments);
                this.result = this.options.result;
            },

            startListening: function() {
                this.listenTo(this.model.state, 'setValueSelection', this.setSelection);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
            },

            setSelection: function(args) {
                var columnName = args.columnName,
                    selectedValue = args.selectedValue,
                    currentColumnIsSelected = this.model.column.get('name') === columnName,
                    currentCellIsSelected = selectedValue === this.result.name;

                if (currentColumnIsSelected) {
                    if (currentCellIsSelected) {
                        // Is cell selection
                        this.$el.addClass('selected');
                    }
                }
            },

            enableSelection: function(enable) {
                if (enable) {
                    this.$el.removeClass('disabled');
                } else {
                    this.$el.addClass('disabled');
                }
            },

            handleCutSelection: function() {
                if (this.$el.hasClass('column-selected')) {
                    this.$el.addClass('column-cut');
                }
            },

            handleClearCutSelection: function() {
                this.$el.removeClass('column-cut');
            },

            // Do not allow text selection in Data Summary Mode
            isTextSelectable: function() {
                return false;
            },

            render: function() {
                var currentCommandModel = this.model.dataset.getCurrentCommandModel(),
                    shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid();

                this.$el.html(this.compiledTemplate({
                    _: _,
                    result: this.result
                }));

                this.enableSelection(!shouldDisableSelection);

                return this;
            },

            template: '\
                <span class="result-bar" style="width:<%- result.width %>%"></span>\
                <div class="result-field selection-container"><div class="real-text-wrapper"><span class="real-text"><%- result.name %></span></div></div>\
                <span class="result-value"><%- result.percentage %>%</span>\
            '
        });
    }
);


