define([
    'lodash',
    'views/Base',
    'app/util/Util'
], function (
    _,
    BaseView,
    Util
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

            this.$el.html(
                _.template(this.template)({cols: header.length + 1})
            );

            _.each(moreInfo, m => {
                const {label, field, mapping} = m;
                let value;
                if (entry.content.get(field) != undefined) {
                    value = entry.content.get(field);
                } else {
                    value = entry.get(field);
                }
                if (value !== undefined && value !== '') {
                    // prevent html injection
                    if (mapping) {
                        value = !_.isUndefined(mapping[value]) ?
                            mapping[value] : value;
                    }
                    this.$('.list-dotted').append(`
                        <dt>${_(label).t()}</dt>
                        <dd>${Util.encodeHTML(value)}</dd>
                    `);
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
