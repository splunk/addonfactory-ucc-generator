import CreateInputPage from 'app/views/pages/CreateInputPage';
import {
    MODE_CREATE,
    MODE_CLONE,
    MODE_EDIT,
    MODE_DELETE
} from 'app/constants/modes';
import {PAGE_STYLE} from 'app/constants/pageStyle';

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
            // collection, dispatcher, services, navModel
            _.extend(this, options);
        },

        events: {
            'click a': 'create'
        },

        render: function () {
            let html = '<ul class="first-group">';
            _.each(this.services, service => {
                html += '<li><a href="#" class="' + service.name + '">' +
                        _(service.title).t() + '</a></li>';
            });
            html += '</ul>';

            this.el.innerHTML = PopTartView.prototype.template_menu;
            this.$el.append(html);

            this.$el.addClass('dropdown-menu-narrow');
            return this;
        },

        create: function (e) {
            this.serviceType = $(e.target).attr('class');
            let component = _.find(this.services, service => {
                return service.name === this.serviceType;
            })
            if (component && component.style === PAGE_STYLE) {
                this.navModel.navigator.navigate({
                    'service': this.serviceType,
                    'action': MODE_CREATE
                });
            } else {
                let dlg = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: this.collection,
                    component: component
                }).render();
                dlg.modal();
            }
            this.hide();
        }
    });
});
