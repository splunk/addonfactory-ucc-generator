/*global define*/
define([
    'jquery',
    'backbone',
    'app/views/Component/InputFilter'
], function (
    $,
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
        },

        render: function () {
            this.$el.html(this.template);
            return this;
        },

        changeType: function (type) {
            this.$('a.dropdown-toggle').empty();
            this.$('a.dropdown-toggle').append('Service : ');
            this.$('a.dropdown-toggle').append(type === 'all' ? 'All' : this.services[type].title);
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

        template: '<a class="dropdown-toggle" href="#">Service : All<span class="caret"></span></a>'
    });
});
