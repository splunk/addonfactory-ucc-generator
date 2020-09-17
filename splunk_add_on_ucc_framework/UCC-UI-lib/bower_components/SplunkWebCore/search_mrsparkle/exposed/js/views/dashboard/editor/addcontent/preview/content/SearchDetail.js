define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'splunk.util'
    ],
    function(module,
             $,
             _,
             BaseView,
             splunkUtil) {
        
        var SearchDetail = BaseView.extend({
            moduleId: module.id,
            tagName: 'span',
            render: function() {
                var searchString = this.model.report.entry.content.get('search');
                this.$el.html(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil,
                    searchString: searchString
                }));
                return this;
            },
            template: '\
                    <dt class="acceleration"><%- _("Search String").t() %></dt>\
                    <dd class="acceleration">\
                        <%- splunkUtil.sprintf(_("%s").t(), searchString) %>\
                    </dd>\
                '
        });

        return SearchDetail;
    });