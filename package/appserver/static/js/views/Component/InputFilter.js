/*global define*/
define([
    'jquery',
    'views/shared/PopTart'
], function (
    $,
    PopTartView
) {
    return PopTartView.extend({
        className: 'dropdown-menu',

        events: {
            'click a': 'changeFilter'
        },

        initialize: function (options) {
            PopTartView.prototype.initialize.apply(this, arguments);
            this.dispatcher = options.dispatcher;
            this.services = options.services;
        },

        render: function () {
            var html = '<ul class="first-group"><li><a href="#" class="all">All</a></li></ul><ul class="second-group">',
                service;
            for (service in this.services) {
                if (this.services.hasOwnProperty(service)) {
                    html += '<li><a href="#" class="' + service + '">' + this.services[service].title + '</a></li>';
                }
            }
            html += '</ul>';

            this.el.innerHTML = PopTartView.prototype.template_menu;
            this.$el.append(html);
            this.$el.addClass('dropdown-menu-narrow');
            return this;
        },

        changeFilter: function (e) {
            this.hide();
            var service_type = $(e.target).attr('class');
            this.dispatcher.trigger('filter-change', service_type);
        }
    });
});
