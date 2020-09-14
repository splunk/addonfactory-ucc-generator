define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/results_table/ResultsTableMaster',
        'views/shared/ResultsTableDrillDownPopTart',
        'views/shared/delegates/Modalize',
        'util/keyboard'
    ],
    function(
        $,
        _,
        module,
        ResultsTable,
        ResultsTableDrillDownPopTart,
        Modalize,
        keyboard
    )
    {
        return ResultsTable.extend({
            moduleId: module.id,
            /**
             * @constructor
             * @param options {Object} {
             *    model: {
             *        searchData: <models/services/search/jobs/ResultsRow> the search results in row-major format,
             *        searchDataParams: {Model} a model containing the fetch data for the results, search and drilldown info,
             *        config: <model> the table format settings,
             *        application: <models.Application>,
             *        state: <BaseModel>
             *        
             *    },
             *    {String} enableTableDock: (Optional) whether or not to dock table header. defalut is true,
             *    {Number} tableDockOffset: (Optional) the amount to offset the table header from the top when docked
             *    {Boolean} sortableFields (Optional) disable/enable the sortable fields. default is true,
             * }
             */
            initialize: function() {
                this.options.splitHighlight = false;
                this.children.modalize = new Modalize({
                    el: this.el,
                    tbody: 'tbody'
                });
                this.model.state.set('isModalized', false);
                this.pendingUpdate = false;
                ResultsTable.prototype.initialize.call(this, this.options);
            },
            events: $.extend({}, ResultsTable.prototype.events, {
                'keydown tbody tr': function(e) {
                    if (e.which === keyboard.KEYS.TAB && this.model.state.get('isModalized')) {
                        var rowDrillDown = this.model.config.get('display.statistics.drilldown') === 'row';
                        keyboard.handleCircularTabbing($(e.target).closest('tr'), e, rowDrillDown);
                    }
                }
            }),
            startListening: function() {
                ResultsTable.prototype.startListening.apply(this, arguments);
                this.listenTo(this.children.modalize, 'unmodalize', function() {
                    this.model.state.set('isModalized', false);
                    if (this.pendingUpdate) {
                        this.pendingUpdate = false;
                        this.invalidate('updateViewPass');
                    }
                });
                this.listenTo(this.model.state, 'change:isModalized', function(model, value) {
                    if (!value) {
                        if (this.children.tableDock) {
                            this.children.tableDock.enable();
                        }
                        this.children.modalize.debouncedCleanup();
                    }
                });
            },
            deactivate: function(options) {
                if (!this.active) {
                    return ResultsTable.prototype.deactivate.apply(this, arguments);
                }

                this.model.state.set('isModalized', false);
                this.pendingUpdate = false;
                
                return ResultsTable.prototype.deactivate.apply(this, arguments);
            },
            emitDrilldownEvent: function(clickMeta) {
                var $clickTarget = $(clickMeta.originalEvent.target),
                    rowDrillDown = clickMeta.type === 'row',
                    $toggle,
                    $pointTo,
                    injectSpan = false,
                    text;

                if (rowDrillDown) {
                    $toggle = $clickTarget.closest('tr');
                    $pointTo = $clickTarget.is('tr') ? $clickTarget.find('td[data-cell-index]').first() : $clickTarget.closest('td');
                } else {
                    $toggle = $clickTarget;
                    $pointTo = $toggle;
                }

                if (this.children.resultsTableDrillDownPopTart) {
                    // This will be true if the user clicks on the toggle cell while the dialog is already open.
                    var popTartWasShown = this.children.resultsTableDrillDownPopTart.shown;
                    this.children.resultsTableDrillDownPopTart.hide();
                    this.children.resultsTableDrillDownPopTart.remove();
                    this.stopListening(this.children.resultsTableDrillDownPopTart);
                    delete this.children.resultsTableDrillDownPopTart;
                    // In the case of a second click on the same toggle, keep the modalization so the row doesn't disappear,
                    // but make sure the dialog remains hidden.
                    if (popTartWasShown) {
                        return;
                    }
                }

                if (!this.model.state.get('isModalized')) {
                    this.model.state.set('isModalized', true);
                    if (this.children.tableDock) {
                        this.children.tableDock.disable();
                    }
                    this.children.modalize.debouncedShow(clickMeta.rowIndex);
                }

                if (!rowDrillDown) {
                    text = $.trim($clickTarget.text());
                    injectSpan = text && !$clickTarget.children().length;
                }

                if (injectSpan) {
                    /**
                     * Wrap the inner text in a span element so that the drilldown can be shown 
                     * directly below the inner text rather than below the entire cell.
                     *
                     * NOTE: Ultimately, the text value should be pre-wrapped with a <span> in the
                     * StringCellRenderer.js file; however, in the meantime, this does
                     * so on the fly.
                     */
                    $pointTo.html($('<span>').text(text));
                    $pointTo = $pointTo.find('span');
                }
                
                this.children.resultsTableDrillDownPopTart = new ResultsTableDrillDownPopTart({
                    clickMeta: clickMeta,
                    onHiddenRemove: true,
                    model: {
                        application: this.model.application,
                        results: this.model.searchData
                    },
                    scrollContainer: $pointTo.closest('.results-table'),
                    ignoreToggleMouseDown: true
                });

                if (injectSpan) {
                    this.listenToOnce(this.children.resultsTableDrillDownPopTart, 'hidden', function() {
                        $clickTarget.text(text);
                    });
                }

                this.children.resultsTableDrillDownPopTart.render().appendTo($('body')).show($pointTo, {
                    $toggle: $toggle
                });
                this.listenTo(this.children.resultsTableDrillDownPopTart, 'drilldown', _.bind(this.trigger, this, 'drilldown'));
            },
            updateView: function() {
                if (this.model.state.get('isModalized')) {
                    this.pendingUpdate = true;
                } else {
                    ResultsTable.prototype.updateView.apply(this, arguments);
                }
            }
        });
    }
);
