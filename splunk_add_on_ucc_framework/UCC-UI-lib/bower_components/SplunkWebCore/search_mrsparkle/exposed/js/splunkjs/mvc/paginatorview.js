// 

define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var mvc = require('./mvc');
    var BaseSplunkView = require("./basesplunkview");
    var Settings = require("./settings");

    var DEFAULT_PAGE = 0;
    var DEFAULT_PAGE_SIZE = 10;
    
    require("css!../css/paginator.css");

    var PaginatorView = BaseSplunkView.extend(/** @lends splunkjs.mvc.PaginatorView.prototype */{
        moduleId: module.id,
        
        className: "splunk-paginator",

        events: {
            "click a": "onPageClick"
        },

        options: {
            itemCount: -1,
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE
        },

        initialize: function() {
            this.configure();
            this.settings.on("change", this.render, this);
        },

        hide: function() {
            this.$el.css("display", "none");
        },
        
        render: function(content) {
            this.$el.empty();

            var pageSize = this.settings.get("pageSize");
            var itemCount = this.settings.get("itemCount");

            if (itemCount <= pageSize)  {
                return this;
            }

            var page = this.settings.get("page");

            var pageCount = Math.ceil(itemCount / pageSize);
            var windowSize = Math.min(10, pageCount);

            if (page > pageCount) {
                page = pageCount - 1;
                this.settings.set({page: page});
            }

            var page0, pageN;

            // First guess at start page based on assumption current page 
            // is centered in window, then calculate end page and clip if
            // needed, then adjust start page if needed so we show a full
            // window.

            page0 = Math.max(0, page - windowSize/2);
            pageN = Math.min(pageCount, page0 + windowSize) - 1;
            page0 = Math.max(0, pageN - windowSize + 1);

            // assert (pageN-page0) <= windowSize
            // assert page0 <= page <= pageN

            var link = function(num) {
                return "<a href='#' data-page='" + num + "'/>";
            };
            var disabled = '<a href="#" class="disabled"/>';
            var selected = '<a href="#" class="selected"/>';

            var list = this.$el;
            var item = $(page == 0 ? disabled : link("prev"), list);
            item.html("&laquo; "+_("prev").t()).appendTo(list);
            var i;
            for (i = page0; i <= pageN; ++i) {
                item = $(i == page ? selected : link(i));
                item.text(i + 1).appendTo(list);
            }
            item = $(page == pageN ? disabled : link("next"), list);
            item.html(_("next").t()+" &raquo;").appendTo(list);

            return this;
        },

        show: function() {
            this.$el.css("display", "");
        },
        
        onPageClick: function(e) {
            e.stopPropagation();
            e.preventDefault();

            if($(e.currentTarget).is('.selected,.disabled')) {
                return;
            }
            
            var dataPage = $(e.currentTarget).attr("data-page");

            var page = this.settings.get("page");
            switch (dataPage) {
            case "prev":
                if(e.shiftKey) {
                    page = 0;
                } else {
                    page -= 1;
                }
                break;
            case "next":
                if(e.shiftKey) {
                    var itemCount = this.settings.get('itemCount'), pageSize = this.settings.get('pageSize');
                    page = parseInt(itemCount/pageSize, 10) - (itemCount % pageSize == 0 ? 1 : 0);
                } else {
                    page += 1;
                }
                break;
            default:
                page = parseInt(dataPage, 10);
                break;
            }

            this.settings.set({page: page});
        }
    });
    
    return PaginatorView;
});
