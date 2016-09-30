/*global define*/
define([
    'underscore',
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
            this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
            this.component = options.model.component;
            this.model = options.model.entity;
        },

        render: function () {
            var header = this.component.header,
                moreInfo = this.component.moreInfo;

            this.$el.html(_.template(this.template, {cols: header.length + 1}));
            _.each(moreInfo, function (m) {
                if (this.model.entry.content.attributes.hasOwnProperty(m.field)) {
                    // Specific code for Nessus add-on to hide batch_size field
                    if (m.field === 'batch_size' && this.model.entry.content.attributes.hasOwnProperty('server')) {
                        return;
                    }
                    
                    this.$('.list-dotted').append('<dt>' + m.label + '</dt><dd>' +
                        (m.mapping ? m.mapping(this.model.entry.content.attributes[m.field]) : this.model.entry.content.attributes[m.field]) +
                        '</dd>');
                } else if (this.model.entry.hasOwnProperty(m.field)){
                    this.$('.list-dotted').append('<dt>' + m.label + '</dt><dd>' +
                        (m.mapping ? m.mapping(this.model.entry.attributes[m.field]) : this.model.entry.attributes[m.field]) +
                        '</dd>');
                }
            }.bind(this));

            return this;
        },

        template: '<td class="details" colspan="<%= cols %>"><dl class="list-dotted"></dl></td>'
    });
});
