/**
 * @author sfishel
 *
 * A delegate view to handle the column sorting behavior for a grid-based view
 *
 * Events:
 *
 * sort (aka ColumnSort.SORT) triggered when the user clicks on a sortable column header
 *      @param sortKey {String} the key for the sorted column
 *      @param sortDirection {String} either 'asc' (aka ColumnSort.ASCENDING) or 'desc' (aka ColumnSort.DESCENDING)
 *                                    the direction of the sort
 */

define(['jquery', 'underscore', 'backbone', 'views/shared/delegates/Base'], function($, _, Backbone, DelegateBase) {

    var CONSTS = {

        // CSS class names
        SORTABLE_ROW: 'sorts',
        NOT_SORTABLE_CLASS: 'not-sortable',
        SORT_DISABLED_CLASS: 'sort-disabled',
        SORTED_CLASS: 'active',
        SUPPRESS_SORT_CLASS: 'suppress-sort',

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

    return DelegateBase.extend({

        events: (function() {
            var events = {};
            events['click ' + SORTABLE_CELL_SELECTOR] = 'onColumnHeaderClick';
            return events;
        }()),

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} optional, a model that the view will keep up-to-date with sort information
         *                   using the attribute names 'sortKey' and 'sortDirection'
         *                   the view will also respond to external changes to those attributes
         *                   if a model is not given, one will be created and managed internally
         *     autoUpdate {Boolean} optional, defaults to false
         *                          whether to automatically update the view's DOM elements when the sort configuration changes
         *    {String} sortKeyAttr: (Optional) attribute to set sort key on  default is 'sortKey',
         *    {String} sortDirAttr: (Optional) attribute to set sort direction on default is 'sortDirection'
         * }
         */

        initialize: function() {
            if(!this.model) {
                this.model = new Backbone.Model();
            }

            var defaults = {
                sortKeyAttr: 'sortKey',
                sortDirAttr: 'sortDirection'
            };
            this.options = $.extend(true, defaults, this.options);

            this.autoUpdate = !!this.options.autoUpdate;
            this.activate();
        },

        startListening: function() {
            if(this.autoUpdate) {
                this.listenTo(this.model, 'change:' + this.options.sortKeyAttr + ' change:' + this.options.sortDirAttr, _.debounce(function() {
                    this.update();
                }, 0));
            }
        },

        /**
         * Updates the given DOM elements to match the current sorting configuration
         *
         * @param $rootEl <jQuery object> optional, defaults to the view's $el property
         */

        update: function($rootEl) {
            $rootEl = $rootEl || this.$el;
            var $thList = $rootEl.find(SORTABLE_CELL_SELECTOR),
                sortKey = this.model.get(this.options.sortKeyAttr),
                $activeTh = $thList.filter('[' + CONSTS.SORT_KEY_ATTR + '="' + sortKey + '"]'),
                sortDirection = this.model.get(this.options.sortDirAttr);
            $thList.removeClass(CONSTS.SORTED_CLASS)
                .find(SORTABLE_ICON_SELECTOR).removeClass(CONSTS.ASCENDING + ' ' + CONSTS.DESCENDING);
            $activeTh.addClass(CONSTS.SORTED_CLASS)
                .find(SORTABLE_ICON_SELECTOR).addClass(sortDirection === 'asc' ? CONSTS.ASCENDING : CONSTS.DESCENDING);
        },

        // ----- private methods ----- //

        onColumnHeaderClick: function(e) {
            e.preventDefault();

            // ignore clicks on headers with 'not-sortable' or 'sort-disabled' classes
            var $th = $(e.currentTarget);
            if($th.hasClass(CONSTS.NOT_SORTABLE_CLASS) || $th.hasClass(CONSTS.SORT_DISABLED_CLASS)) {
                return;
            }

            // ignore clicks on nested elements with 'suppress-sort' class
            var target = e.target;
            var currentTarget = e.currentTarget;
            while (target && (target !== currentTarget)) {
                if ($(target).hasClass(CONSTS.SUPPRESS_SORT_CLASS)) {
                    return;
                }
                target = target.parentNode;
            }

            // determine sort direction
            var sortKey, sortDirection;
            sortKey = $th.attr(CONSTS.SORT_KEY_ATTR);
            if ($th.hasClass('numeric')) {
                sortDirection = $th.find(SORTABLE_ICON_SELECTOR).hasClass(CONSTS.DESCENDING) ? 'asc' : 'desc';
            } else {
                sortDirection = $th.find(SORTABLE_ICON_SELECTOR).hasClass(CONSTS.ASCENDING) ? 'desc' : 'asc';
            }

            var data = {};
            data[this.options.sortKeyAttr] = sortKey;
            data[this.options.sortDirAttr] = sortDirection;

            this.model.set(data);
            this.trigger(CONSTS.SORT, sortKey, sortDirection);
        }

    }, CONSTS);

});
