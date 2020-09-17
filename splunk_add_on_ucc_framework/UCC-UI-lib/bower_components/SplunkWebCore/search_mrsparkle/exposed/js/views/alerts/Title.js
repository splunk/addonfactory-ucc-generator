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
                    title: (this.model.state && this.model.state.get('namespace')) ?
                        splunkUtil.sprintf(_("Alerts for %s").t(), this.model.state.get('namespace')) :
                        _("Alerts").t()
                }));
                return this;
            },
            template: '\
                <h2 class="section-title"><i class="icon-bell"></i> <%- title %></h2>\
                <p class="section-description">\
                    <% if (isLite) { %>\
                        <%- _("Alerts set a condition that triggers an action, such as sending an email that contains the results of the triggering search to a list of people.").t() %>\
                    <% } else { %>\
                        <%- _("Alerts set a condition that triggers an action, such as sending an email that contains the results of the triggering search to a list of people. Click the name to view the alert. Open the alert in Search to refine the parameters.").t() %>\
                    <% } %>\
                </p>\
            '
        });
    }
);
