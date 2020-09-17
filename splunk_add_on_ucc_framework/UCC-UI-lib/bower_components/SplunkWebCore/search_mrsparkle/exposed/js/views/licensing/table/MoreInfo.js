define(
    [
        'module',
        'views/Base',
        'views/licensing/table/Details'
    ],
    function(
        module,
        BaseView,
        DetailView
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
                this.children.details = new DetailView({
                    model: {
                        serverInfo: this.model.serverInfo,
                        license: this.model.license
                    }
                });
            },

            render: function() {
                this.$el.html(this.compiledTemplate({}));
                this.children.details.render().appendTo(this.$('td.details'));
                return this;
            },

            template: '\
                <td class="details" colspan="3">\
                </td>\
            '
        });
    }
);