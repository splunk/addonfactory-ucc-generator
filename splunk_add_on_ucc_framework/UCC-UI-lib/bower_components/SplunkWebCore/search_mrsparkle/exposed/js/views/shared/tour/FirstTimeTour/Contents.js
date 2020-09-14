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
            render: function() {
                var html = this.compiledTemplate({
                    introText: this.options.introText
                });

                this.$el.html(html);

                return this;
            },
            template: '<%= introText %>'
        });
    }
);
