define([
    'jquery',
    'lodash',
    'views/shared/PopTart'
], function (
    $,
    _,
    PopTartView
) {
    return PopTartView.extend({
        className: 'dropdown-menu dropdown-menu-narrow',

        events: {
            'click a': 'changeFilter'
        },

        initialize: function (options) {
            PopTartView.prototype.initialize.apply(this, arguments);
            this.dispatcher = options.dispatcher;
            this.services = options.services;
        },

        render: function () {
            this.$el.html(
                _.template(this.template)({services: this.services})
            );
            return this;
        },

        changeFilter: function (e) {
            e.preventDefault();
            this.hide();
            const serviceType = $(e.target).attr('class');
            this.dispatcher.trigger('filter-change', serviceType);
        },

        template: `
            <div class="arrow"></div>
            <ul class="first-group">
                <li><a href="#" class="all"><%- _("All").t() %></a></li>
            </ul>
            <ul class="second-group">
                <% _.each(services, function (service) { %>
                    <li>
                        <a href="#" class="<%- service.name %>">
                            <%- _(service.title).t() %>
                        </a>
                    </li>
                <% }); %>
            </ul>
        `
    });
});
