define(
    [
        'jquery',
        'underscore',
        'moment',
        'module',
        'views/Base',
        'util/string_utils',
        'util/time',
        'splunk.util',
        'splunk.i18n',
        'uri/route'
    ],
    function(
        $,
        _,
        moment,
        module,
        BaseView,
        stringUtil,
        timeUtil,
        splunkUtil,
        i18n,
        route
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            className: 'search-history-row',
            tagName: 'tr',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.nameSpace = this.uniqueNS();
                this.$el.addClass(this.options.isAccordion  ? 'more-info' : 'expand');
                if (this.options.isAccordion ) {
                    this.$el.hide();
                }
                this.activate();
            },
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                $(window).on('resize.' + this.nameSpace, this.disableNonTruncated.bind(this));
                return BaseView.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                $(window).off('resize.' + this.nameSpace);
                return BaseView.prototype.deactivate.apply(this, arguments);
            },
            events: {
                'click a.search-link': function(e) {
                    if (!e.metaKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.model.searchBar.set({search: this.searchText || "" }, {skipOpenAssistant: true});
                        this.model.searchBar.trigger('resize');
                    }
                },
                'expand': 'onExpanded',
                'collapse': 'onCollapsed'
            },
            onExpanded: function() {
                this.$('.search').addClass("details").removeClass("search").attr("rowspan", "2");
                setTimeout(this.disableNonTruncated.bind(this), 0);
            },
            onCollapsed: function() {
                this.$('.details').removeClass("details").addClass("search").removeAttr("rowspan");
                setTimeout(this.disableNonTruncated.bind(this), 0);
            },
            render: function() {
                this.searchText = stringUtil.stripSearchFromSearchQuery(_.first(this.model.fetchData.get('search')) || "");
                var searchLink = route[this.model.application.get('page') || "page"](
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get("app"),
                        {
                            data: {
                                q: this.searchText
                            }
                        }
                );
                this.$el.html(this.compiledTemplate({
                    _: _,
                    searchLink: searchLink,
                    search: this.searchText,
                    time: timeUtil.makeTodayRelativeWithNoTimeZone(_.first(this.model.fetchData.get('_time')) || {}),
                    isAccordion: this.options.isAccordion
                }));
                return this;
            },
            disableNonTruncated: function() {
                if (!this.$('td.search > span').is(":visible") || this.$el.hasClass('more-info')) {
                    return;
                }
                var $element = this.$('td.search'),
                    $testTr = $('<tr class="expand search-history-row search-searchhistory-tablerow odd"></tr>')
                        .css({width: 'auto', visibility: 'hidden'});
                this.$('td.expands')
                    .clone()
                    .css({width: 'auto', visibility: 'hidden'})
                    .appendTo($testTr);

                var $c = $element
                    .clone()
                    .css({width: 'auto', visibility: 'hidden'})
                    .removeClass('search')
                    .addClass('details')
                    .appendTo($testTr);

                this.$('td.search-action')
                    .clone()
                    .css({width: 'auto', visibility: 'hidden'})
                    .appendTo($testTr);

                this.$('td.time-ran')
                    .clone()
                    .css({width: 'auto', visibility: 'hidden'})
                    .appendTo($testTr);

                $testTr.appendTo('tbody.search-content');
                if (this.searchText.search(/\r|\n/g) != -1 ||  parseFloat($c.css('height')) > parseFloat($element.css("height"))) {
                    this.$('td.expands').removeClass('disabled').find('a').removeAttr('tabindex');
                } else {
                    this.$('td.expands').addClass('disabled').find('a').attr('tabindex', -1);
                }

                $testTr.remove();
            },
            template: '\
                <% if (!isAccordion) { %>\
                    <td class="expands show-details disabled" rowspan="1">\
                        <a href="#">\
                            <i class="icon-triangle-right-small"></i>\
                        </a>\
                    </td>\
                    <td class="search" data-key="search">\
                        <span title="<%-search%>"><%-search%></span>\
                    </td>\
                    <td class="search-action">\
                        <a class="search-link" href="<%-searchLink%>"><%= _("Add to Search").t() %></a>\
                    </td>\
                    <td class="time-ran" data-key="timeRan">\
                        <span><%-time%></span>\
                    </td>\
                <% } else { %>\
                    <td></td>\
                    <td></td>\
                <% } %>\
            '
        });
    }
);

