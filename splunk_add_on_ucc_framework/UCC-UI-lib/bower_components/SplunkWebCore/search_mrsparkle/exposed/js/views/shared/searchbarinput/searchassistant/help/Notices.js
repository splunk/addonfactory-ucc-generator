define(
    [
        'underscore',
        'module',
        'views/Base',
        'splunk.util',
        'uri/route'
    ],
    function(
        _,
        module,
        Base,
        splunkUtil,
        route
    ) {
        return Base.extend({
            moduleId: module.id,
            className: 'search-assistant-help-notices',
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         searchBar: <models.search.SearchBar>
             *         sHelper: <models.search.SHelper>,
             *         application: <models.Application>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.sHelper, "change:considers change:commandErrors change:fieldErrors change:savedSearches change:error", this.debouncedRender);
            },
            getSavedSearchesLinks: function() {
                var savedSearches = this.model.sHelper.get('savedSearches'),
                    savedSearchLinks = [];
                _.each(savedSearches, function(savedSearch) {
                    var search = savedSearch.search,
                        searchRoute = route.search(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), {
                            data: {
                                q: search
                            }
                        });
                    savedSearchLinks.push('<a href="' + searchRoute + '" class="suggested-search" title="' + _.escape(search) + '">' + _.escape(savedSearch.name) + '</a> <a class="suggested-search_secondary secondary-link" href="' + searchRoute + '" target="_blank"><i class="icon-external"></i></a>');
                }, this);
                return savedSearchLinks;
            },
            events: {
                'click .suggested-search': function(e) {
                    this.model.searchBar.set('search', e.currentTarget.title);
                    this.model.searchBar.trigger('resize');
                    e.preventDefault();
                }
            },
            render: function() {
                var template = _.template(this.template, {
                    _: _,
                    sprintf: splunkUtil.sprintf,
                    commandErrors: this.model.sHelper.get('commandErrors'),
                    fieldErrors: this.model.sHelper.get('fieldErrors'),
                    error: this.model.sHelper.get('error'),
                    considers: this.model.sHelper.get('considers'),
                    savedSearchesLinks: this.getSavedSearchesLinks(),
                    considerStrings: this.model.sHelper.constructor.CONSIDER_STRINGS
                });
                this.$el.html(template);

                this.model.sHelper.trigger('childRendered');

                return this;
            },
            template: '\
                <% if (error) { %>\
                    <div class="alert alert-error"><i class="icon-alert"/><%- error %></div>\
                <% } else { %>\
                    <% _.each(commandErrors, function(commandError) { %>\
                       <div class="alert alert-warning"><i class="icon-alert"/><%- sprintf(_("Note: Unknown command \'%s\'. Did you mean \'%s\'?").t(), commandError.unknown, commandError.suggestion[0]) %></div>\
                    <% }); %>\
                    <% _.each(fieldErrors, function(fieldError) { %>\
                       <div class="alert alert-warning"><i class="icon-alert"/><%- sprintf(_("Note: Did you mean the %s field?").t(), fieldError.suggestion[0]) %></div>\
                    <% }); %>\
                    <% _.each(considers, function(consider) { %>\
                       <div class="alert alert-warning"><i class="icon-alert"/><%- sprintf(considerStrings[consider.type], consider) %></div>\
                    <% }); %>\
                    <% if (savedSearchesLinks.length > 0) { %>\
                        <% if (savedSearchesLinks.length === 1) { %>\
                            <div class="alert alert-info"><i class="icon-alert"/><%= sprintf(_("Note: Your search looks similar to the savedsearch %s").t(), savedSearchesLinks[0]) %></div>\
                        <% } else { %>\
                            <div class="alert alert-info"><i class="icon-alert"/><%= sprintf(_("Note: Your search looks similar to the savedsearches %s and %s").t(), savedSearchesLinks[0], savedSearchesLinks[1]) %></div>\
                        <% } %>\
                    <% } %>\
                <% } %>\
            '
        });
    }
);
