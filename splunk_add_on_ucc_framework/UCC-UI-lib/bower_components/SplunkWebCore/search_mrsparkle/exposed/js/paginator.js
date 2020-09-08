(function(ns) {
    /**
     * Range helper utility if you need to iteration over a sequence of numbers.
     *
     * @param {Number} start
     * @param {Number} (Optional) stop
     * @param {Number} (Optional) step
     */ 
    ns.range = function() {
        var l = arguments, start, stop, step, r = [];
        if (l.length == 1) {
            start=0;
            stop=l[0];
            step=1;
        } else {
            start=l[0];
            stop=l[1];
            step = (l[2]==null) ? 1 : l[2];
        }
        for (var i=start; (step>0) ? i<stop : i>stop; i+=step) {
            r.push(i);
        }
        return r;
    };

    /**
     * Class to enable pagination .
     * Based on Google search pagination pattern - http://google.com
     *
     * Example:
     * p = Google(10000)
     * if p.previous_exists()
     *     logger.debug("Can have a previous page")
     * for (page in p.page_range) { 
     *     logger.debug("Page: %s" % p.page_range[page])
     *     logger.debug("This page is active:%s" % p.active(p.page_range[page]))
     * }
     * if p.next_exists()
     *     logger.debug("Can have a next page")
     *
     * @param {Number} item_count The total count of items to page through.
     * @param {Object} options An one-level deep object literal containing options:
     *        @param {Number} max_items_page The maximum amount of items to display per page. Defaults to 10.
     *        @param {Number} max_pages The maximum amount of pages. Defaults to 10.
     *        @param {Number} item_offset A zero-index offset used to denote your position relative to pages. Defaults to 0.
     */
    ns.Google = function(item_count, options) {
        options = options || {};
        this.item_count = item_count;
        this.max_items_page = options.max_items_page || 10;
        this.max_pages = options.max_pages || 10;
        this.item_offset = options.item_offset || 0;
        this.total_pages = this.__total_pages();
        this.active_page = this.__active_page();
        this.page_range = this.__page_range();
    };
    ns.Google.prototype = {
        /**
         * A non-zero starting list of numbers representing a page range respecting max_items_page and max_pages constraints.
         */
        __page_range: function() {
            if (this.total_pages==1) {
                return [];
            } else {
                page_mid_point = parseInt(Math.floor(this.max_pages/2), 10);
            }
            if (this.active_page<=page_mid_point) {
                start = 1;
                end = Math.min(this.total_pages, this.max_pages) + 1;
            } else {
                end = Math.min(this.active_page+page_mid_point, this.total_pages) + 1;
                start =  Math.max(end - this.max_pages, 1);
            }
            return ns.range(start, end);
        },     
        __total_pages: function() {
            return parseInt(Math.ceil(this.item_count/this.max_items_page), 10);
        },
        __active_page: function() {
            return parseInt(Math.floor((this.item_offset/this.max_items_page) + 1), 10);
        },
        next_exists: function() {
            if (this.page_range.length == 0) {
                return false;
            }
            if (this.active_page < this.total_pages) {
                return true;
            } else {
                return false;
            }
        },
        next_offset: function() {
            if (this.next_exists()) {
                page = this.active_page + 1;
                return this.page_item_offset(page);
            } else {
                return -1;
            }
        },
        previous_exists: function() {
            if (this.page_range.length == 0) {
                return false;
            }
            if (this.active_page > 1) {
                return true;
            }
            return false;
        },
        previous_offset: function() {
            if (this.previous_exists()) {
                var page = this.active_page - 1;
                return this.page_item_offset(page);
            }
            return -1;
        },
        page_item_offset: function(page_num) {
            return (this.max_items_page * page_num) - this.max_items_page;
        },
        is_active_page: function(page_num) {
            if (page_num==this.active_page) {
                return true;
            }
            return false;
        }
    };
})(Splunk.namespace('Splunk.paginator'));
