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
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'p',
            className: 'bg-success-message',

            render: function() {
                var html = this.compiledTemplate({
                    message: this.options.message
                });
                this.$el.html(html);
                return this;
            },
            template: '<%- message %>'
        });
    }
);
