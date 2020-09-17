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
            this.model = options.model;
            this.dispatcher.on('filter-change', (type) => {
                this.changeType(type);
            });
            this.inputFilterLabel = getFormattedMessage(106);
        },

        render: function () {
            this.$el.html(_.template(this.template)({
                inputFilterLabel: this.inputFilterLabel,
                service: this._getInputLabel(this.model.get('service'))
            }));
            return this;
        },

        changeType: function (type) {
            this.$('a.dropdown-toggle').empty();
            this.$('a.dropdown-toggle').append(
                _.template(this._getInputLabel(type))
            );
            this.$('a.dropdown-toggle').append(
                $(`<span class="caret"></span>`)
            );
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

        _getInputLabel: function (type) {
            const service = _.find(this.services, d => d.name === type);
            if (type === 'all') {
                return _("All").t();
            } else {
                return _(service.title).t();
            }
        },

        template: `
            <%- inputFilterLabel %> :
            <a class="dropdown-toggle" href="#">
                <%- service %><span class="caret"></span>
            </a>
        `
    });
});
