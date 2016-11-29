define([
    'lodash',
    'views/Base'
], function (
    _,
    BaseView
) {
    return BaseView.extend({
        tagName: 'tr',
        className: 'more-info',

        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.addClass((options.index % 2) ? 'even' : 'odd')
                .css('display', 'none');
        },

        render: function () {
            // TODO: Component shouldn't care about how these data are retrived.
            const {header, moreInfo} = this.options.model.component.table;
            const {entry} = this.options.model.entity;

            this.$el.html(_.template(this.template)({cols: header.length + 1}));

            _.each(moreInfo, m => {
                const {label, field} = m;
                let value;
                if (entry.content.attributes[field] != undefined) {
                    value = String(entry.content.attributes[field]);
                } else {
                    value = String(entry.attributes[field]);
                }
                this.$('.list-dotted').append(_.template(`
                    <dt><%- _(label).t() %></dt>
                    <dd><%- value %></dd>
                `)({label, value}));
            });
            return this;
        },

        template: `
            <td class="details" colspan="<%- cols %>">
                <dl class="list-dotted"></dl>
            </td>
        `
    });
});
