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
            tagName: 'tr',
            /**
             * @param {Object} options {
             *     model: {
             *          alertAdmin: <Services.Admin.Alert>
             *          application: <models.Application>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    index: this.options.index,
                    triggerTime: this.model.alertAdmin.entry.content.get('trigger_time_rendered'),
                    viewResults: route.search(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        { data: { sid: this.model.alertAdmin.entry.content.get('sid')}})
                }));
                return this;
            },
            template: '\
                <td class="index"><%= index %></td>\
                <td class="trigger-time"><%= triggerTime %></td>\
                <td class="actions">\
                    <a href="<%= viewResults %>"><%- _("View Results").t() %></a>\
                </td>\
            '
        });
    }
);

