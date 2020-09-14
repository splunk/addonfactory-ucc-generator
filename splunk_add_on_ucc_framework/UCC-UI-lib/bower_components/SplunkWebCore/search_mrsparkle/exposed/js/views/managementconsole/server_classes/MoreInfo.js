define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
            },

            render: function() {
                var formatted = this.model.entity.getFormattedDetailValues();
                this.$el.html(this.compiledTemplate({
                    'apps': formatted['@apps'],
                    'machineTypesFilter': formatted['machineTypesFilter'],
                    'blacklist': formatted['blacklist'],
                    'whitelist': formatted['whitelist']
                }));

                return this;
            },

            template: '\
            <td class="details" colspan="5">\
                <dl class="list-dotted">\
                    <dt><%- _("White List Sequence").t() %></dt>\
                    <dd<%= whitelist.value ? "" : " class=\\"not-set\\"" %>><%- whitelist.label %></dd>\
                    <dt><%- _("Black List Sequence").t() %></dt>\
                    <dd<%= blacklist.value ? "" : " class=\\"not-set\\"" %>><%- blacklist.label %></dd>\
                    <dt><%- _("Machine Type Filter").t() %></dt>\
                    <dd<%= machineTypesFilter.value ? "" : " class=\\"not-set\\"" %>><%- machineTypesFilter.label %></dd>\
                    <dt><%- _("Apps Installed").t() %></dt>\
                    <dd<%=  apps.value ? "" : " class=\\"not-set\\"" %>><%- apps.label %></dd>\
                </dl>\
            </td>'
        });
    }
);