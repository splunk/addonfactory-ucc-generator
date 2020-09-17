define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'splunk.util',
        'splunk.i18n'
    ],
    function(_, $, module, Base, splunkUtil, i18n) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         sHelper: <models.search.SHelper>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },            
            startListening: function() {
                this.listenTo(this.model.sHelper, 'change:matchingSearches change:matchingTerms', this.debouncedRender);
            },
            render: function() {
                var data = {
                    _: _,
                    matchingTerms: _.first(this.model.sHelper.get("matchingTerms") || [], this.model.sHelper.MAX_MATCHING_TERMS),
                    matchingSearches: _.first(this.model.sHelper.get("matchingSearches") || [], this.model.sHelper.MAX_MATCHING_SEARCHES),
                    mainSearch: this.model.sHelper.get("matchingSearch") || "",
                    parseSearch: this.parseSearch,
                    maxSearchLength: this.model.sHelper.MAX_SEARCH_LENGTH,
                    maxKeywordLength: this.model.sHelper.MAX_KEYWORD_LENGTH,
                    smartTrim: splunkUtil.smartTrim,
                    formatNumber: i18n.format_number
                };
                var template = _.template(this.template, data);
                this.$el.html(template);

                this.model.sHelper.trigger('childRendered');

                return this;
            },
            parseSearch: function(main, sub) {
                var mainSubbed = main.replace(sub, '%s');
                return splunkUtil.sprintf(_.escape(mainSubbed), "<em>" + _.escape(sub) + "</em>");
            },
            template: '\
                <% if (matchingSearches.length > 0){ %><h5><%= _("Matching Searches").t() %></h5>\
                <% _.each(matchingSearches, function(search) { %>\
                    <a class="typeahead-keyword" tabindex="0" title="<%- search %>" data-replacement="<%- search %>" data-type="matchingSearch">\
                    <%= parseSearch(smartTrim(search, maxSearchLength), mainSearch) %></a>\
                <% })} %>\
                <% if (matchingTerms.length > 0 && matchingTerms[0].term !== "*"){ %><h5><%= _("Matching Terms").t() %></h5>\
                <% _.each(matchingTerms, function(match) { %>\
                    <a class="typeahead-keyword" tabindex="0" title="<%- match.term %>" data-replacement="<%- match.replacement %>">\
                    <% if (match.numMatches > 0){ %>\
                        <span><%- formatNumber(match.numMatches) %></span>\
                    <% } %>\
                    <%= parseSearch(smartTrim(match.term, maxKeywordLength), match.matched) %></a>\
                <% })} %>\
            '
        });
    }
);
