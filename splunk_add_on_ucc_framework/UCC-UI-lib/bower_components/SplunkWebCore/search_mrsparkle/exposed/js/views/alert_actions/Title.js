define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route'
    ],
    function(
        _,
        module,
        BaseView,
        route
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
                    canViewRemoteApps: this.model.user.canViewRemoteApps()
                }));
                return this;
            },
            events: {
                'click .browseMore': function(e) {
                    e.preventDefault();
                    var url = route.manager(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), 'appsremote',{'data': {'content':'alert_actions'}} );
                    document.location.href = url;
                }
            },
            template: '\
                <% if (!isLite && canViewRemoteApps) { %>\
                <div class="pull-right">\
                    <button class="btn btn-primary browseMore"><%- _("Browse more").t() %></button>\
                </div>\
                <% } %>\
                <h2 class="section-title"><%- _("Alert Actions").t() %></h2>\
                    <p><%- _("Review and manage available alert actions").t() %></p>\
                <div class="clearfix"></div>\
                '
        });
    }
);
