define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/Column',
        'views/Base'
    ],
    function(
        _,
        $,
        module,
        ColumnModel,
        BaseView
        ) {
        return BaseView.extend({
            moduleId: module.id,

            REAL_TEXT_WRAPPER_CLASS: '.real-text-wrapper',
            REAL_TEXT_CLASS: '.real-text',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'mousedown': function(e) {
                    if (!$(e.currentTarget).hasClass('disabled')) {
                        this.model.state.trigger('clearSelection');
                    }
                },

                'mouseup': function(e) {
                    if (!$(e.currentTarget).hasClass('disabled')) {
                        this.handleCellClick(e);
                    }
                }
            },

            handleCellClick: function(e) {
                var $cell = $(e.currentTarget),
                    textSelection = window.getSelection(),
                    $realTextWrapper = $cell.find(this.REAL_TEXT_WRAPPER_CLASS),
                    $realText = $realTextWrapper.find(this.REAL_TEXT_CLASS),
                    cellValue = $realText.length ? $realText.text() : null,
                    colIndex = $cell.data('col-index'),
                    // anchorOffset is where the selection starts, focus is where it ends. We want to normalize the
                    // start and end so it doesn't matter if the user selected text by dragging leftward or rightward.
                    startPosition = Math.min(textSelection.anchorOffset, textSelection.focusOffset),
                    endPosition = Math.max(textSelection.anchorOffset, textSelection.focusOffset),
                    selectedText = textSelection.toString();

                this.model.state.trigger('clearDragability');
                if (/\S/.test(selectedText) && (startPosition !== endPosition) && this.isTextSelectable() &&
                        // using mouseup so we need to make sure we are not selecting the more/less link
                        !$(e.target).is('a') &&
                        // These two statements will check that the text selection is inside of the text element
                        // and not anywhere outside of it
                        textSelection.focusNode && textSelection.focusNode.parentNode == $realText.get(0) &&
                        textSelection.anchorNode && textSelection.anchorNode.parentNode == $realText.get(0)) {

                    this.selectText(selectedText, startPosition, endPosition);

                    this.model.state.trigger('setSelectedColumn', colIndex);

                    this.model.dataset.entry.content.set({
                        'dataset.display.selectedColumnValue': cellValue,
                        'dataset.display.selectedText': selectedText,
                        'dataset.display.selectedStart': startPosition,
                        'dataset.display.selectedEnd': endPosition,
                        'dataset.display.selectionType': 'text',
                        'dataset.display.isSelectionError': false
                    });

                } else {
                    this.handleCellSelect($cell, colIndex, cellValue);
                }
            },

            handleCellSelect: function($cell, colIndex, cellValue) {
                $cell.addClass('selected');
                this.model.state.trigger('setSelectedColumn', colIndex);

                this.model.dataset.entry.content.set({
                    'dataset.display.selectedColumnValue': cellValue,
                    'dataset.display.selectionType': 'cell',
                    'dataset.display.isSelectionError': this.$el.hasClass('mismatched-type')
                });
            },

            selectText: function(selectedText, startPosition, endPosition) {
                var $cell = this.$el,
                    $realTextWrapper = $cell.find(this.REAL_TEXT_WRAPPER_CLASS),
                    $realText = $realTextWrapper.find(this.REAL_TEXT_CLASS),
                    cellValue = $realText.text(),
                    newHtml = _.template(this.highlightedTemplate, {
                        startValue: cellValue.substr(0, startPosition),
                        selectedText: selectedText,
                        endValue: cellValue.substr(endPosition)
                    });

                $cell.addClass('text-selected');
                $cell.find('div.selection-container').prepend('<span class="selection"></span>');
                $cell.find('div span.selection').html(newHtml);
            },

            isTextSelectable: function() {
                var columnModel = this.model.column,
                    type = columnModel.get('type');

                return !this.model.cell.isNull() && !(columnModel.isEpochTime() ||
                    type === ColumnModel.TYPES.NUMBER ||
                    type === ColumnModel.TYPES.BOOLEAN);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    result: this.result
                }));
                return this;
            },

            template: '<div class="selection-container"><div class="' + this.REAL_TEXT_WRAPPER_CLASS + '"><span class="' + this.REAL_TEXT_CLASS + '"><%- result %></span></div></div>',
            
            highlightedTemplate: '<%- startValue %><span class="highlight"><%- selectedText %></span><%- endValue %>'
        });
    }
);


