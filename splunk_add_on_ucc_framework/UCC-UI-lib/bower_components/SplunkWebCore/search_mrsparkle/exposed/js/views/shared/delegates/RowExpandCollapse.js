/**
 * @author sfishel
 *
 * A delegate view to handle the row expand/collapse behavior for a grid-based view
 *
 * Events:
 *
 * rowExpand (aka RowExpandCollapse.ROW_EXPAND) triggered when the user clicks to expand a row
 *    @param rowId {String} the id of the row that was just expanded
 *    @param expandedIds {Array<String>} a list of ids of the currently expanded rows
 *                                      (will include the newly expanded row)
 *
 * rowCollapse (aka RowExpandCollapse.ROW_COLLAPSE) triggered when the user clicks to collapse a row
 *     @param rowId {String} the id of the row that was just collapsed
 *     @param expandedIds {Array<String>} a list of ids of the currently expanded rows
 *                                        (will not include the recently collapsed row)
 *
 * rowToggle (aka RowExpandCollapse.ROW_TOGGLE) triggered when a row is collapsed or expanded
 *     @param expandedIds {Array<String>} a list of the ids of the currently expanded rows
 */

define(['jquery', 'underscore', 'views/shared/delegates/Base'], function($, _, DelegateBase) {

    var CONSTS = {

        // CSS class names
        HEADER_CELL_CLASS: 'col-info',
        TOGGLE_CELL_CLASS: 'expands',
        EXPANDED_ROW_CLASS: 'expanded',

        // Data attributes
        ROW_ID_ATTR: 'data-row-expand-collapse-id',

        // Events
        ROW_EXPAND: 'rowExpand',
        ROW_COLLAPSE: 'rowCollapse',
        ROW_TOGGLE: 'rowToggle',

        HEADER_CELL_MARKUP: '<i class="icon-info"></i>',
        COLLAPSED_CELL_MARKUP: '<a href="#"><i class="icon-chevron-right"></i></a>',
        EXPANDED_CELL_MARKUP: '<a href="#"><i class="icon-chevron-down"></i></a>'
    };

    var EXPAND_BUTTON_SELECTOR = 'tbody > tr > td.' + CONSTS.TOGGLE_CELL_CLASS;

    return DelegateBase.extend({
        events: (function() {
            var events = {};
            events['click ' + EXPAND_BUTTON_SELECTOR] = 'onToggleCellClick';
            return events;
        })(),

        /**
         * @constructor
         * @param options {Object} {
         *     expandedIds {Array<String>} optional, defaults to []
         *                                 the initial list of expanded row ids
         *     autoUpdate {Boolean} optional, defaults to false
         *                          whether to automatically update the view's DOM elements when a row is toggled
         * }
         */

        initialize: function() {
            DelegateBase.prototype.initialize.apply(this, arguments);
            this.expandedIds = this.options.expandedIds || [];
            this.autoUpdate = !!this.options.autoUpdate;
        },

        /**
         * Updates the given DOM elements to match the state of expanded/collapsed rows
         *
         * @param $rootEl {jQuery object} optional, defaults to the view's $el property
         */

        update: function($rootEl) {
            $rootEl = $rootEl || this.$el;

            $rootEl.find('thead > tr > th.' + CONSTS.HEADER_CELL_CLASS).each(function() {
                var $this = $(this);
                if($this.is(':empty')) {
                    $this.html(CONSTS.HEADER_CELL_MARKUP);
                }
            });

            var that = this;
            $rootEl.find(EXPAND_BUTTON_SELECTOR).each(function() {
                var $this = $(this),
                    $parentRow = $this.closest('tr'),
                    rowId = $parentRow.attr(CONSTS.ROW_ID_ATTR);

                if(_(that.expandedIds).indexOf(rowId) > -1) {
                    $parentRow.addClass(CONSTS.EXPANDED_ROW_CLASS);
                    $this.html(CONSTS.EXPANDED_CELL_MARKUP);
                }
                else {
                    $parentRow.removeClass(CONSTS.EXPANDED_ROW_CLASS);
                    $this.html(CONSTS.COLLAPSED_CELL_MARKUP);
                }
            });
        },


        reset: function() {
            this.expandedIds = [];
        },

        // ----- private methods ----- //

        onToggleCellClick: function(e) {
            e.preventDefault();

            var target = $(e.target),
                $tr = target.closest('tr');

            if($tr.hasClass('more-info')){
                $tr = $tr.prev('tr');
            }

            if($tr.children('td.'+CONSTS.TOGGLE_CELL_CLASS).is('.disabled')){
                return;
            }

            var rowId = $tr.attr(CONSTS.ROW_ID_ATTR);

            if($tr.hasClass(CONSTS.EXPANDED_ROW_CLASS)) {
                this.onRowCollapse(rowId, e, $tr);
            }
            else {
                this.onRowExpand(rowId, e);
            }
            this.trigger(CONSTS.ROW_TOGGLE, this.expandedIds, e);
        },

        onRowCollapse: function(rowId, e, row) {
            this.expandedIds = _(this.expandedIds).without(rowId);
            if(this.autoUpdate) {
                this.update();
            }
            this.trigger(CONSTS.ROW_COLLAPSE, rowId, this.expandedIds, e, row);
        },

        onRowExpand: function(rowId, e) {
            this.expandedIds = _.union(this.expandedIds, [rowId]);
            if(this.autoUpdate) {
                this.update();
            }
            this.trigger(CONSTS.ROW_EXPAND, rowId, this.expandedIds, e);
        }

    }, CONSTS);

});
