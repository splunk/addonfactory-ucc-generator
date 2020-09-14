import WaitSpinner from 'app/views/component/WaitSpinner';

define([
    'views/Base',
    'lodash'
], function(
    BaseView,
    _
){
    return BaseView.extend({
        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            const waitspinner = new WaitSpinner({});
            this.$el.html(_.template(this.template));
            this.$('.wait-spinner').append(waitspinner.render().$el);
        },

        template: `
            <span class="wait-spinner"></span>
            <span><%- _('Saving...').t() %></span>
        `
    });
});
