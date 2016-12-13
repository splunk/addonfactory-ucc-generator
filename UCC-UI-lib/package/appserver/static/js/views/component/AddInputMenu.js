define([
    'lodash',
    'jquery',
    'app/util/Util',
    'views/shared/PopTart',
    'app/views/component/EntityDialog'
], function (
    _,
    $,
    Util,
    PopTartView,
    EntityDialog
) {
    return PopTartView.extend({
        className: 'dropdown-menu',
        initialize: function (options) {
            _.bindAll(this, 'create');
            PopTartView.prototype.initialize.apply(this, arguments);
            this.collection = options.collection;
            this.dispatcher = options.dispatcher;
            this.services = options.services;
        },

        events: {
            'click a': 'create'
        },

        render: function () {
            var html = '<ul class="first-group">',
                service;
            for (service in this.services) {
                if (this.services.hasOwnProperty(service)) {
                    html += '<li><a href="#" class="' + service + '">' +
                        _(this.services[service].title).t() + '</a></li>';
                }
            }
            html += '</ul>';

            this.el.innerHTML = PopTartView.prototype.template_menu;
            this.$el.append(html);

            this.$el.addClass('dropdown-menu-narrow');
            return this;
        },

        create: function (e) {
            this.serviceType = $(e.target).attr('class');
            var dlg = new EntityDialog({
                el: $(".dialog-placeholder"),
                collection: this.collection,
                component: this.services[this.serviceType],
                isInput: true
            }).render();
            dlg.modal();
            this.hide();
        }
    });
});
