define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'contrib/text!views/clustering/push/PushErrors.html'
],
    function(
        $,
        _,
        module,
        BaseView,
        Template
        ) {
        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.model.pushModel.on('tick', this.render, this);
            },
            render: function() {
                var pushErrors = this.model.pushModel.get('errors');
                var html = this.compiledTemplate({
                    errors: pushErrors
                });
                this.$el.html(html);
            }
        });

    });