define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'splunk.util',
        'helpers/user_agent'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        util,
        user_agent
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'thead',
            /**
             * @param {Object} options {
             *     model: <model.services.SavedSearch> (Optional),
             *     labels: <Array>,
             *     allowRowExpand: true|false
             *     allowLineNum: true|false,
             *     showWarnings: true|false
             * }
             */
            initialize: function() {
                var defaults = {
                    allowLineNum: true,
                    labels: []
                };
                this.options = $.extend(true, defaults, this.options);
                BaseView.prototype.initialize.apply(this, arguments);
            },
            updateLabels: function(labels) {
                if (_.isArray(labels) && !_.isEqual(this.options.labels, labels)) {
                    this.options.labels = labels;
                    this.render();                    
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    is_ie7: (user_agent.isIE7() || (user_agent.isIE() && user_agent.isInIE7DocumentMode())) ? 'ie7': '',
                    is_ie8: user_agent.isIE8() ? 'ie8': '',
                    labels: this.options.labels || [],
                    allowRowExpand: this.options.allowRowExpand,
                    allowLineNum: this.options.allowLineNum,
                    showWarnings: this.options.showWarnings
                }));
                return this;
            },
            template: '\
                <tr>\
                    <% if (allowRowExpand) { %>\
                        <th class="col-info"><i class="icon-info"></i></th>\
                    <% } %>\
                    <% if (allowLineNum) { %>\
                        <th class="line-num <%- is_ie7 %> <%- showWarnings ? "merge-right": "" %>">&nbsp;</th>\
                    <% }%>\
                    <% if (showWarnings) { %>\
                        <th class="col-warnings">&nbsp;</th>\
                    <% } %>\
                    <% _.each(labels, function(label, index) { %>\
                        <% if (index == labels.length-1) { %>\
                            <th class="col-<%- index %> <%- is_ie7 %> <%- is_ie8 %>"><%- _(label).t() %></th>\
                        <% } else { %>\
                            <th class="col-<%- index %> <%- is_ie7 %>"><%- _(label).t() %></th>\
                        <% } %>\
                    <% }) %>\
                </tr>\
            '
        });
    }
);
