/**
 * Created by ykou on 8/8/14.
 */
define([
    'jquery',
    'underscore',
    'views/shared/delegates/ColumnSort'
], function(
    $,
    _,
    ColumnSort
) {
    var CONSTS = {

        // CSS class names
        SORTABLE_ROW: 'sorts',
        NOT_SORTABLE_CLASS: 'not-sortable',
        SORT_DISABLED_CLASS: 'sort-disabled',
        SORTED_CLASS: 'active',

        // Enum strings
        ASCENDING: 'asc',
        DESCENDING: 'desc',

        // Data attributes
        SORT_KEY_ATTR: 'data-sort-key',

        // Events
        SORT: 'sort'

    };

    var SORTABLE_CELL_SELECTOR = 'th.' + CONSTS.SORTABLE_ROW,
        SORTABLE_ICON_SELECTOR = 'i.icon-sorts';

    var DEFAULT_SUB_SORT_DIR = 'desc';

    return ColumnSort.extend({
        /**
         * example: PeerGrid.js: Status column.
         */

        update: function($rootEl) {
            $rootEl = $rootEl || this.$el;
            var $thList = $rootEl.find(SORTABLE_CELL_SELECTOR),
                sortKey = this.model.get(this.options.sortKeyAttr);
            if (sortKey instanceof Array) {
                sortKey = sortKey.join(' ');
            }
            var $activeTh = $thList.filter('[' + CONSTS.SORT_KEY_ATTR + '="' + sortKey + '"]'),
                sortDirection = this.model.get(this.options.sortDirAttr);

            if (typeof(sortDirection) === 'string') {
                sortDirection = sortDirection.split(' ')[0];
            }
            if (sortDirection instanceof Array) {
                sortDirection = sortDirection[0];
            }
            $thList.removeClass(CONSTS.SORTED_CLASS)
                .find(SORTABLE_ICON_SELECTOR).removeClass(CONSTS.ASCENDING + ' ' + CONSTS.DESCENDING);
            $activeTh.addClass(CONSTS.SORTED_CLASS)
                .find(SORTABLE_ICON_SELECTOR).addClass(sortDirection === 'asc' ? CONSTS.ASCENDING : CONSTS.DESCENDING);
        },
        onColumnHeaderClick: function(e) {
            e.preventDefault();
            var $th = $(e.currentTarget);
            if($th.hasClass(CONSTS.NOT_SORTABLE_CLASS) || $th.hasClass(CONSTS.SORT_DISABLED_CLASS)) {
                return;
            }
            var sortKey = $th.attr(CONSTS.SORT_KEY_ATTR),
                sortDirection = $th.find(SORTABLE_ICON_SELECTOR).hasClass(CONSTS.DESCENDING) ? 'asc' : 'desc';

            var data = {};
            data[this.options.sortKeyAttr] = sortKey.split(' ');
            data[this.options.sortDirAttr] = [sortDirection, DEFAULT_SUB_SORT_DIR];

            this.model.set(data);
            this.trigger(CONSTS.SORT, sortKey, sortDirection);
        }
    });
});