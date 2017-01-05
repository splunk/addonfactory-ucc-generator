import {getFormattedMessage} from 'app/util/messageUtil';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/views/component/InputFilter'
], function (
    $,
    _,
    Backbone,
    InputFilter
) {
    return Backbone.View.extend({
        className: 'type-filter',
        events: {
            'mousedown a.dropdown-toggle': function (e) {
                this.filter(e);
            },
            'keydown a.dropdown-toggle': function (e) {
                if (e.which === 13) {  //Enter is pressed
                    this.filter(e);
                    e.preventDefault();
                }
            },
            'click a.dropdown-toggle': function (e) {
                e.preventDefault();
            }
        },
        initialize: function (options) {
            this.dispatcher = options.dispatcher;
            this.services = options.services;
            this.dispatcher.on('filter-change', function (type) {
                this.changeType(type);
            }.bind(this));
            this.inputFilterLabel = getFormattedMessage(106);
        },

        render: function () {
            this.$el.html(_.template(this.template)({
                inputFilterLabel: this.inputFilterLabel
            }));
            return this;
        },

        changeType: function (type) {
            const service = _.find(this.services, d => d.name === type);
            this.$('a.dropdown-toggle').empty();
            if (type === 'all') {
                this.$('a.dropdown-toggle').append(_.template('<%- _("All").t() %>'));
            } else {
                this.$('a.dropdown-toggle').append(_.template(_(service.title).t()));
            }
            this.$('a.dropdown-toggle').append($('<span class="caret"></span>'));
        },

        filter: function (e) {
            var $target = $(e.currentTarget);
            if (this.inputFilter && this.inputFilter.shown) {
                this.inputFilter.hide();
                e.preventDefault();
                return;
            }

            this.inputFilter = new InputFilter({
                dispatcher: this.dispatcher,
                services: this.services
            });
            $('body').append(this.inputFilter.render().el);
            this.inputFilter.show($target);
        },

        template: `
            <%- inputFilterLabel %> :
            <a class="dropdown-toggle" href="#">
                <%- _("All").t() %><span class="caret"></span>
            </a>
        `
    });
});
