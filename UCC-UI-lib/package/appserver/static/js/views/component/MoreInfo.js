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
            const {header, moreInfo} = this.options.model.component.table;
            const {entry} = this.options.model.entity;

            this.$el.html(_.template(this.template)({cols: header.length + 1}));

            _.each(moreInfo, m => {
                const {label, field} = m;
                let value;
                if (entry.content.attributes[field] != undefined) {
                    value = entry.content.attributes[field];
                } else {
                    value = entry.attributes[field];
                }
                // built-in formater for field 'disabled' in UCC 3.0
                if (field === 'disabled') {
                    value = value ? 'Disabled' : 'Enabled';
                }
                if (value !== undefined) {
                    this.$('.list-dotted').append(_.template(`
                        <dt><%- _(label).t() %></dt>
                        <dd><%- value %></dd>
                        `)({label, value})
                    );
                }
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
