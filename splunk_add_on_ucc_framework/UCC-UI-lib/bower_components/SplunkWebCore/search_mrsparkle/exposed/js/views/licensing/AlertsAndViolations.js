define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        BaseView
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            className: 'alerts-violations-inner',
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _ : _,
                    messages: this.collection.messages
                }));
                return this;
            },

            template: '\
                <% messages.each(function(message) { %>\
                    <div class="alert alert-error">\
                        <i class="icon-alert"></i><span><%= _(message.entry.content.get(\'description\')).t() %></span><br/>\
                    </div>\
                <% }) %>\
            '
        });
    }
);