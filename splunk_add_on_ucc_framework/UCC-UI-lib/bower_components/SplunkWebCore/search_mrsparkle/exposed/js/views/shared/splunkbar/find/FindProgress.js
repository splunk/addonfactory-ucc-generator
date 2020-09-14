define(
[
    'underscore',
    'jquery',
    'module',
    'views/shared/PopTart',
    'views/shared/Icon',
    'views/shared/splunkbar/find/ProgressSpinner',
    './FindProgress.pcssm',
    'uri/route',
    'splunk.util'
],
function(
    _,
    $,
    module,
    PopTartView,
    IconView,
    ProgressSpinner,
    css,
    route,
    splunkUtils
){
    return PopTartView.extend({
        moduleId: module.id,
        css: css,
        initialize: function() {
            PopTartView.prototype.initialize.apply(this, arguments);

            this.children.external = new IconView({icon: 'external'});

            this.$el.attr('class', css.view);
        },
        render: function() {
            this.el.innerHTML = '';

            // Open "keyword" in new search
            var searchLink = route.search(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'search',
                    {data: {q: this.model.rawSearch.get('rawSearch')}}
                );

            var html = this.compiledTemplate({
                _: _,
                splunkUtils: splunkUtils,
                searchLink: searchLink,
                rawSearch: this.model.rawSearch.get('rawSearch'),
                css: this.css
            });
            this.$el.append(html);

            this.children.spinner = new ProgressSpinner();
            this.$('[data-role=spinner-wrapper]').append(this.children.spinner.render().el);
            this.children.external.render().prependTo(this.$("[data-role=secondary-search-more-link]"));
            return this;
        },
        template: '\
        <div class="<%=css.arrow %>" data-popdown-role="arrow"></div>\
        <div class="<%=css.spinnerWrapper %>" data-role="spinner-wrapper"></div>\
        <% if (rawSearch) { %>\
            <ul class="<%=css.list%>" data-popdown-role="body"><li>\
                <a class="<%=css.primaryLink%>" data-role="search-more-link" href="<%- searchLink %>">\
                    <%- splunkUtils.sprintf(_("Open %s in search").t(), rawSearch) %>\
                </a>\
                <a class="<%=css.secondaryLink%>" data-role="secondary-search-more-link" href="<%- searchLink %>" target="_blank" title="<%- splunkUtils.sprintf(_("Open %s in search in new tab").t(), rawSearch) %>"></a>\
            </li></ul>\
        <% } %>\
        '
    });
});
