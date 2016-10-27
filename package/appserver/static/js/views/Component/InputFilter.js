/*global define*/
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
            var html = '<ul class="first-group">' +
                '<li><a href="#" class="all">All</a></li></ul>' +
                '<ul class="second-group">';
            _.each(this.services, service => {
                html += '<li><a href="#" class="' + service.name + '">' +
                    service.title + '</a></li>';
            });
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
