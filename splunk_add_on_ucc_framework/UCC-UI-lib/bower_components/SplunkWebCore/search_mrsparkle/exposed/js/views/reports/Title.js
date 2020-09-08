define(
    [
        'underscore',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function(
        _,
        module,
        BaseView,
        splunkUtil
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    isLite: this.model.serverInfo.isLite(),
                    title:  (this.model.state && this.model.state.get('namespace')) ?
                        splunkUtil.sprintf(_("Reports for %s").t(), this.model.state.get('namespace')) :
                        _("Reports").t()
                }));
                return this;
            },
            template: '\
                <h2 class="section-title"><i class="icon-report"></i> <%- title %></h2>\
                <p class="section-description">\
                    <% if (isLite) { %>\
                        <%- _("Reports are based on single searches and can include visualizations, statistics and/or events.").t() %>\
                    <% } else { %>\
                        <%- _("Reports are based on single searches and can include visualizations, statistics and/or events. Click the name to view the report. Open the report in Pivot or Search to refine the parameters or further explore the data.").t() %>\
                    <% } %>\
                </p>\
            '
        });
    }
);
